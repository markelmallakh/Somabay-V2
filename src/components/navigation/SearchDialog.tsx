"use client";

import { m } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type KeyboardEvent, useId, useMemo, useState, useSyncExternalStore } from "react";
import type { SearchCard, SearchCards, SearchEntry } from "@/types/navigation";
import { routes } from "@/config/routes";
import { easeOutExpo } from "@/components/animations/easing";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";

type SearchDialogProps = {
  open: boolean;
  onClose: () => void;
  index: SearchEntry[];
  cards: SearchCards;
};

/** Phones: search opens as a bottom sheet instead of a panel under the header. */
const PHONE_QUERY = "(max-width: 639px)";
const subscribePhone = (onChange: () => void) => {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const isPhone = () => window.matchMedia(PHONE_QUERY).matches;

/** One result, whatever it is, with where it lives on the site. */
type Result = {
  title: string;
  subtitle: string;
  href: string;
  /** Where it sits on the site, shown as "In …". */
  place: string;
  image?: SearchCard["image"];
  start?: string;
  /** Text the query is matched against. */
  text: string;
};

type SectionKey = keyof SearchCards;

/** Browse sections shown before typing; each also names where its results live. */
const SECTIONS: { key: SectionKey; title: string; href: string }[] = [
  { key: "hotels", title: "Hotels", href: routes.holidays },
  { key: "communities", title: "Communities", href: routes.neighborhoods },
  { key: "activities", title: "Things to do", href: routes.thingsToDo },
  { key: "events", title: "Events", href: routes.events },
];

/** Most widgets a browse section shows (two rows of two). */
const PREVIEW = 4;
const RECENT_KEY = "somabay-recent-searches";
const RECENT_MAX = 5;

const readRecent = (): string[] => {
  try {
    const value = JSON.parse(sessionStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
};

const writeRecent = (items: string[]) => {
  try {
    sessionStorage.setItem(RECENT_KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable: recent searches simply aren't kept */
  }
};

const eventDate = (iso: string) => {
  const date = new Date(`${iso}T00:00:00Z`);
  return {
    day: date.getUTCDate(),
    month: new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" }).format(date),
  };
};

const fromCard = (card: SearchCard, place: string): Result => ({
  title: card.title,
  subtitle: card.subtitle,
  href: card.href,
  place,
  image: card.image,
  start: card.start,
  text: `${card.title} ${card.subtitle} ${card.keywords}`.toLowerCase(),
});

/**
 * Compact search popup under the header. Before typing it shows this session's recent searches
 * and short browse sections (hotels, communities, things to do, events) of small widgets. While
 * typing, every match appears in one list, each tagged with where it lives ("In Hotels",
 * "In Golf", "In Dining"…), so nobody has to guess which section to look in.
 */
export function SearchDialog({ open, onClose, index, cards }: SearchDialogProps) {
  const router = useRouter();
  const inputId = useId();
  const sheet = useSyncExternalStore(subscribePhone, isPhone, () => false);
  const [query, setQuery] = useState("");
  // The popup only mounts on first open, so the session's recent searches can be read up front.
  const [recent, setRecent] = useState<string[]>(readRecent);

  // Upcoming events only; fall back to all of them if none are ahead.
  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const ahead = cards.events.filter((event) => (event.end ?? event.start ?? "") >= today);
    return ahead.length ? ahead : cards.events;
  }, [cards.events]);

  // Everything searchable, as one list.
  const everything = useMemo<Result[]>(() => {
    const seen = new Set<string>();
    const all: Result[] = [];
    const add = (result: Result) => {
      if (seen.has(result.href)) return;
      seen.add(result.href);
      all.push(result);
    };
    for (const section of SECTIONS)
      cards[section.key].forEach((card) => add(fromCard(card, section.title)));
    index.forEach((entry) =>
      add({
        title: entry.label,
        subtitle: entry.section === "Somabay" ? "Page" : entry.section,
        href: entry.href,
        place: entry.section === "Somabay" ? "Somabay" : entry.section,
        text: `${entry.label} ${entry.section}`.toLowerCase(),
      }),
    );
    return all;
  }, [cards, index]);

  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  // Matches in the title rank above matches elsewhere.
  const results = words.length
    ? everything
        .filter((result) => words.every((word) => result.text.includes(word)))
        .sort(
          (a, b) =>
            Number(words.every((word) => b.title.toLowerCase().includes(word))) -
            Number(words.every((word) => a.title.toLowerCase().includes(word))),
        )
    : [];

  const remember = (value: string) => {
    const term = value.trim();
    if (!term) return;
    const next = [
      term,
      ...recent.filter((item) => item.toLowerCase() !== term.toLowerCase()),
    ].slice(0, RECENT_MAX);
    setRecent(next);
    writeRecent(next);
  };

  const changeQuery = (value: string) => setQuery(value);

  const close = () => {
    changeQuery("");
    onClose();
  };

  const go = () => {
    remember(query);
    close();
  };

  // Enter opens the first result.
  const onInputKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || !results[0]) return;
    event.preventDefault();
    remember(query);
    const href = results[0].href;
    close();
    router.push(href);
  };

  return (
    <Dialog open={open} onClose={close} label="Search Somabay" variant="fade">
      <div className="relative size-full">
        <button
          type="button"
          aria-label="Close search"
          tabIndex={-1}
          onClick={close}
          className="absolute inset-0 size-full cursor-default bg-abyss/45 backdrop-blur-[3px]"
        />
        {/* Larger screens: a panel dropping under the header. Phones: a bottom sheet rising from
            the foot of the screen, with a grab handle. */}
        <m.section
          key={sheet ? "sheet" : "panel"}
          initial={sheet ? { y: "100%" } : { opacity: 0, y: -18, scale: 0.97 }}
          animate={sheet ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: sheet ? 0.55 : 0.6, ease: easeOutExpo }}
          style={{ transformOrigin: "50% 0%" }}
          className="absolute top-[calc(var(--header-height)+0.75rem)] left-1/2 flex max-h-[min(42rem,calc(100svh-var(--header-height)-1.5rem))] w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 flex-col overflow-hidden rounded-md bg-white shadow-[0_24px_70px_rgb(15_30_53/0.22)] max-sm:top-auto max-sm:bottom-0 max-sm:left-0 max-sm:h-[85svh] max-sm:max-h-[85svh] max-sm:w-full max-sm:translate-x-0 max-sm:rounded-b-none max-sm:pb-[env(safe-area-inset-bottom)]"
        >
          <span
            aria-hidden
            className="mx-auto mt-2 mb-0.5 h-1 w-10 shrink-0 rounded-full bg-line sm:hidden"
          />
          {/* The field. */}
          <div className="flex shrink-0 items-center gap-3 border-b border-line py-2.5 pr-2.5 pl-4">
            <Icon name="search" className="size-5 shrink-0 text-turquoise" />
            <label htmlFor={inputId} className="sr-only">
              Search Somabay
            </label>
            <input
              id={inputId}
              type="search"
              value={query}
              onChange={(event) => changeQuery(event.target.value)}
              onKeyDown={onInputKey}
              placeholder="Search hotels, golf, dining, communities…"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-body-md text-ink outline-none placeholder:text-mist [&::-webkit-search-cancel-button]:hidden"
              data-autofocus
            />
            {query ? (
              <button
                type="button"
                onClick={() => changeQuery("")}
                className="text-body-xs text-slate hover:text-ink"
              >
                Clear
              </button>
            ) : null}
            <button
              type="button"
              onClick={close}
              aria-label="Close search"
              className="grid size-9 shrink-0 place-items-center rounded-md text-slate transition-colors hover:bg-turquoise-5 hover:text-ink"
            >
              <Icon name="close" className="size-5" />
            </button>
          </div>

          <div
            aria-live="polite"
            data-lenis-prevent
            className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 pt-3 pb-4"
          >
            {words.length ? (
              /* Typing: every match in one list, each saying where it lives. */
              results.length ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <SectionTitle>
                      {results.length} {results.length === 1 ? "result" : "results"}
                    </SectionTitle>
                  </div>
                  <ul className="grid grid-cols-1 gap-x-3 gap-y-0.5 sm:grid-cols-2">
                    {results.map((result, position) => (
                      <m.li
                        key={result.href}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          ease: easeOutExpo,
                          delay: Math.min(position, 8) * 0.03,
                        }}
                      >
                        <Widget result={result} onGo={go} showPlace />
                      </m.li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="rounded-md bg-turquoise-5 px-4 py-8 text-center text-body-sm text-slate">
                  Nothing matches “{query.trim()}”. Try a hotel, a community or an activity.
                </p>
              )
            ) : (
              <>
                {/* This session's recent searches. */}
                {recent.length ? (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <SectionTitle>Recent</SectionTitle>
                      <button
                        type="button"
                        onClick={() => {
                          setRecent([]);
                          writeRecent([]);
                        }}
                        className="text-body-xs text-slate hover:text-ink"
                      >
                        Clear history
                      </button>
                    </div>
                    <ul className="flex flex-wrap gap-1.5">
                      {recent.map((term) => (
                        <li key={term}>
                          <button
                            type="button"
                            onClick={() => changeQuery(term)}
                            className="group flex items-center gap-1.5 rounded-full bg-turquoise-5 py-1 pr-2 pl-2.5 text-body-xs text-ink transition-colors hover:bg-turquoise-10"
                          >
                            <Icon name="clock" className="size-3 text-slate" />
                            {term}
                            <Icon
                              name="corner-down-left"
                              className="size-3 text-mist transition-colors group-hover:text-turquoise"
                            />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {/* Browse: the highlighted few per kind; each title links to its page. */}
                {SECTIONS.map((section, order) => {
                  const all = section.key === "events" ? upcoming : cards[section.key];
                  const picked = all.filter((card) => card.highlighted);
                  const shown = (section.key === "events" || !picked.length ? all : picked).slice(
                    0,
                    section.key === "events" ? 2 : PREVIEW,
                  );
                  if (!shown.length) return null;
                  return (
                    <m.div
                      key={section.key}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                        ease: easeOutExpo,
                        delay: 0.06 + order * 0.05,
                      }}
                      className="flex flex-col gap-1.5"
                    >
                      <Link
                        href={section.href}
                        onClick={close}
                        className="group flex w-fit items-center gap-1 text-label font-semibold tracking-[0.12em] text-slate uppercase transition-colors hover:text-turquoise-160"
                      >
                        {section.title}
                        <Icon
                          name="chevron-right"
                          className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                        />
                      </Link>
                      <ul className="grid grid-cols-1 gap-x-3 gap-y-0.5 sm:grid-cols-2">
                        {shown.map((card) => (
                          <li key={card.href}>
                            <Widget result={fromCard(card, section.title)} onGo={go} />
                          </li>
                        ))}
                      </ul>
                    </m.div>
                  );
                })}
              </>
            )}
          </div>
        </m.section>
      </div>
    </Dialog>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-label font-semibold tracking-[0.12em] text-slate uppercase">{children}</p>
  );
}

/**
 * A small widget: thumbnail (or a date tile, or a link mark for plain pages), title, subtitle and
 * a round arrow to the page. While searching it also says where the result lives.
 */
function Widget({
  result,
  onGo,
  showPlace,
}: {
  result: Result;
  onGo: () => void;
  showPlace?: boolean;
}) {
  const date = result.start ? eventDate(result.start) : null;
  return (
    <Link
      href={result.href}
      onClick={onGo}
      className="group flex items-center gap-2.5 rounded-md p-1 pr-2 transition-colors duration-300 hover:bg-turquoise-5 focus-visible:bg-turquoise-5 focus-visible:outline-none"
    >
      {result.image ? (
        <span className="relative size-9 shrink-0 overflow-hidden rounded-md bg-turquoise-10">
          <ResponsiveImage
            asset={result.image}
            sizes="36px"
            fill
            className="transition-transform duration-700 ease-out-expo group-hover:scale-[1.05]"
          />
        </span>
      ) : date ? (
        <span className="grid size-9 shrink-0 place-content-center rounded-md bg-turquoise-5 text-center text-turquoise-160">
          <span className="font-serif text-[0.9375rem] leading-none">{date.day}</span>
          <span className="text-[0.5rem] font-semibold tracking-label uppercase">{date.month}</span>
        </span>
      ) : (
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-turquoise-5 text-turquoise-160">
          <Icon name="link" className="size-4" />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        {showPlace ? (
          <span className="truncate text-body-2xs font-semibold tracking-[0.1em] text-turquoise-160 uppercase">
            In {result.place}
          </span>
        ) : null}
        <span className="truncate text-body-sm leading-tight font-medium text-ink">
          {result.title}
        </span>
        <span className="truncate text-label leading-snug text-slate">{result.subtitle}</span>
      </span>
      <Icon
        name="arrow-right"
        className="size-3.5 shrink-0 -translate-x-1 text-turquoise opacity-0 transition-[opacity,translate] duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
      />
    </Link>
  );
}
