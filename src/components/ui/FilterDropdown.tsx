"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";
import { OptionTag } from "./OptionTag";
import { TextAction } from "./TextAction";

type FilterDropdownProps = {
  label?: string;
  options: readonly { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
};

/** "Filter" button that opens a small panel of selectable tags. */
export function FilterDropdown({
  label = "Filter",
  options,
  value,
  onChange,
  className,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = (option: string) =>
    onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option]);

  return (
    <div ref={root} className={cn("relative", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-11 min-w-48 items-center justify-between gap-6 rounded-md border border-ink/15 bg-white px-4 text-[0.9375rem] transition-colors duration-500 hover:border-deep"
      >
        <span>
          {label}
          {value.length > 0 ? (
            <span className="ml-2 inline-grid size-5 place-items-center rounded-md bg-turquoise-10 text-label font-semibold text-turquoise-160">
              {value.length}
            </span>
          ) : null}
        </span>
        <Icon
          name="chevron-down"
          className={cn("size-4 transition-transform duration-300", open && "rotate-180")}
        />
      </button>
      <AnimatePresence>
        {open ? (
          <m.div
            id={panelId}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="popover-sheet absolute top-full left-0 z-20 mt-2 w-72 rounded-md bg-white p-5 shadow-[0_16px_48px_rgb(15_30_53/0.16)]"
          >
            <fieldset>
              <legend className="sr-only">{label}</legend>
              <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                  <OptionTag
                    key={option.value}
                    id={`${panelId}-${option.value}`}
                    checked={value.includes(option.value)}
                    onChange={() => toggle(option.value)}
                  >
                    {option.label}
                  </OptionTag>
                ))}
              </div>
            </fieldset>
            <div className="mt-4 flex items-center justify-end gap-4 border-t border-line pt-3">
              <TextAction onClick={() => onChange([])} disabled={value.length === 0}>
                Clear filter
              </TextAction>
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
