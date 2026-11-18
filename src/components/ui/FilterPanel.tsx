"use client";

import { AnimatePresence, m } from "framer-motion";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "@/components/animations/easing";
import { Icon } from "./Icon";
import { OptionTag } from "./OptionTag";
import { TextAction } from "./TextAction";

export type FilterGroup = {
  id: string;
  label: string;
  options: { value: string; label: string }[];
};

export type FilterState = Record<string, string[]>;

type FilterPanelProps = {
  groups: FilterGroup[];
  value: FilterState;
  onChange: (value: FilterState) => void;
  className?: string;
};

/**
 * Filters on a white panel: a header with the number of active filters and Clear all, then each
 * group as a light accordion (its name, how many of its options are chosen, a chevron) holding
 * soft chips that turn solid turquoise once chosen. Empty groups mean "no restriction".
 */
export function FilterPanel({ groups, value, onChange, className }: FilterPanelProps) {
  const baseId = useId();
  const total = Object.values(value).reduce((sum, selected) => sum + selected.length, 0);
  const [closed, setClosed] = useState<string[]>([]);

  const toggle = (group: string, option: string) => {
    const selected = value[group] ?? [];
    onChange({
      ...value,
      [group]: selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option],
    });
  };

  return (
    <div className={cn("rounded-md bg-white p-6", className)}>
      <div className="flex items-center justify-between gap-4">
        <p className="flex items-center gap-2.5 font-serif text-heading-6">
          Filters
          <AnimatePresence>
            {total > 0 ? (
              <m.span
                key="count"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: easeOutExpo }}
                className="grid size-6 place-items-center rounded-full bg-deep font-sans text-body-xs font-semibold text-white tabular-nums"
                aria-label={`${total} active`}
              >
                {total}
              </m.span>
            ) : null}
          </AnimatePresence>
        </p>
        <TextAction
          onClick={() => onChange({})}
          disabled={total === 0}
          className="text-[0.6875rem] tracking-[0.12em]"
        >
          Clear all
        </TextAction>
      </div>

      <div className="mt-4 flex flex-col">
        {groups.map((group) => {
          const open = !closed.includes(group.id);
          const chosen = (value[group.id] ?? []).length;
          const panelId = `${baseId}-${group.id}-panel`;
          return (
            <fieldset key={group.id} className="border-t border-line first:border-t-0">
              <legend className="sr-only">{group.label}</legend>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() =>
                  setClosed((current) =>
                    open ? [...current, group.id] : current.filter((id) => id !== group.id),
                  )
                }
                className="group flex w-full items-center gap-3 py-4 text-left"
              >
                <span className="flex-1 text-body-xs font-semibold tracking-label text-ink uppercase">
                  {group.label}
                </span>
                {chosen > 0 ? (
                  <span className="text-body-xs text-turquoise-160 tabular-nums">
                    {chosen} selected
                  </span>
                ) : null}
                <Icon
                  name="chevron-down"
                  className={cn(
                    "size-4 text-slate transition-transform duration-500 ease-out-expo group-hover:text-ink",
                    open && "rotate-180",
                  )}
                />
              </button>
              <AnimatePresence initial={false}>
                {open ? (
                  <m.div
                    id={panelId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: easeOutExpo }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-2 pb-5">
                      {group.options.map((option) => (
                        <OptionTag
                          key={option.value}
                          id={`${baseId}-${group.id}-${option.value}`}
                          checked={(value[group.id] ?? []).includes(option.value)}
                          onChange={() => toggle(group.id, option.value)}
                        >
                          {option.label}
                        </OptionTag>
                      ))}
                    </div>
                  </m.div>
                ) : null}
              </AnimatePresence>
            </fieldset>
          );
        })}
      </div>
    </div>
  );
}

/** True when an item's values satisfy every non-empty filter group (OR within a group). */
export function matchesFilters(
  itemValues: Record<string, string[]>,
  filters: FilterState,
): boolean {
  return Object.entries(filters).every(
    ([group, selected]) =>
      selected.length === 0 ||
      selected.some((option) => (itemValues[group] ?? []).includes(option)),
  );
}
