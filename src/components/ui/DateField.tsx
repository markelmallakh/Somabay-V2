"use client";

import { AnimatePresence, m } from "framer-motion";
import { type KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "@/components/animations/easing";
import { control } from "./Field";
import { Icon } from "./Icon";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });
const dayLabel = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const shown = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const sameDay = (a: Date, b: Date) => a.getTime() === b.getTime();
/** The submitted value: yyyy-mm-dd, as a native date input would send. */
const iso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/** Six weeks of days around the month, starting on a Sunday (outside days included). */
function monthGrid(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

type DateFieldProps = {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
};

/**
 * A date field with the site's own calendar (after Origin UI's "calendar with button"): the
 * boxed control with its floating label and a calendar icon centred on the right; it opens a
 * small panel, drawn like the form dropdowns, with the month and arrows, the weekdays, a grid of
 * days (today marked with a dot, past days unavailable, the chosen day in turquoise) and a Today
 * button. The date is submitted as yyyy-mm-dd through a hidden input.
 */
export function DateField({ id, name, label, required, error, className }: DateFieldProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [value, setValue] = useState<Date | null>(null);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    // Focus the chosen day, else today, else the first available day of the month.
    const target =
      grid.current?.querySelector<HTMLButtonElement>("[aria-selected=true]") ??
      grid.current?.querySelector<HTMLButtonElement>("[data-today]:not(:disabled)") ??
      grid.current?.querySelector<HTMLButtonElement>("button:not(:disabled)");
    target?.focus({ preventScroll: true });
    const onPointer = (event: PointerEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (day: Date) => {
    setValue(day);
    setOpen(false);
    trigger.current?.focus();
  };

  const step = (by: number) =>
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + by, 1));
  const atFirstMonth =
    month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();

  // Arrow keys move between days in the grid.
  const onGridKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    const by = moves[event.key];
    if (!by) return;
    event.preventDefault();
    const days = [...(grid.current?.querySelectorAll<HTMLButtonElement>("button") ?? [])];
    const position = days.findIndex((day) => day === document.activeElement);
    days[Math.min(days.length - 1, Math.max(0, position + by))]?.focus();
  };

  const days = monthGrid(month);
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div ref={wrap} className="relative">
        <input type="hidden" name={name} value={value ? iso(value) : ""} />
        <button
          ref={trigger}
          id={id}
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={panelId}
          data-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          data-filled={open || value !== null || undefined}
          className={cn(control, "peer h-14 pr-12 text-left data-invalid:border-alert")}
        >
          {/* Keeps the line height even before a date is chosen. */}
          <span className="block truncate">{value ? shown.format(value) : " "}</span>
        </button>
        <label
          data-field-label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute top-4 left-4 origin-top-left text-body text-slate",
            "transition-[translate,scale,color] duration-300 ease-out-expo",
            "peer-focus:text-turquoise-160 peer-data-filled:-translate-y-2.5 peer-data-filled:scale-75",
          )}
        >
          {label}
          {required ? <span aria-hidden> *</span> : null}
        </label>
        {/* The calendar icon, centred on the field's height. */}
        <Icon
          name="calendar"
          data-field-icon
          className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-slate"
        />

        <AnimatePresence>
          {open ? (
            <m.div
              id={panelId}
              role="dialog"
              aria-label={`Choose ${label.toLowerCase()}`}
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.18 } }}
              transition={{ duration: 0.45, ease: easeOutExpo }}
              style={{ transformOrigin: "100% 0%" }}
              className="popover-sheet absolute top-[calc(100%+0.5rem)] right-0 z-50 w-[19.5rem] rounded-md border border-line bg-white p-3 text-ink shadow-[0_18px_50px_rgb(15_30_53/0.18)]"
            >
              {/* Month, between previous and next. */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  disabled={atFirstMonth}
                  aria-label="Previous month"
                  className="grid size-9 place-items-center rounded-md text-slate transition-colors hover:bg-turquoise-5 hover:text-ink disabled:pointer-events-none disabled:opacity-30"
                >
                  <Icon name="chevron-left" className="size-4" />
                </button>
                <p className="text-body-sm font-medium" aria-live="polite">
                  {monthLabel.format(month)}
                </p>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next month"
                  className="grid size-9 place-items-center rounded-md text-slate transition-colors hover:bg-turquoise-5 hover:text-ink"
                >
                  <Icon name="chevron-right" className="size-4" />
                </button>
              </div>

              <div className="mt-2 grid grid-cols-7 text-center">
                {WEEKDAYS.map((weekday) => (
                  <span key={weekday} className="py-1.5 text-body-xs font-medium text-slate">
                    {weekday}
                  </span>
                ))}
              </div>
              <div
                ref={grid}
                role="grid"
                onKeyDown={onGridKey}
                className="grid grid-cols-7 gap-y-0.5"
              >
                {days.map((day) => {
                  const outside = day.getMonth() !== month.getMonth();
                  const past = day < today;
                  const isToday = sameDay(day, today);
                  const selected = value !== null && sameDay(day, value);
                  return (
                    <button
                      key={day.getTime()}
                      type="button"
                      role="gridcell"
                      onClick={() => choose(day)}
                      disabled={past}
                      aria-selected={selected}
                      aria-label={dayLabel.format(day)}
                      data-today={isToday || undefined}
                      className={cn(
                        "relative mx-auto grid size-9 place-items-center rounded-md text-body-sm tabular-nums transition-colors duration-150 outline-none",
                        "hover:bg-turquoise-5 focus-visible:ring-2 focus-visible:ring-turquoise/50",
                        "disabled:pointer-events-none disabled:text-ink/25 disabled:line-through",
                        outside && !selected && "text-ink/35",
                        selected && "bg-deep text-white hover:bg-deep",
                      )}
                    >
                      {day.getDate()}
                      {/* Today: a small dot under the number. */}
                      {isToday ? (
                        <span
                          aria-hidden
                          className={cn(
                            "absolute bottom-1 left-1/2 size-[3px] -translate-x-1/2 rounded-full",
                            selected ? "bg-white" : "bg-deep",
                          )}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-line pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                    choose(today);
                  }}
                  className="rounded-md border border-line px-3 py-1.5 text-body-xs font-medium transition-colors hover:border-deep hover:text-turquoise-160"
                >
                  Today
                </button>
                {value ? (
                  <button
                    type="button"
                    onClick={() => setValue(null)}
                    className="text-body-xs text-slate transition-colors hover:text-ink"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </m.div>
          ) : null}
        </AnimatePresence>
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-body-sm text-alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
