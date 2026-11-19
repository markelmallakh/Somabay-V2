"use client";

import { type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import type { Neighborhood, NeighborhoodStatus } from "@/types/content";
import { Container } from "@/components/layout/Container";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

type NeighborhoodsIndexProps = {
  neighborhoods: Neighborhood[];
  hrefs: Record<string, string>;
  tabLabels: Record<NeighborhoodStatus, string>;
  ctaLabel: string;
  heading: ReactNode;
};

const PANEL_ID = "neighborhoods-index";
const ORDER: NeighborhoodStatus[] = ["upcoming", "living"];

/**
 * Neighborhoods as an index (the alternative to `NeighborhoodsCarousel`). On the left, the
 * availability switch over a list of every neighborhood in large condensed type, divided by
 * hairlines; on the right, one large photo of the chosen neighborhood with its story and CTA on
 * it. Hovering, focusing or tapping a name cross-fades the photo. Ten or more neighborhoods still
 * fit in one view, with no sideways scrolling.
 */
export function NeighborhoodsIndex({
  neighborhoods,
  hrefs,
  tabLabels,
  ctaLabel,
  heading,
}: NeighborhoodsIndexProps) {
  const [status, setStatus] = useState<NeighborhoodStatus>("upcoming");
  const items = neighborhoods.filter((item) => item.status === status);
  const [activeSlug, setActiveSlug] = useState(items[0]?.slug);
  // The photo underneath while the new one fades in over it.
  const [previousSlug, setPreviousSlug] = useState<string | null>(null);

  const active = items.find((item) => item.slug === activeSlug) ?? items[0];
  const previous = neighborhoods.find((item) => item.slug === previousSlug);

  const choose = (slug: string) => {
    if (slug === active?.slug) return;
    setPreviousSlug(active?.slug ?? null);
    setActiveSlug(slug);
  };

  const changeStatus = (next: NeighborhoodStatus) => {
    if (next === status) return;
    setStatus(next);
    const first = neighborhoods.find((item) => item.status === next);
    if (first) choose(first.slug);
  };

  if (!active) return null;

  return (
    <Container className="flex flex-col gap-8 sm:gap-10">
      {heading}

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        {/* The index: the switch, then every neighborhood as one large line. */}
        <div className="flex flex-col gap-6 lg:col-span-5">
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
                  onClick={() => changeStatus(key)}
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

          <ul
            id={PANEL_ID}
            role="tabpanel"
            aria-labelledby={`${PANEL_ID}-tab-${status}`}
            className="border-t border-line"
          >
            {items.map((item) => {
              const current = item.slug === active.slug;
              return (
                <li key={item.slug} className="border-b border-line">
                  <button
                    type="button"
                    aria-pressed={current}
                    onClick={() => choose(item.slug)}
                    onMouseEnter={() => choose(item.slug)}
                    onFocus={() => choose(item.slug)}
                    className="group/row flex w-full items-center justify-between gap-4 py-3 text-left sm:py-3.5"
                  >
                    <span
                      className={cn(
                        "font-serif text-heading-5 leading-none transition-[color,translate] duration-500 ease-out-expo sm:text-heading-4",
                        current
                          ? "translate-x-2 text-ink"
                          : "text-ink/30 group-hover/row:text-ink/60",
                      )}
                    >
                      {item.name}
                    </span>
                    <span className="flex shrink-0 items-center">
                      <span
                        aria-hidden
                        className={cn(
                          "grid size-8 place-items-center rounded-full bg-aqua text-white transition-[opacity,scale] duration-500 ease-out-expo",
                          current ? "scale-100 opacity-100" : "scale-50 opacity-0",
                        )}
                      >
                        <Icon name="arrow-right" className="size-4" />
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* The chosen neighborhood: one large photo with its story on it. */}
        <div
          data-theme-surface="dark"
          className="relative isolate min-h-[28rem] overflow-hidden rounded-media bg-deep text-white lg:col-span-7 lg:min-h-0"
        >
          <div aria-hidden className="absolute inset-0 -z-20">
            {previous ? (
              <div key={previous.slug} className="absolute inset-0">
                <ResponsiveImage
                  asset={previous.image}
                  sizes="(min-width: 1024px) 56vw, 100vw"
                  fill
                />
              </div>
            ) : null}
            <div
              key={active.slug}
              className="absolute inset-0 animate-[photo-fade_1.2s_var(--ease-in-out-quart)_both] motion-reduce:animate-none"
            >
              <ResponsiveImage asset={active.image} sizes="(min-width: 1024px) 56vw, 100vw" fill />
            </div>
          </div>
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(8_46_48/0.92)_0%,rgb(8_46_48/0.55)_35%,transparent_65%)]"
          />

          {/* The neighborhood's tagline as a badge in the corner. */}
          <span
            key={`tag-${active.slug}`}
            className="absolute top-5 left-5 animate-rise rounded-full bg-deep/70 px-3 py-1.5 text-[0.6875rem] leading-none font-semibold tracking-[0.12em] uppercase backdrop-blur-md motion-reduce:animate-none sm:top-6 sm:left-6"
          >
            {active.tagline}
          </span>

          <div
            key={active.slug}
            className="absolute inset-x-0 bottom-0 flex animate-rise flex-col gap-5 p-6 motion-reduce:animate-none sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:p-8"
          >
            <div className="flex max-w-md flex-col gap-2">
              <h3 className="text-heading-3 leading-[0.95]">{active.name}</h3>
              {active.summary ? (
                <p className="text-body-sm text-white/85">{active.summary}</p>
              ) : null}
            </div>
            <Button
              href={hrefs[active.slug]}
              variant="light"
              icon="arrow-up-right"
              className="shrink-0"
            >
              {ctaLabel}
              <span className="sr-only">: {active.name}</span>
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
