"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import {
  egyptOrigins,
  formatDuration,
  globalOrigins,
  journeyIntro,
  type JourneyOrigin,
} from "@/content/journey";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/hooks/useReducedMotion";
import { Container } from "@/components/layout/Container";
import { GoogleMapsButton } from "@/components/ui/GoogleMapsButton";
import { Icon } from "@/components/ui/Icon";

/*
 * Two layers in one Web Mercator space (full scale: 2083.8 px per radian):
 * - a light whole-world base (Natural Earth land in the artwork's colours, stored at 1/4 scale);
 * - the detailed Figma map artwork, calibrated against coastline landmarks and feathered into it.
 * Coordinates below are full-scale world pixels, so a route from any capital fits on the map.
 */
const K = 2083.8;
const TOP = 2.0275894218; // Mercator y of 75°N, the top edge of the world layer
const MAP = { width: 13092.9, height: 6969.37 };
const WORLD = "/images/home/journey-world.webp";
const DETAIL = {
  src: "/images/home/journey-detail.webp",
  x: 6029.35,
  y: 2342.19,
  width: 2866,
  height: 1430,
};
const project = (lng: number, lat: number) => ({
  x: K * ((lng * Math.PI) / 180 + Math.PI),
  y: K * (TOP - Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))),
});
/** Deepest zoom (short drives such as Hurghada). Past the artwork's sharp range (~2.8×) a
 * vector coastline in the same colours takes over so the map stays crisp. */
const MAX_SCALE = 40;
const COAST = "/data/journey-coast.json";
/** Sharpest zoom for the artwork, and where the vector coastline fully takes over. */
const ARTWORK_SCALE = 2.8;
const VECTOR_FROM = 9;
type Point = { x: number; y: number };

const DESTINATION = project(siteConfig.location.longitude, siteConfig.location.latitude);

type Tab = "egypt" | "global";
type View = { s: number; x: number; y: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Road geometry for drives, a straight line for flights; always ends at Somabay. */
const routeOf = (origin: JourneyOrigin): Point[] =>
  origin.route
    ? [...origin.route.map(([lng, lat]) => project(lng, lat)), DESTINATION]
    : [project(origin.lng, origin.lat), DESTINATION];

/** Point halfway along a polyline, by length. */
const midpoint = (points: Point[]): Point => {
  const lengths = points
    .slice(1)
    .map((point, index) => Math.hypot(point.x - points[index].x, point.y - points[index].y));
  let remaining = lengths.reduce((sum, length) => sum + length, 0) / 2;
  for (let index = 0; index < lengths.length; index++) {
    if (remaining <= lengths[index]) {
      const t = lengths[index] ? remaining / lengths[index] : 0;
      return {
        x: points[index].x + (points[index + 1].x - points[index].x) * t,
        y: points[index].y + (points[index + 1].y - points[index].y) * t,
      };
    }
    remaining -= lengths[index];
  }
  return points[points.length - 1];
};

/** Badge on the starting pin: the country for global cities, the city for Egyptian ones. */
const originLabel = (origin: JourneyOrigin) =>
  origin.mode === "plane" ? (origin.name.split(", ").pop() ?? origin.name) : origin.name;

/**
 * Figma "Map" (363:3126): the map artwork full-bleed with a card to pick where you travel from.
 * Choosing a city glides the map to frame the route and redraws the dotted line to Somabay,
 * with a car (Egypt) or plane (global) marker at its midpoint.
 */
export function JourneyMap() {
  const [origin, setOrigin] = useState<JourneyOrigin>(egyptOrigins[0]);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("egypt");
  const [query, setQuery] = useState("");
  const listId = useId();
  const maskId = `journey-reveal-${listId.replace(/[^a-zA-Z0-9-]/g, "")}`;

  const stage = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const line = useRef<SVGPolylineElement>(null);
  const reveal = useRef<SVGPolylineElement>(null);
  const coast = useRef<SVGGElement>(null);
  const [coastData, setCoastData] = useState<{
    bounds: number[];
    d: string;
    roads?: string;
  } | null>(null);
  const fromPin = useRef<HTMLSpanElement>(null);
  const toPin = useRef<HTMLSpanElement>(null);
  const mode = useRef<HTMLSpanElement>(null);
  const view = useRef<View | null>(null);

  const options = useMemo(() => {
    const list = tab === "egypt" ? egyptOrigins : globalOrigins;
    const term = query.trim().toLowerCase();
    return term ? list.filter((item) => item.name.toLowerCase().includes(term)) : list;
  }, [tab, query]);

  /** Writes a view (scale + offset) to the map and moves the route, pins and coastline with it. */
  const paint = useCallback((next: View, path: Point[]) => {
    view.current = next;
    const toScreen = (point: Point) => ({
      x: point.x * next.s + next.x,
      y: point.y * next.s + next.y,
    });
    const screen = path.map(toScreen);
    if (layer.current) {
      layer.current.style.transform = `translate3d(${next.x}px, ${next.y}px, 0) scale(${next.s})`;
    }
    if (coast.current) {
      coast.current.setAttribute(
        "transform",
        `matrix(${next.s} 0 0 ${next.s} ${next.x} ${next.y})`,
      );
      coast.current.style.opacity = String(
        clamp((next.s - ARTWORK_SCALE) / (VECTOR_FROM - ARTWORK_SCALE), 0, 1),
      );
    }
    const points = screen.map((point) => `${point.x},${point.y}`).join(" ");
    line.current?.setAttribute("points", points);
    reveal.current?.setAttribute("points", points);
    const place = (el: HTMLElement | null, point: Point) => {
      if (el)
        el.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -50%)`;
    };
    place(fromPin.current, screen[0]);
    place(toPin.current, screen[screen.length - 1]);
    place(mode.current, midpoint(screen));
  }, []);

  /** The view that frames the route beside the card, never leaving the artwork's edges. */
  const frame = useCallback((path: Point[]): View | null => {
    const el = stage.current;
    if (!el) return null;
    const width = el.clientWidth;
    const height = el.clientHeight;
    const cardBox = card.current?.getBoundingClientRect();
    const stageBox = el.getBoundingClientRect();
    const wide = width >= 768;
    const pad = {
      left: wide && cardBox ? cardBox.right - stageBox.left + 80 : 40,
      top: !wide && cardBox ? cardBox.bottom - stageBox.top + 40 : 120,
      right: 80,
      bottom: 80,
    };
    const xs = path.map((point) => point.x);
    const ys = path.map((point) => point.y);
    const box = {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };
    const cover = Math.max(width / MAP.width, height / MAP.height);
    const fit = Math.min(
      (width - pad.left - pad.right) / Math.max(box.maxX - box.minX, 1),
      (height - pad.top - pad.bottom) / Math.max(box.maxY - box.minY, 1),
    );
    // Keep the detailed artwork for regional routes; only short drives zoom past it.
    const raw = clamp(fit, cover, MAX_SCALE);
    const s = raw > ARTWORK_SCALE && raw < VECTOR_FROM ? ARTWORK_SCALE : raw;
    const centre = { x: (box.minX + box.maxX) / 2, y: (box.minY + box.maxY) / 2 };
    const target = {
      x: pad.left + (width - pad.left - pad.right) / 2,
      y: pad.top + (height - pad.top - pad.bottom) / 2,
    };
    return {
      s,
      x: clamp(target.x - centre.x * s, width - MAP.width * s, 0),
      y: clamp(target.y - centre.y * s, height - MAP.height * s, 0),
    };
  }, []);

  // Glide to the chosen route and draw its line in.
  useEffect(() => {
    const path = routeOf(origin);
    const next = frame(path);
    if (!next) return;
    const start = view.current;
    const reduced = prefersReducedMotion();
    if (!start || reduced) {
      paint(next, path);
      return;
    }
    const state = { ...start };
    const tween = gsap.to(state, {
      ...next,
      duration: 1.8,
      ease: "power3.inOut",
      onUpdate: () => paint(state, path),
    });
    const draw = gsap.fromTo(
      reveal.current,
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 1.2, delay: 0.5, ease: "power2.out" },
    );
    return () => {
      tween.kill();
      draw.kill();
    };
  }, [origin, frame, paint]);

  // Keep the framing correct when the section resizes.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const path = routeOf(origin);
      const next = frame(path);
      if (next) paint(next, path);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [origin, frame, paint, coastData]);

  // Load the vector coastline used for close-up drives once the map is near.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        fetch(COAST)
          .then((response) => response.json())
          .then(setCoastData)
          .catch(() => {});
      },
      { rootMargin: "600px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const choose = (item: JourneyOrigin) => {
    setOrigin(item);
    setOpen(false);
    setQuery("");
  };

  const directionsHref = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${encodeURIComponent("Somabay, Egypt")}`;

  return (
    <section
      aria-labelledby="journey-title"
      data-theme-surface="light"
      className="relative isolate h-svh min-h-[40rem] overflow-hidden bg-[#e4e9ef]"
    >
      <div
        ref={stage}
        role="img"
        aria-label={`Map of the route from ${origin.name} to Somabay`}
        className="absolute inset-0 overflow-hidden"
      >
        <div
          ref={layer}
          className="absolute top-0 left-0 origin-top-left"
          style={{ width: MAP.width, height: MAP.height }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size map layer */}
          <img
            src={WORLD}
            alt=""
            draggable={false}
            className="absolute inset-0 size-full max-w-none"
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size artwork layer */}
          <img
            src={DETAIL.src}
            alt=""
            draggable={false}
            width={DETAIL.width}
            height={DETAIL.height}
            className="absolute max-w-none"
            style={{ left: DETAIL.x, top: DETAIL.y }}
          />
        </div>
        <svg aria-hidden className="pointer-events-none absolute inset-0 size-full">
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse">
              <polyline
                ref={reveal}
                fill="none"
                stroke="#fff"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray="1 1"
              />
            </mask>
          </defs>
          {coastData ? (
            <g ref={coast} style={{ opacity: 0 }}>
              <rect
                x={coastData.bounds[0]}
                y={coastData.bounds[1]}
                width={coastData.bounds[2] - coastData.bounds[0]}
                height={coastData.bounds[3] - coastData.bounds[1]}
                fill="#b9c7d5"
              />
              <path d={coastData.d} fill="#e4e9ef" fillRule="evenodd" />
              {coastData.roads ? (
                <path
                  d={coastData.roads}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}
            </g>
          ) : null}
          <polyline
            ref={line}
            mask={`url(#${maskId})`}
            fill="none"
            stroke="var(--color-turquoise-160)"
            strokeWidth="2"
            strokeDasharray="2 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span ref={fromPin} aria-hidden className="absolute top-0 left-0">
          <span className="journey-pin journey-pin--origin" />
          <span className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-full bg-deep-orange px-2.5 py-1 text-body-xs font-semibold whitespace-nowrap text-white shadow-[0_4px_12px_rgb(245_128_37/0.35)]">
            {originLabel(origin)}
          </span>
        </span>
        <span
          ref={toPin}
          aria-hidden
          className="journey-pin journey-pin--destination absolute top-0 left-0"
        />
        <span ref={mode} aria-hidden className="journey-mode absolute top-0 left-0">
          <Icon name={origin.mode} className="size-6" />
        </span>
      </div>

      <Container className="pointer-events-none relative z-[1000] flex h-full items-start pt-4 sm:pt-8 md:items-center md:pt-0">
        <div
          ref={card}
          // Phones: a compact card (tighter padding, smaller type) so the route stays in view.
          className="pointer-events-auto relative flex w-full flex-col gap-3 overflow-hidden rounded-md bg-turquoise-160 p-4 text-white shadow-soft sm:max-w-[23rem] sm:gap-6 sm:p-6"
        >
          <div className="flex flex-col gap-1.5 sm:gap-3">
            <h2 id="journey-title" className="text-heading-6 sm:text-heading-5">
              {journeyIntro.title}
            </h2>
            <p className="text-body-xs text-white/90 sm:text-body-sm">{journeyIntro.description}</p>
          </div>

          {open ? (
            <div className="flex flex-col gap-3 border-t border-white/30 pt-4">
              {/* The picker sits on the card itself: white type, sun-yellow accents. */}
              <div className="flex items-end justify-between gap-4 border-b border-white/30">
                <div role="tablist" className="flex gap-4 text-body-xs">
                  {(["global", "egypt"] as const).map((key) => (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={tab === key}
                      onClick={() => setTab(key)}
                      className={cn(
                        "-mb-px border-b-2 pb-1.5 font-semibold transition-colors",
                        tab === key
                          ? "border-sun text-white"
                          : "border-transparent text-white/70 hover:text-white",
                      )}
                    >
                      {journeyIntro.tabs[key]}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mb-1.5 grid size-7 place-items-center rounded-full text-white transition-colors hover:bg-white/15"
                >
                  <Icon name="close" className="size-4" />
                  <span className="sr-only">Close the city list</span>
                </button>
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="text-body-xs text-white/80">{journeyIntro.fromLabel}</span>
                <span className="flex items-center gap-2 rounded-md bg-white/15 px-2.5 py-2">
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={journeyIntro.searchLabel.toUpperCase()}
                    aria-controls={listId}
                    className="min-w-0 flex-1 bg-transparent text-body-xs text-white placeholder:text-white/65"
                  />
                  <Icon name="search" className="size-3.5 text-white/80" />
                </span>
              </label>
              <ul
                id={listId}
                role="listbox"
                aria-label={journeyIntro.fromLabel}
                data-lenis-prevent
                className="-mx-1 flex max-h-[min(18rem,calc(100svh-26rem))] [scrollbar-width:thin] [scrollbar-color:rgb(255_255_255/0.4)_transparent] flex-col overflow-y-auto overscroll-contain pr-1"
              >
                {options.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={item.id === origin.id}
                      onClick={() => choose(item)}
                      className={cn(
                        "w-full rounded-md px-2 py-2 text-left text-body-xs transition-colors",
                        item.id === origin.id
                          ? "bg-sun/25 text-white"
                          : "text-white/85 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
                {options.length === 0 ? (
                  <li className="px-2 py-2 text-body-xs text-white/75">No matches</li>
                ) : null}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:gap-5">
              {/* Phones: a hairline above only; the card ends with the route. */}
              <div className="flex items-end justify-between gap-4 border-t border-white/30 pt-3 sm:border-y sm:py-5">
                <div className="flex min-w-0 flex-col gap-1 sm:gap-1.5">
                  <span className="truncate font-serif text-body-lg leading-[1.2] sm:text-heading-6">
                    {origin.name}
                  </span>
                  <span className="flex items-center gap-1.5 text-body-sm text-white/90 sm:text-body-md">
                    <Icon name={origin.mode} className="size-4 text-sun sm:size-4.5" />
                    {formatDuration(origin.minutes)}
                  </span>
                </div>
                <button
                  type="button"
                  aria-expanded={false}
                  onClick={() => setOpen(true)}
                  className="shrink-0 pb-1 text-body-xs font-semibold tracking-label text-sun uppercase underline decoration-sun/60 underline-offset-4 transition-colors hover:decoration-sun"
                >
                  {journeyIntro.chooseLabel}
                </button>
              </div>
              {/* Phones show this at the foot of the map instead (below). */}
              <GoogleMapsButton className="hidden sm:inline-flex" href={directionsHref} />
            </div>
          )}
        </div>
      </Container>

      {/* Phones: directions sit at the foot of the map, centred, clear of the card. */}
      <GoogleMapsButton
        href={directionsHref}
        className="absolute bottom-5 left-1/2 z-[1000] -translate-x-1/2 shadow-float sm:hidden"
      />
    </section>
  );
}
