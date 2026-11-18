"use client";

import { PhotoCard } from "@/components/ui/PhotoCard";
import { AnimatePresence, m } from "framer-motion";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useDragScroll } from "@/hooks/useDragScroll";
import { cn } from "@/lib/utils";
import type { Neighborhood, NeighborhoodStatus } from "@/types/content";
import { easeOutExpo } from "@/components/animations/easing";
import { Container } from "@/components/layout/Container";
import { Icon } from "@/components/ui/Icon";

type NeighborhoodsCarouselProps = {
  neighborhoods: Neighborhood[];
  hrefs: Record<string, string>;
  tabLabels: Record<NeighborhoodStatus, string>;
  ctaLabel: string;
  heading: ReactNode;
};

const PANEL_ID = "neighborhoods-panel";
const ORDER: NeighborhoodStatus[] = ["upcoming", "living"];

/**
 * Figma "Section / Neighborhoods — Option B": underline tabs with counts, a row of equal photo
 * cards that bleeds off the right edge, and a progress rail with previous / next controls.
 */
export function NeighborhoodsCarousel({
  neighborhoods,
  hrefs,
  tabLabels,
  ctaLabel,
  heading,
}: NeighborhoodsCarouselProps) {
  const [status, setStatus] = useState<NeighborhoodStatus>("upcoming");
  const [progress, setProgress] = useState({ start: 0, size: 1 });
  const scroller = useRef<HTMLDivElement>(null);
  useDragScroll(scroller);

  const items = neighborhoods.filter((item) => item.status === status);
  // Three copies make the row endless: scrolling past either copy edge jumps silently back
  // into the middle copy, so the cards appear to loop.
  const looped = [...items, ...items, ...items];

  /** Width of one full set of cards (one copy, including gaps). */
  const setWidth = () => {
    const el = scroller.current;
    const list = el?.querySelector("ul");
    return list ? list.scrollWidth / 3 : 0;
  };

  /** Silently moves the row back into the middle copy (same cards, so nothing visibly shifts). */
  const recentre = useCallback(() => {
    const el = scroller.current;
    const width = setWidth();
    if (!el || !width) return;
    if (el.scrollLeft < width * 0.5 || el.scrollLeft > width * 1.5) {
      el.style.scrollSnapType = "none";
      el.scrollLeft += el.scrollLeft < width * 0.5 ? width : -width;
      requestAnimationFrame(() => (el.style.scrollSnapType = ""));
    }
  }, []);

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const width = setWidth();
    if (!width) return;
    // The rail fills from the left up to the current card: 1/n … n/n, then restarts with the loop.
    const card = el.querySelector("li");
    const count = el.querySelectorAll("li").length / 3;
    if (!card || !count) return;
    const stride = card.clientWidth + 16;
    const index = (((Math.round((el.scrollLeft - width) / stride) % count) + count) % count) + 1;
    setProgress({ start: 0, size: index / count });
  }, []);

  // Start in the middle copy whenever the set changes.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const frame = requestAnimationFrame(() => {
      el.scrollLeft = setWidth();
      measure();
    });
    return () => cancelAnimationFrame(frame);
  }, [status, measure]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    // Wrap only once scrolling settles, so it never interrupts a glide or a drag.
    el.addEventListener("scrollend", recentre);
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      el.removeEventListener("scrollend", recentre);
      observer.disconnect();
    };
  }, [measure, recentre, status]);

  const change = (next: NeighborhoodStatus) => {
    setStatus(next);
  };

  const step = (direction: 1 | -1) => {
    const el = scroller.current;
    const card = el?.querySelector("li");
    if (!el || !card) return;
    recentre();
    // Step to an exact card so quick clicks never skip or land between cards.
    const stride = card.clientWidth + 16;
    const index = Math.round(el.scrollLeft / stride) + direction;
    el.scrollTo({ left: index * stride, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <Container className="flex flex-col gap-6 sm:gap-8">
        {heading}
        <div
          role="tablist"
          aria-label="Neighborhood availability"
          className="flex w-fit gap-1 rounded-full bg-sand-100 p-1"
        >
          {ORDER.map((key) => {
            const count = neighborhoods.filter((item) => item.status === key).length;
            const selected = key === status;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                id={`${PANEL_ID}-tab-${key}`}
                aria-selected={selected}
                aria-controls={PANEL_ID}
                onClick={() => change(key)}
                // A light segmented control: the chosen chip is a white pill lifted on the pale track.
                className={cn(
                  "inline-flex items-center gap-2 rounded-full py-1.5 pr-1.5 pl-4 text-body-xs font-semibold tracking-[0.06em] whitespace-nowrap uppercase transition-[background-color,color,box-shadow] duration-500",
                  selected
                    ? "bg-white text-ink shadow-[0_2px_8px_-2px_rgb(29_31_34/0.15)]"
                    : "text-slate hover:text-ink",
                )}
              >
                {tabLabels[key]}
                <span
                  className={cn(
                    "grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-[0.6875rem] tabular-nums transition-colors duration-500",
                    selected ? "bg-frost-soft text-ink" : "bg-white/70 text-slate",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </Container>

      <div
        ref={scroller}
        id={PANEL_ID}
        role="tabpanel"
        aria-labelledby={`${PANEL_ID}-tab-${status}`}
        className="-my-6 scrollbar-none cursor-grab snap-x snap-proximity scroll-ps-site overflow-x-auto data-[dragging=true]:cursor-grabbing data-[dragging=true]:snap-none max-sm:snap-mandatory max-sm:scroll-px-[10vw]"
      >
        <AnimatePresence mode="wait" initial={false}>
          <m.ul
            key={status}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
            // Phones: the card centred with its neighbours peeking at both edges.
            className="flex w-max gap-4 py-6 ps-site pe-gutter max-sm:px-[10vw] sm:gap-5"
          >
            {looped.map((item, index) => (
              <li
                key={`${item.slug}-${index}`}
                aria-hidden={index < items.length || index >= items.length * 2 ? true : undefined}
                className="w-[80vw] snap-center sm:w-[min(25rem,80vw)] sm:snap-start"
              >
                <PhotoCard
                  href={hrefs[item.slug]}
                  draggable={false}
                  tabIndex={index < items.length || index >= items.length * 2 ? -1 : undefined}
                  image={item.image}
                  sizes="(min-width: 768px) 400px, 80vw"
                  tag={tabLabels[item.status]}
                  kicker={item.tagline}
                  title={item.name}
                  summary={item.summary}
                  action={ctaLabel}
                  className="aspect-[4/5] sm:aspect-[400/520]"
                />
              </li>
            ))}
          </m.ul>
        </AnimatePresence>
      </div>

      {/* Phones: no rail or arrows; the peeking cards show the row scrolls. */}
      <Container className="hidden items-center gap-8 md:flex">
        <div className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-line" aria-hidden>
          <span
            className="absolute inset-y-0 rounded-full bg-deep transition-[width] duration-700 ease-out-expo"
            style={{ left: `${progress.start * 100}%`, width: `${progress.size * 100}%` }}
          />
        </div>
        <div className="hidden gap-2 md:flex">
          <button
            type="button"
            onClick={() => step(-1)}
            className="grid size-12 place-items-center rounded-full border border-ink/15 text-ink transition-colors duration-500 hover:border-aqua hover:bg-aqua hover:text-white"
          >
            <span className="sr-only">Previous neighborhoods</span>
            <Icon name="arrow-right" className="size-5 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            className="grid size-12 place-items-center rounded-full border border-ink/15 text-ink transition-colors duration-500 hover:border-aqua hover:bg-aqua hover:text-white"
          >
            <span className="sr-only">Next neighborhoods</span>
            <Icon name="arrow-right" className="size-5" />
          </button>
        </div>
      </Container>
    </div>
  );
}
