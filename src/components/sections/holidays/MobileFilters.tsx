"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "@/components/animations/easing";
import { PhoneSheet } from "@/components/sections/live/PhoneSheet";
import { Button } from "@/components/ui/Button";
import { FilterPanel, type FilterGroup, type FilterState } from "@/components/ui/FilterPanel";
import { Icon } from "@/components/ui/Icon";

type MobileFiltersProps = {
  groups: FilterGroup[];
  value: FilterState;
  onChange: (value: FilterState) => void;
  /** Phones: show the floating chip and bottom sheet (off where a booking bar owns the foot). */
  phoneChip?: boolean;
  className?: string;
};

/**
 * The filters, out of the way of the results on smaller screens:
 * - Phones: a small "Filters" chip floats at the foot of the screen while the list is in view
 *   (with how many filters are on) and opens the filters in a bottom sheet.
 * - Tablets: a "Filters" bar folds the panel open in place.
 * - Desktop (`lg`): the panel is always open beside the list, exactly as before.
 */
export function MobileFilters({
  groups,
  value,
  onChange,
  phoneChip = true,
  className,
}: MobileFiltersProps) {
  const [open, setOpen] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [inView, setInView] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const active = Object.values(value).reduce((sum, selected) => sum + selected.length, 0);

  // The chip shows while the finder (its section) is on screen.
  useEffect(() => {
    const section = root.current?.closest("section");
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: "-25% 0px -15% 0px",
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const count =
    active > 0 ? (
      <span className="grid size-5 place-items-center rounded-full bg-deep font-sans text-[0.6875rem] font-semibold text-white tabular-nums">
        {active}
      </span>
    ) : null;

  return (
    <div ref={root} className={className}>
      {/* Phones: the floating chip and its bottom sheet. */}
      <AnimatePresence>
        {phoneChip && inView && !sheet ? (
          <m.button
            key="chip"
            type="button"
            aria-haspopup="dialog"
            onClick={() => setSheet(true)}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.45, ease: easeOutExpo }}
            className="fixed bottom-5 left-1/2 z-40 flex min-h-10 -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-4 text-body-sm font-semibold text-white shadow-float md:hidden"
          >
            <Icon name="list" className="size-4" />
            Filters
            {count}
          </m.button>
        ) : null}
      </AnimatePresence>
      <PhoneSheet open={sheet} onClose={() => setSheet(false)} label="Filters">
        <FilterPanel
          groups={groups}
          value={value}
          onChange={onChange}
          className="border-transparent p-0 [&>div:first-child]:pr-10"
        />
        <div className="mt-6 flex justify-center">
          <Button variant="primary" onClick={() => setSheet(false)}>
            Show results
          </Button>
        </div>
      </PhoneSheet>

      {/* Tablets: a bar that folds the panel open in place. */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className="hidden min-h-12 w-full items-center justify-between gap-4 rounded-md bg-white px-4 font-serif text-heading-6 md:flex lg:hidden"
      >
        <span className="flex items-center gap-2.5">
          Filters
          {count}
        </span>
        <Icon
          name="chevron-down"
          className={cn(
            "size-5 text-turquoise transition-transform duration-500 ease-out-expo",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        id={panelId}
        className={cn(
          "hidden transition-[grid-template-rows] duration-500 ease-out-expo md:grid lg:block",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div
          className={cn(
            "overflow-hidden transition-[visibility] duration-500 lg:overflow-visible",
            !open && "max-lg:invisible",
          )}
        >
          <FilterPanel
            groups={groups}
            value={value}
            onChange={onChange}
            className="mt-2 border-transparent p-5 sm:p-6 lg:mt-0"
          />
        </div>
      </div>
    </div>
  );
}
