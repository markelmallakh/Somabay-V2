"use client";

import { AnimatePresence, m } from "framer-motion";
import { type KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "@/components/animations/easing";
import { Icon } from "./Icon";

type Country = { iso: string; name: string; dial: string };

/** Egypt first (the default), then the countries Somabay's guests and buyers come from most. */
const countries: Country[] = [
  { iso: "EG", name: "Egypt", dial: "+20" },
  { iso: "AE", name: "United Arab Emirates", dial: "+971" },
  { iso: "SA", name: "Saudi Arabia", dial: "+966" },
  { iso: "KW", name: "Kuwait", dial: "+965" },
  { iso: "QA", name: "Qatar", dial: "+974" },
  { iso: "BH", name: "Bahrain", dial: "+973" },
  { iso: "OM", name: "Oman", dial: "+968" },
  { iso: "JO", name: "Jordan", dial: "+962" },
  { iso: "LB", name: "Lebanon", dial: "+961" },
  { iso: "GB", name: "United Kingdom", dial: "+44" },
  { iso: "DE", name: "Germany", dial: "+49" },
  { iso: "AT", name: "Austria", dial: "+43" },
  { iso: "CH", name: "Switzerland", dial: "+41" },
  { iso: "NL", name: "Netherlands", dial: "+31" },
  { iso: "BE", name: "Belgium", dial: "+32" },
  { iso: "FR", name: "France", dial: "+33" },
  { iso: "IT", name: "Italy", dial: "+39" },
  { iso: "ES", name: "Spain", dial: "+34" },
  { iso: "PL", name: "Poland", dial: "+48" },
  { iso: "CZ", name: "Czechia", dial: "+420" },
  { iso: "SE", name: "Sweden", dial: "+46" },
  { iso: "DK", name: "Denmark", dial: "+45" },
  { iso: "NO", name: "Norway", dial: "+47" },
  { iso: "UA", name: "Ukraine", dial: "+380" },
  { iso: "RU", name: "Russia", dial: "+7" },
  { iso: "US", name: "United States", dial: "+1" },
  { iso: "CA", name: "Canada", dial: "+1" },
];

/** The country's flag as an emoji, built from its ISO code (regional indicator letters). */
const flagOf = (iso: string) =>
  String.fromCodePoint(...[...iso].map((letter) => 0x1f1e6 + letter.charCodeAt(0) - 65));

type PhoneFieldProps = {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  autoComplete?: string;
  className?: string;
};

/**
 * A phone number with its country code: one box like the other fields, a country-code button at
 * its start (the flag and dial code, opening a menu drawn like the form dropdowns, with a
 * search row) and the number with its floating label. The dial code is submitted as
 * `<name>Code`, beside the number.
 */
export function PhoneField({
  id,
  name,
  label,
  required,
  error,
  hint,
  autoComplete = "tel-national",
  className,
}: PhoneFieldProps) {
  const [country, setCountry] = useState(countries[0]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const number = useRef<HTMLInputElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const listId = useId();

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q.replace(/^\+?/, "+")) ||
        c.iso.toLowerCase() === q,
    );
  }, [query]);

  useEffect(() => {
    if (!open) return;
    search.current?.focus();
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

  const choose = (next: Country) => {
    setCountry(next);
    setOpen(false);
    setQuery("");
    number.current?.focus();
  };

  // Arrow keys move from the search row into the list and between rows.
  const onListKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const position = items.current.findIndex((item) => item === document.activeElement);
    const step = event.key === "ArrowDown" ? 1 : -1;
    const count = shown.length;
    if (!count) return;
    const next = position === -1 ? (step === 1 ? 0 : count - 1) : (position + step + count) % count;
    items.current[next]?.focus();
  };

  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div ref={wrap} className="relative">
        <input type="hidden" name={`${name}Code`} value={country.dial} />
        {/* One box for both parts: it takes the fields' hover and quiet focus as a whole. */}
        <div
          data-invalid={error ? true : undefined}
          data-field-box
          className={cn(
            "flex items-stretch rounded-md border border-ink/15 bg-white text-ink",
            "transition-[border-color,box-shadow] duration-500 ease-out-expo hover:border-ink/35",
            "focus-within:border-turquoise-160/55 focus-within:shadow-[0_6px_16px_-12px_rgb(27_49_80/0.18)]",
            "data-invalid:border-alert",
            open && "border-turquoise-160/55 shadow-[0_6px_16px_-12px_rgb(27_49_80/0.18)]",
          )}
        >
          <button
            ref={trigger}
            type="button"
            onClick={() => setOpen((current) => !current)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setOpen(true);
              }
            }}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            aria-label={`Country code: ${country.name} ${country.dial}`}
            className="flex shrink-0 items-center gap-2 rounded-l-md pr-3 pl-4 text-body outline-none focus-visible:bg-turquoise-5"
          >
            <span aria-hidden className="text-[1.25rem] leading-none">
              {flagOf(country.iso)}
            </span>
            <span>{country.dial}</span>
            <Icon
              name="chevron-down"
              data-field-icon
              className={cn(
                "size-3.5 text-slate transition-transform duration-500 ease-out-expo",
                open && "rotate-180",
              )}
            />
          </button>
          <span aria-hidden data-field-rule className="my-3 w-px bg-line" />
          <div className="relative min-w-0 flex-1">
            <input
              ref={number}
              id={id}
              name={name}
              type="tel"
              inputMode="tel"
              required={required}
              autoComplete={autoComplete}
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy}
              placeholder=" "
              className="peer block w-full rounded-r-md bg-transparent px-4 pt-6 pb-2 text-body text-ink outline-none"
            />
            <label
              data-field-label
              htmlFor={id}
              className={cn(
                "pointer-events-none absolute top-4 left-4 origin-top-left text-body text-slate",
                "transition-[translate,scale,color] duration-300 ease-out-expo",
                "peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-turquoise-160",
                "peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:scale-75",
              )}
            >
              {label}
              {required ? <span aria-hidden> *</span> : null}
            </label>
          </div>
        </div>

        <AnimatePresence>
          {open ? (
            <m.div
              id={listId}
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.18 } }}
              transition={{ duration: 0.45, ease: easeOutExpo }}
              style={{ transformOrigin: "50% 0%" }}
              onKeyDown={onListKey}
              className="popover-sheet absolute top-[calc(100%+0.5rem)] left-0 z-50 w-[max(100%,20rem)] overflow-hidden rounded-md border border-line bg-white text-ink shadow-[0_18px_50px_rgb(15_30_53/0.18)]"
            >
              <p className="px-4 pt-3 pb-2.5 text-body-xs font-medium text-slate">Country code</p>
              <div className="flex items-center gap-2 border-t border-line px-4">
                <Icon name="search" className="size-4 text-slate" />
                <input
                  ref={search}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search country or code"
                  aria-label="Search country or code"
                  className="h-11 w-full bg-transparent text-body-sm outline-none placeholder:text-slate"
                />
              </div>
              <div
                role="listbox"
                aria-label="Country code"
                data-lenis-prevent
                className="max-h-64 overflow-y-auto border-t border-line p-1.5"
              >
                {shown.length ? (
                  shown.map((option, position) => {
                    const selected = option.iso === country.iso;
                    return (
                      <m.button
                        key={option.iso}
                        ref={(node) => {
                          items.current[position] = node;
                        }}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => choose(option)}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          ease: easeOutExpo,
                          delay: Math.min(position, 8) * 0.03,
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-body-sm transition-colors duration-200 outline-none hover:bg-turquoise-5 focus-visible:bg-turquoise-5",
                          selected && "font-medium",
                        )}
                      >
                        <span aria-hidden className="w-6 text-[1.125rem] leading-none">
                          {flagOf(option.iso)}
                        </span>
                        <span className="flex-1 truncate">{option.name}</span>
                        <span className="text-slate">{option.dial}</span>
                        <Icon
                          name="check"
                          className={cn("size-4 text-turquoise", !selected && "invisible")}
                        />
                      </m.button>
                    );
                  })
                ) : (
                  <p className="px-2.5 py-2 text-body-sm text-slate">No matching country</p>
                )}
              </div>
            </m.div>
          ) : null}
        </AnimatePresence>
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-body-sm text-alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-body-sm text-slate">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
