"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Unit } from "@/content/resale";
import { easeOutExpo } from "@/components/animations/easing";
import { ResultCount } from "@/components/ui/ResultCount";
import { FilterPanel, type FilterState, matchesFilters } from "@/components/ui/FilterPanel";
import { Button } from "@/components/ui/Button";
import { PhoneSheet } from "./PhoneSheet";
import { UnitCard } from "./UnitCard";

type UnitsFinderProps = {
  units: Unit[];
  hrefs: Record<string, string>;
  neighborhoods: string[];
};

const bedroomOptions = [
  { value: "1", label: "1 BR" },
  { value: "2", label: "2 BR or above" },
  { value: "3", label: "3 BR or above" },
  { value: "4", label: "4 BR or above" },
];

/** Units shown at first, and added each time the visitor nears the end of the list. */
const BATCH = 4;

export function UnitsFinder({ units, hrefs, neighborhoods }: UnitsFinderProps) {
  const [filters, setFiltersState] = useState<FilterState>({});
  // Phones: the filters open in a bottom sheet from a compact bar instead of sitting inline.
  const [sheetOpen, setSheetOpen] = useState(false);
  const activeCount = Object.values(filters).reduce((sum, selected) => sum + selected.length, 0);
  // Lazy loading: the list grows a batch at a time as its end comes near.
  const [shownCount, setShownCount] = useState(BATCH);
  const sentinel = useRef<HTMLDivElement>(null);
  // A new filter starts the list again from its first batch.
  const setFilters = (next: FilterState) => {
    setFiltersState(next);
    setShownCount(BATCH);
  };
  const groups = [
    {
      id: "neighborhood",
      label: "Neighborhood",
      options: neighborhoods.map((name) => ({ value: name, label: name })),
    },
    { id: "bedrooms", label: "Bedrooms", options: bedroomOptions },
  ];
  const visible = units.filter((unit) =>
    matchesFilters(
      {
        neighborhood: [unit.neighborhood],
        // "N or above" thresholds the unit satisfies; 1 BR only matches one-bedroom units.
        bedrooms: bedroomOptions
          .map((option) => option.value)
          .filter((value) =>
            value === "1" ? unit.bedrooms === 1 : unit.bedrooms >= Number(value),
          ),
      },
      filters,
    ),
  );

  // Phones: once the inline Filters button has scrolled away (and while the list is still on
  // screen), a floating Filters chip stays at the foot of the screen, centred.
  const filtersButton = useRef<HTMLButtonElement>(null);
  const finder = useRef<HTMLDivElement>(null);
  const [passed, setPassed] = useState(false);
  const [listInView, setListInView] = useState(false);
  useEffect(() => {
    const button = filtersButton.current;
    const list = finder.current;
    if (!button || !list) return;
    const buttonObserver = new IntersectionObserver(([entry]) =>
      setPassed(!entry.isIntersecting && entry.boundingClientRect.top < 0),
    );
    const listObserver = new IntersectionObserver(
      ([entry]) => setListInView(entry.isIntersecting),
      { rootMargin: "0px 0px -20% 0px" },
    );
    buttonObserver.observe(button);
    listObserver.observe(list);
    return () => {
      buttonObserver.disconnect();
      listObserver.disconnect();
    };
  }, []);

  const shown = visible.slice(0, shownCount);
  const more = shown.length < visible.length;

  // Load the next batch as the end of the list comes within a quarter screen of view.
  useEffect(() => {
    const element = sentinel.current;
    if (!element || !more) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShownCount((count) => count + BATCH);
      },
      { rootMargin: "0px 0px 25% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [more, shownCount]);

  return (
    <div ref={finder} className="grid gap-8 lg:grid-cols-[20rem_1fr]">
      <div className="hidden md:block lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:self-start">
        <FilterPanel groups={groups} value={filters} onChange={setFilters} className="border-0" />
      </div>
      <div>
        {/* Phones: the count beside a Filters button that opens the sheet. */}
        <div className="mb-5 flex items-center justify-between gap-4 md:mb-6">
          <ResultCount
            count={visible.length}
            label={`${visible.length === 1 ? "unit" : "units"} available`}
          />
          <button
            ref={filtersButton}
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-haspopup="dialog"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4.5 text-[0.8125rem] font-medium text-ink md:hidden"
          >
            <FiltersIcon />
            Filters
            {activeCount > 0 ? (
              <span className="grid size-5 place-items-center rounded-full bg-deep text-body-2xs font-semibold text-white tabular-nums">
                {activeCount}
              </span>
            ) : null}
          </button>
        </div>
        <AnimatePresence>
          {passed && listInView && !sheetOpen ? (
            <m.button
              key="filters-chip"
              type="button"
              onClick={() => setSheetOpen(true)}
              aria-haspopup="dialog"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.45, ease: easeOutExpo }}
              className="fixed bottom-5 left-1/2 z-40 flex min-h-10 -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-4 text-body-sm font-semibold text-white shadow-float md:hidden"
            >
              <FiltersIcon />
              Filters
              {activeCount > 0 ? (
                <span className="grid size-5 place-items-center rounded-full bg-deep text-body-2xs font-semibold text-white tabular-nums">
                  {activeCount}
                </span>
              ) : null}
            </m.button>
          ) : null}
        </AnimatePresence>
        <PhoneSheet open={sheetOpen} onClose={() => setSheetOpen(false)} label="Filters">
          <FilterPanel
            groups={groups}
            value={filters}
            onChange={setFilters}
            // Room on the header row for the sheet's close button.
            className="border-0 p-0 [&>div:first-child]:pr-10"
          />
          <Button variant="primary" className="mt-5 w-full" onClick={() => setSheetOpen(false)}>
            {`Show ${visible.length} ${visible.length === 1 ? "unit" : "units"}`}
          </Button>
        </PhoneSheet>
        {/* Each card rises in on its own, just before it reaches the screen. */}
        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-5">
          {shown.map((unit, index) => (
            <m.li
              key={unit.slug}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px 15% 0px" }}
              transition={{ duration: 0.9, ease: easeOutExpo, delay: (index % 2) * 0.08 }}
            >
              <UnitCard unit={unit} href={hrefs[unit.slug]} />
            </m.li>
          ))}
          {/* Placeholders for the next batch while it loads. */}
          {more
            ? Array.from({ length: Math.min(2, visible.length - shown.length) }, (_, index) => (
                <li
                  key={`placeholder-${index}`}
                  aria-hidden
                  className="h-[28rem] animate-pulse rounded-md bg-sand-200/70"
                />
              ))
            : null}
        </ul>
        <div ref={sentinel} aria-hidden />
        {visible.length === 0 ? (
          <p className="rounded-md bg-white p-10 text-center text-slate">
            No units match these filters.
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** The sliders icon on the Filters buttons. */
function FiltersIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className="size-4"
    >
      <path d="M4 7h10m4 0h2M4 17h4m4 0h8" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </svg>
  );
}
