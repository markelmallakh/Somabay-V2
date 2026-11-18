"use client";

import { AnimatePresence, m } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { image } from "@/lib/media";
import type { ImageAsset } from "@/types/media";
import { easeOutExpo } from "@/components/animations/easing";
import { PanZoom } from "@/components/media/PanZoom";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { Button } from "@/components/ui/Button";
import { filterChipClass } from "@/components/ui/filterChip";
import { Icon } from "@/components/ui/Icon";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { PhoneSheet } from "./PhoneSheet";

type Category = "residential" | "commercial" | "amenities";
type Filter = "all" | Category;

type Hotspot = {
  id: string;
  category: Category;
  title: string;
  description: string;
  /** Position on the plan, as a percentage of its width and height. */
  x: number;
  y: number;
  image?: ImageAsset;
};

const categoryLabel: Record<Category, string> = {
  residential: "Residential",
  commercial: "Commercial",
  amenities: "Amenities",
};

// The Wadi Jebal masterplan supplied by the client. DUMMY CONTENT: the facility names,
// descriptions and photos are placeholders until the real facility list is supplied; the
// positions follow the features on the plan.
const plan = image("/images/neighborhoods/wadi-jebal-masterplan.webp", "Wadi Jebal masterplan");

const hotspots: Hotspot[] = [
  {
    id: "cliff-villas",
    category: "residential",
    title: "Cliffside Villas",
    description:
      "Detached villas along the upper ridge, each with a private terrace facing the sea.",
    x: 52,
    y: 23,
    image: image(
      "/images/library/residences/wadi-jebal-extension/2026-02-04-at-2-21-55-pm-2.webp",
      "Villas along the cliff above the sea",
    ),
  },
  {
    id: "garden-villas",
    category: "residential",
    title: "Garden Villas",
    description: "Single-storey homes set around shaded gardens and quiet walkways.",
    x: 41,
    y: 43,
    image: image(
      "/images/library/residences/patio-212/2026-02-04-at-2-06-06-pm.webp",
      "A garden villa terrace",
    ),
  },
  {
    id: "townhouses",
    category: "residential",
    title: "Townhouses",
    description: "Terraced homes in short rows, with views down the slope to the sea.",
    x: 81,
    y: 59,
  },
  {
    id: "beachfront-villas",
    category: "residential",
    title: "Beachfront Villas",
    description: "A single row of villas closest to the shore, steps from the beach.",
    x: 38,
    y: 66,
  },
  {
    id: "pool",
    category: "amenities",
    title: "Community Pool",
    description: "A long pool with sun terraces at the heart of the neighborhood.",
    x: 38,
    y: 56,
    image: image("/images/library/sports/sportsss-16.webp", "An outdoor lap pool from above"),
  },
  {
    id: "beach",
    category: "amenities",
    title: "Private Beach",
    description: "The neighborhood's own stretch of sand and sea, with shaded loungers.",
    x: 55,
    y: 88,
    image: image(
      "/images/library/residences/wadi-jebal-extension/2026-02-04-at-2-21-55-pm-1.webp",
      "Beach cabanas on the shore",
    ),
  },
  {
    id: "village-shops",
    category: "commercial",
    title: "Village Shops",
    description: "A short row of everyday shops and a café at the neighborhood entrance.",
    x: 10,
    y: 52,
  },
  {
    id: "wadi-park",
    category: "amenities",
    title: "Wadi Park",
    description: "A green valley running down to the sea, kept open as a park.",
    x: 81,
    y: 20,
  },
  {
    id: "trail",
    category: "amenities",
    title: "Coastal Walk",
    description: "A landscaped path that follows the shoreline along the whole neighborhood.",
    x: 25,
    y: 76,
  },
];

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "residential", label: "Residential" },
  { id: "commercial", label: "Commercial" },
  { id: "amenities", label: "Amenities" },
];

/**
 * A project masterplan: the neighborhood's site plan with a hotspot on each facility. Filters narrow the hotspots by category; a
 * hotspot opens a card beside it with the facility's photo, name and a line about it.
 */
export function ProjectMasterplan({ name }: { name: string }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<string | null>(null);
  const visible = hotspots.filter((spot) => filter === "all" || spot.category === filter);
  const active = visible.find((spot) => spot.id === open) ?? null;

  const choose = (next: Filter) => {
    setFilter(next);
    setOpen(null);
  };

  return (
    <div className="relative">
      {/* Phones: the categories as a row of chips above the plan, so none is cut off. */}
      <div
        role="radiogroup"
        aria-label={`${name} masterplan category`}
        className="-mx-gutter mb-3 scrollbar-none flex justify-center-safe gap-1.5 overflow-x-auto px-gutter md:hidden"
      >
        {filters.map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={option.id === filter}
            onClick={() => choose(option.id)}
            className={filterChipClass(option.id === filter, "shrink-0")}
          >
            {option.label}
          </button>
        ))}
      </div>
      {/* No parallax: the pins sit on the plan by percentage and must stay on their places.
          Phones: the plan keeps its proportions and can be dragged, pinched and double-tapped. */}
      <div data-no-motion className="relative">
        <PanZoom
          aspect={708 / 432}
          label="masterplan"
          className="aspect-[4/5] rounded-md bg-sand-200 sm:aspect-[708/432]"
        >
          <ResponsiveImage
            asset={plan}
            sizes="(min-width: 1512px) 1392px, 230vw"
            fill
            priority={false}
          />

          {visible.map((spot, index) => {
            const on = spot.id === open;
            return (
              <m.button
                key={spot.id}
                type="button"
                onClick={() => setOpen(on ? null : spot.id)}
                aria-expanded={on}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: easeOutExpo, delay: index * 0.04 }}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                // The 32px pin sits in a 44px tap area.
                className="group pz-counter absolute z-10 -translate-x-1/2 -translate-y-1/2 p-1.5"
              >
                <span className="sr-only">{spot.title}</span>
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-1.5 rounded-full",
                    on ? "bg-deep-orange/30" : "animate-ping bg-deep/35 [animation-duration:2.4s]",
                  )}
                />
                <span
                  aria-hidden
                  className={cn(
                    "relative grid size-8 place-items-center rounded-full border-2 border-white shadow-float transition-[background-color,transform] duration-500 group-hover:scale-110",
                    on ? "bg-deep-orange" : "bg-deep",
                  )}
                >
                  <Icon name={on ? "close" : "plus"} className="size-3.5 text-white" />
                </span>
              </m.button>
            );
          })}
        </PanZoom>

        {/* The facility card, opening beside its hotspot (to the left on the right half). */}
        <AnimatePresence>
          {active ? (
            <m.div
              key={active.id}
              role="dialog"
              aria-label={active.title}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5, ease: easeOutExpo }}
              style={{
                left: active.x < 55 ? `calc(${active.x}% + 1.75rem)` : undefined,
                right: active.x >= 55 ? `calc(${100 - active.x}% + 1.75rem)` : undefined,
                top: `clamp(1rem, calc(${active.y}% - 9rem), calc(100% - 22rem))`,
              }}
              className="absolute z-20 hidden w-72 overflow-hidden rounded-md bg-white text-ink shadow-card md:block"
            >
              {active.image ? (
                <div className="relative aspect-[16/10]">
                  <ResponsiveImage asset={active.image} sizes="18rem" fill />
                </div>
              ) : null}
              <div className="p-5">
                <p className="text-label tracking-label text-turquoise-160 uppercase">
                  {categoryLabel[active.category]}
                </p>
                <p className="mt-2 font-serif text-heading-6">{active.title}</p>
                <p className="mt-2 text-body-sm text-slate">{active.description}</p>
                <a
                  href="#register-interest"
                  className="mt-4 inline-block text-body-xs font-semibold tracking-label text-turquoise uppercase transition-colors hover:text-turquoise-160"
                >
                  Request interest
                </a>
              </div>
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="absolute top-3 right-3 grid size-8 place-items-center rounded-md bg-white/90 text-ink transition-colors hover:bg-white"
              >
                <Icon name="close" className="size-4" />
                <span className="sr-only">Close</span>
              </button>
            </m.div>
          ) : null}
        </AnimatePresence>

        <div className="absolute top-4 left-4 z-20 hidden max-w-[calc(100%-2rem)] shadow-float md:block">
          <SegmentedControl
            label={`${name} masterplan category`}
            value={filter}
            onChange={choose}
            options={filters}
          />
        </div>
      </div>

      {/* Phones: the tapped facility opens as a bottom sheet. */}
      <PhoneSheet open={Boolean(active)} onClose={() => setOpen(null)} label={active?.title ?? ""}>
        {active ? (
          <>
            {active.image ? (
              <div className="relative mt-3 aspect-[16/10] overflow-hidden rounded-md">
                <ResponsiveImage asset={active.image} sizes="100vw" fill />
              </div>
            ) : null}
            <p className="mt-4 text-label tracking-label text-turquoise-160 uppercase">
              {categoryLabel[active.category]}
            </p>
            <p className="mt-2 font-serif text-heading-5">{active.title}</p>
            <p className="mt-2 text-body-md text-slate">{active.description}</p>
            <Button
              href="#register-interest"
              variant="primary"
              className="mt-5 w-full"
              onClick={() => setOpen(null)}
            >
              Request interest
            </Button>
          </>
        ) : null}
      </PhoneSheet>
    </div>
  );
}
