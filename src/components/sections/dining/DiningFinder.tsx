"use client";

import { ResultCount } from "@/components/ui/ResultCount";
import { useState } from "react";
import type { Venue } from "@/content/dining";
import { cn } from "@/lib/utils";
import { filterChipClass } from "@/components/ui/filterChip";
import { m } from "framer-motion";
import { easeOutExpo } from "@/components/animations/easing";
import { DetailDrawer } from "@/components/directory/DetailDrawer";
import { PhotoCard } from "@/components/ui/PhotoCard";
import { Icon } from "@/components/ui/Icon";

type DiningFinderProps = {
  venues: Venue[];
  categories: readonly { value: string; label: string }[];
};

/**
 * Venue directory: rounded category toggles (each with its accent dot) and a pill search, over a
 * grid of rounded white cards. A card opens the shared detail drawer.
 */
export function DiningFinder({ venues, categories }: DiningFinderProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<number | null>(null);

  const needle = query.trim().toLowerCase();
  const filterKey = `${selected.join(",")}|${needle}`;
  const visible = venues.filter(
    (venue) =>
      (selected.length === 0 || selected.includes(venue.category)) &&
      (!needle ||
        `${venue.title} ${venue.chip ?? ""} ${venue.location ?? ""}`
          .toLowerCase()
          .includes(needle)),
  );

  const toggle = (value: string) =>
    setSelected((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  const countFor = (value?: string) =>
    value ? venues.filter((venue) => venue.category === value).length : venues.length;

  return (
    <>
      <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Phones: the categories run in one swipeable line instead of wrapping into a block. */}
        <div
          role="group"
          aria-label="Filter by category"
          className="flex flex-wrap justify-center gap-1.5 sm:justify-start sm:gap-2 [&>button]:whitespace-nowrap"
        >
          <button
            type="button"
            aria-pressed={selected.length === 0}
            onClick={() => setSelected([])}
            className={filterChipClass(selected.length === 0)}
          >
            All
            <span className="ml-1.5 tabular-nums opacity-60">{countFor()}</span>
          </button>
          {categories.map((category) => {
            const active = selected.includes(category.value);
            return (
              <button
                key={category.value}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(category.value)}
                className={filterChipClass(active)}
              >
                <span
                  aria-hidden
                  className={cn(
                    "grid overflow-hidden transition-[width,margin,opacity] duration-500 ease-out-expo",
                    active ? "mr-1.5 w-3.5 opacity-100" : "w-0 opacity-0",
                  )}
                >
                  <Icon name="check" className="size-3.5" />
                </span>
                {category.label}
                <span className="ml-1.5 tabular-nums opacity-60">{countFor(category.value)}</span>
              </button>
            );
          })}
        </div>
        <label className="group/search relative flex min-h-10 items-center gap-3 border-b border-line lg:w-72">
          <Icon name="search" className="size-4.5 text-slate" />
          <span className="sr-only">Search restaurants</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or cuisine"
            className="w-full bg-transparent text-body-sm outline-none placeholder:text-mist [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="grid size-6 shrink-0 place-items-center rounded-full text-slate transition-colors hover:bg-sand-200 hover:text-ink"
            >
              <Icon name="close" className="size-3.5" />
            </button>
          ) : null}
          <span
            aria-hidden
            className="absolute inset-x-0 -bottom-px h-0.5 origin-left scale-x-0 bg-deep transition-transform duration-700 ease-out-expo group-focus-within/search:scale-x-100"
          />
        </label>
      </div>
      <ResultCount
        count={visible.length}
        label={visible.length === 1 ? "venue" : "venues"}
        className="mt-6 sm:mt-8"
      />
      {/* Two to a row on phones too (compact cards), three on large screens. */}
      <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-6 lg:grid-cols-3">
        {visible.map((venue, index) => (
          // Every card rises in whenever the results change, so a filter or search never shows
          // an empty grid waiting for a scroll.
          <m.li
            key={`${filterKey}-${venue.id}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOutExpo, delay: Math.min(index, 6) * 0.06 }}
          >
            {/* The Marina shop card: the photo fills it, the type as a badge, the name at the foot
                and the turquoise bar flooding up on hover; it opens the venue's drawer. */}
            <PhotoCard
              onClick={() => setOpen(venues.indexOf(venue))}
              image={venue.images[0]}
              sizes="(min-width: 1024px) 30vw, 50vw"
              tag={venue.chip}
              title={venue.title}
              action="View details"
              size="compact"
              className="aspect-[3/4] sm:aspect-[400/520]"
            />
          </m.li>
        ))}
      </ul>
      {visible.length === 0 ? (
        <p className="mt-6 rounded-md bg-white p-6 text-center text-slate sm:mt-10 sm:p-10">
          No venues match your search.
        </p>
      ) : null}
      <DetailDrawer
        items={venues}
        index={open}
        onClose={() => setOpen(null)}
        onNavigate={setOpen}
      />
    </>
  );
}
