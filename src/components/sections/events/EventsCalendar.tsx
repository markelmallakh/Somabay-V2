"use client";

import { AnimatePresence, m } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { colorOf } from "@/lib/event-categories";
import type { EventItem } from "@/types/content";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { Icon } from "@/components/ui/Icon";
import { easeOutExpo } from "@/components/animations/easing";

type EventsCalendarProps = {
  events: EventItem[];
  hrefs: Record<string, string>;
  categoryLabels: Record<string, string>;
  /** "YYYY-MM" to open on. */
  initialMonth: string;
  /** "YYYY-MM-DD" highlighted as today. */
  today: string;
};

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthName = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" });

/** One brand colour per category: sports in deep orange, corporate in dusk purple, mega events
 *  in twilight blue. */

const iso = (date: Date) => date.toISOString().slice(0, 10);

/** Phones (below `md`): the event preview opens as a bottom sheet instead of a popover. */
function usePhone() {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setPhone(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return phone;
}

/** Month grid with event bars; selecting an event opens a preview card. */
export function EventsCalendar({
  events,
  hrefs,
  categoryLabels,
  initialMonth,
  today,
}: EventsCalendarProps) {
  const [year, month] = initialMonth.split("-").map(Number);
  const [cursor, setCursor] = useState(() => new Date(Date.UTC(year, month - 1, 1)));
  const [selected, setSelected] = useState<EventItem | null>(null);
  const phone = usePhone();
  // The sheet closes with Esc too.
  useEffect(() => {
    if (!selected || !phone) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, phone]);
  // Where the preview opens: next to the chip (or list item) that was clicked.
  const panel = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState({ left: 0, top: 0, originX: 0, originY: 0 });
  const POP_WIDTH = 272;
  const POP_HEIGHT = 300;
  const open = (event: EventItem, target: HTMLElement) => {
    const frame = panel.current?.getBoundingClientRect();
    const box = target.getBoundingClientRect();
    if (frame) {
      const x = box.left - frame.left;
      const y = box.top - frame.top;
      // Below the chip, unless there's no room; kept inside the calendar's edges.
      const below = y + box.height + 8 + POP_HEIGHT <= frame.height;
      const left = Math.min(Math.max(12, x), frame.width - POP_WIDTH - 12);
      const top = below ? y + box.height + 8 : Math.max(12, y - POP_HEIGHT - 8);
      setAnchor({
        left,
        top,
        originX: x + box.width / 2 - left,
        originY: below ? 0 : POP_HEIGHT,
      });
    }
    setSelected((current) => (current?.slug === event.slug ? null : event));
  };

  const first = new Date(cursor);
  const gridStart = new Date(first);
  gridStart.setUTCDate(1 - first.getUTCDay());
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setUTCDate(gridStart.getUTCDate() + index);
    return date;
  });
  const visibleDays = days[35].getUTCMonth() === cursor.getUTCMonth() ? days : days.slice(0, 35);

  const eventsOn = (day: string) =>
    events.filter((event) => event.start <= day && (event.end ?? event.start) >= day);
  const shift = (step: number) => {
    setSelected(null);
    setCursor(
      (current) => new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + step, 1)),
    );
  };

  const monthKey = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}`;
  const monthEvents = events
    .filter(
      (event) =>
        event.start.slice(0, 7) <= monthKey && (event.end ?? event.start).slice(0, 7) >= monthKey,
    )
    .sort((a, b) => a.start.localeCompare(b.start));
  const dayFormat = new Intl.DateTimeFormat("en-US", { day: "2-digit", timeZone: "UTC" });
  const shortMonth = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
  const goToday = () => {
    const [y, mo] = today.split("-").map(Number);
    setSelected(null);
    setCursor(new Date(Date.UTC(y, mo - 1, 1)));
  };
  const dot = (event: EventItem) => colorOf(event.category).dot;
  // The preview card's content, shared by the popover (larger screens) and the sheet (phones).
  const preview = (event: EventItem) => (
    <>
      <div className="relative aspect-[16/9]">
        <ResponsiveImage asset={event.image} sizes="(max-width: 767px) 100vw, 272px" fill />
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="wave absolute top-2.5 right-2.5 grid size-8 place-items-center rounded-md bg-white text-ink shadow-float transition-colors duration-500 hover:text-white"
          aria-label="Close preview"
        >
          <Icon name="close" className="size-4" />
        </button>
      </div>
      <div className="flex flex-col gap-1.5 p-4">
        <span className="flex items-center gap-1.5 text-body-2xs font-semibold tracking-label text-slate uppercase">
          <span aria-hidden className={cn("size-1.5 rounded-full", dot(event))} />
          {categoryLabels[event.category]}
        </span>
        <p className="font-serif text-body-lg leading-snug">{event.title}</p>
        <p className="flex items-center gap-1.5 text-body-xs text-slate">
          <Icon name="pin" className="size-3.5" />
          {event.location}
        </p>
        <Link
          href={hrefs[event.slug]}
          className="group mt-2 inline-flex w-fit items-center gap-1.5 text-body-xs font-semibold tracking-label text-turquoise uppercase transition-colors hover:text-turquoise-160"
        >
          View event
          <Icon
            name="arrow-right"
            className="size-3.5 transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </>
  );

  return (
    // One white panel: the month and its controls on top, the grid, and the month's events
    // listed alongside on large screens.
    <div
      ref={panel}
      className="relative overflow-hidden rounded-md bg-white shadow-[0_20px_60px_-40px_rgb(15_30_53/0.35)]"
    >
      <div className="grid lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Month, with "Today" and the arrows grouped in one rounded control. */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <AnimatePresence mode="wait" initial={false}>
              <m.p
                key={monthKey}
                aria-live="polite"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: easeOutExpo }}
                className="flex items-baseline gap-3 font-serif text-heading-3 leading-none"
              >
                {monthName.format(cursor)}
                <span className="font-sans text-body-lg text-slate">{cursor.getUTCFullYear()}</span>
              </m.p>
            </AnimatePresence>
            <div className="flex items-center gap-1 rounded-full border border-line p-1">
              <button
                type="button"
                onClick={() => shift(-1)}
                aria-label="Previous month"
                className="grid size-9 place-items-center rounded-full text-ink transition-colors duration-300 hover:bg-sand-100"
              >
                <Icon name="chevron-left" className="size-4" />
              </button>
              <button
                type="button"
                onClick={goToday}
                className="rounded-full px-4 py-2 text-body-xs font-semibold tracking-label uppercase transition-colors duration-300 hover:bg-sand-100"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => shift(1)}
                aria-label="Next month"
                className="grid size-9 place-items-center rounded-full text-ink transition-colors duration-300 hover:bg-sand-100"
              >
                <Icon name="chevron-right" className="size-4" />
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-7 text-body-2xs font-semibold tracking-label text-slate uppercase sm:mt-8">
            {weekdays.map((day) => (
              <p key={day} className="px-1 pb-2 text-center sm:px-2 sm:pb-3 sm:text-left">
                <abbr title={day} className="no-underline">
                  {day}
                </abbr>
              </p>
            ))}
          </div>
          <div className="grid grid-cols-7 border-t border-l border-line">
            {visibleDays.map((date) => {
              const day = iso(date);
              const inMonth = date.getUTCMonth() === cursor.getUTCMonth();
              const dayEvents = eventsOn(day);
              const isToday = day === today;
              return (
                <div
                  key={day}
                  className={cn(
                    "relative flex min-h-13 flex-col items-center border-r border-b border-line p-1 transition-colors duration-300 sm:min-h-20 sm:items-stretch sm:p-1.5 md:min-h-28 md:p-2",
                    dayEvents.length && inMonth && "hover:bg-sand-100/60",
                  )}
                >
                  <p
                    className={cn(
                      // Above the phone day button, which it lets taps through to.
                      "pointer-events-none relative z-[1] grid size-7 place-items-center rounded-full text-body-sm tabular-nums",
                      !inMonth && "text-mist/60",
                      isToday && "bg-deep font-semibold text-white",
                    )}
                  >
                    {date.getUTCDate()}
                  </p>
                  {/* Phones: a coloured dot per event, and the whole day is a button that opens the
                      day's (first) event in the bottom sheet. */}
                  {dayEvents.length && inMonth ? (
                    <button
                      type="button"
                      onClick={(click) => open(dayEvents[0], click.currentTarget)}
                      aria-label={`${date.getUTCDate()}: ${dayEvents.map((event) => event.title).join(", ")}`}
                      className={cn(
                        "absolute inset-0 transition-colors duration-300 active:bg-sand-100 sm:hidden",
                        dayEvents.some((event) => event.slug === selected?.slug) && "bg-sand-100",
                      )}
                    />
                  ) : null}
                  {dayEvents.length && inMonth ? (
                    <span
                      aria-hidden
                      className="pointer-events-none relative z-[1] mt-1 flex gap-1 sm:hidden"
                    >
                      {dayEvents.slice(0, 3).map((event) => (
                        <span
                          key={event.slug}
                          className={cn("size-1.5 rounded-full", dot(event))}
                        />
                      ))}
                    </span>
                  ) : null}
                  <ul className="mt-1.5 hidden flex-col gap-1 sm:flex">
                    {dayEvents.slice(0, 2).map((event) => (
                      <li key={event.slug}>
                        <button
                          type="button"
                          onClick={(click) => open(event, click.currentTarget)}
                          className={cn(
                            "flex w-full items-center gap-1.5 rounded-md bg-sand-100 px-1.5 py-1 text-left text-body-2xs leading-tight text-ink transition-colors duration-300 hover:bg-sand-200 md:text-label",
                            selected?.slug === event.slug && "bg-ink text-white hover:bg-ink",
                          )}
                        >
                          <span
                            aria-hidden
                            className={cn("size-1.5 shrink-0 rounded-full", dot(event))}
                          />
                          <span className="truncate">{event.title}</span>
                        </button>
                      </li>
                    ))}
                    {dayEvents.length > 2 ? (
                      <li className="px-1.5 text-body-2xs text-slate">
                        +{dayEvents.length - 2} more
                      </li>
                    ) : null}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* The month's events, with their photos: beside the grid on large screens, under it on
            phones and tablets (where it is the way into each event). */}
        <aside className="border-t border-line bg-sand-50 p-4 sm:p-6 lg:border-t-0 lg:border-l">
          <p className="text-body-xs font-semibold tracking-label text-slate uppercase">
            This month
          </p>
          {monthEvents.length ? (
            <ul className="mt-4 flex flex-col gap-3">
              {monthEvents.map((event) => (
                <li key={event.slug}>
                  <button
                    type="button"
                    onClick={(click) => open(event, click.currentTarget)}
                    className="group flex min-h-14 w-full items-center gap-3 rounded-md p-1.5 text-left transition-colors duration-300 hover:bg-sand-100"
                  >
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-md bg-sand-200">
                      <ResponsiveImage
                        asset={event.image}
                        sizes="44px"
                        fill
                        className="transition-transform duration-700 ease-out-expo group-hover:scale-110"
                      />
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="flex items-center gap-1.5 text-body-2xs font-semibold tracking-label text-turquoise uppercase">
                        <span aria-hidden className={cn("size-1.5 rounded-full", dot(event))} />
                        {dayFormat.format(new Date(event.start))}{" "}
                        {shortMonth.format(new Date(event.start))}
                      </span>
                      <span className="line-clamp-2 text-body-sm leading-snug font-medium transition-colors duration-300 group-hover:text-turquoise-160">
                        {event.title}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-body-sm text-slate">No events this month.</p>
          )}
          {/* Category key. */}
          <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line pt-5">
            {Object.entries(categoryLabels).map(([value, label]) => (
              <li key={value} className="flex items-center gap-1.5 text-body-2xs text-slate">
                <span aria-hidden className={cn("size-1.5 rounded-full", colorOf(value).dot)} />
                {label}
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {/* Phones: the preview rises as a bottom sheet over a dimmed page. */}
      {phone && typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {selected ? (
                <m.div
                  key="sheet"
                  className="fixed inset-0 z-50 md:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <button
                    type="button"
                    aria-label="Close preview"
                    onClick={() => setSelected(null)}
                    className="absolute inset-0 bg-black/45"
                  />
                  <m.div
                    role="dialog"
                    aria-modal="true"
                    aria-label={selected.title}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ duration: 0.55, ease: easeOutExpo }}
                    className="absolute inset-x-0 bottom-0 max-h-[88svh] overflow-y-auto overscroll-contain rounded-t-md bg-white pb-[env(safe-area-inset-bottom)]"
                  >
                    <span
                      aria-hidden
                      className="absolute top-2 left-1/2 z-10 h-1 w-10 -translate-x-1/2 rounded-full bg-white/80 shadow-[0_1px_3px_rgb(0_0_0/0.25)]"
                    />
                    {preview(selected)}
                  </m.div>
                </m.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}

      {/* A compact preview that grows out of the clicked chip. */}
      <AnimatePresence>
        {selected && !phone ? (
          <m.div
            key={selected.slug}
            role="dialog"
            aria-label={selected.title}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.45, ease: easeOutExpo }}
            style={{
              left: anchor.left,
              top: anchor.top,
              width: POP_WIDTH,
              transformOrigin: `${anchor.originX}px ${anchor.originY}px`,
            }}
            className="absolute z-20 overflow-hidden rounded-md bg-white shadow-[0_18px_48px_-12px_rgb(15_30_53/0.35)] ring-1 ring-line"
          >
            {preview(selected)}
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
