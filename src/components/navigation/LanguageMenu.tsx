"use client";

import { AnimatePresence, m } from "framer-motion";
import {
  type KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "@/components/animations/easing";
import { Flag, type FlagCode } from "@/components/ui/Flag";
import { Icon } from "@/components/ui/Icon";

const STORAGE_KEY = "somabay-language";
const CHANGE_EVENT = "somabay-language-change";

const readLanguage = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
};

/**
 * Header language switcher: a small rounded menu that eases down from the trigger with its rows
 * rising in, each language in its own name beside a round flag, and a check on the current one.
 * Only English content exists so far, so the choice is remembered but the site stays in English.
 */
type LanguageMenuProps = {
  /**
   * `header`: plain uppercase label; `compact`: the language code only (the phone header);
   * `pill`: the footer's bordered pill with a flag.
   */
  variant?: "header" | "compact" | "pill";
  /** `dark`: white pill on the deep turquoise menu. */
  tone?: "light" | "dark";
  /** Open below the trigger (header) or above it (footer). */
  placement?: "below" | "above";
  /** Pill only: no border, filling its cell (the phone menu's divided row). */
  bare?: boolean;
};

export function LanguageMenu({
  variant = "header",
  placement = "below",
  tone = "light",
  bare = false,
}: LanguageMenuProps) {
  const above = placement === "above";
  const languages = siteConfig.languages;
  const [open, setOpen] = useState(false);
  // The saved choice, read after hydration (the server always renders the default).
  const current = useSyncExternalStore(subscribe, readLanguage, () => null) ?? languages[0].code;
  const root = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();
  const active = languages.find((language) => language.code === current) ?? languages[0];

  // Close on an outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (code: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* not remembered without storage */
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
    setOpen(false);
  };

  // Arrow keys move between rows.
  const onMenuKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const position = items.current.findIndex((item) => item === document.activeElement);
    const step = event.key === "ArrowDown" ? 1 : -1;
    const next = (position + step + languages.length) % languages.length;
    items.current[next]?.focus();
  };

  return (
    <div ref={root} className={cn("relative", bare && "w-full")}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className={
          variant === "pill"
            ? bare
              ? cn(
                  "flex min-h-11 w-full items-center justify-center gap-2 text-body-xs transition-opacity hover:opacity-75",
                  tone === "dark" ? "text-white" : "text-ink",
                )
              : cn(
                  "inline-flex min-h-10 items-center gap-2 rounded-md border px-3 py-1.5 text-body-xs transition-colors",
                  tone === "dark"
                    ? "border-white/25 text-white hover:border-white/60"
                    : "border-line text-ink hover:border-deep/60",
                )
            : variant === "compact"
              ? "flex min-h-11 items-center gap-0.5 px-1.5 uppercase transition-opacity hover:opacity-70"
              : "flex items-center gap-1 uppercase transition-opacity hover:opacity-70"
        }
      >
        {variant === "pill" ? <Flag code={active.code as FlagCode} className="size-4.5" /> : null}
        <span className="sr-only">Language: </span>
        <span
          lang={active.code}
          dir={active.dir}
          className={variant === "pill" ? "font-semibold" : undefined}
        >
          {variant === "compact" ? active.code : active.label}
        </span>
        <Icon
          name="chevron-down"
          className={cn(
            "opacity-80 transition-transform duration-500 ease-out-expo",
            variant === "header" ? "size-4" : "size-3.5",
            // Points toward where the menu opens; flips while it is open.
            above !== open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <m.div
            id={menuId}
            role="menu"
            aria-label="Choose language"
            onKeyDown={onMenuKey}
            initial={{ opacity: 0, y: above ? 6 : -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: above ? 4 : -4, scale: 0.98, transition: { duration: 0.18 } }}
            transition={{ duration: 0.45, ease: easeOutExpo }}
            style={{ transformOrigin: above ? "100% 100%" : "100% 0%" }}
            className={cn(
              "popover-sheet absolute right-0 z-50 w-52 overflow-hidden rounded-md border border-line bg-white text-ink normal-case shadow-[0_18px_50px_rgb(15_30_53/0.18)]",
              above ? "bottom-[calc(100%+0.625rem)]" : "top-[calc(100%+0.875rem)]",
            )}
          >
            <p className="px-4 pt-3 pb-2.5 text-body-xs font-medium text-slate">Language</p>
            <div className="border-t border-line p-1.5">
              {languages.map((language, position) => {
                const selected = language.code === active.code;
                return (
                  <m.button
                    key={language.code}
                    ref={(node) => {
                      items.current[position] = node;
                    }}
                    type="button"
                    role="menuitemradio"
                    aria-checked={selected}
                    autoFocus={selected}
                    onClick={() => choose(language.code)}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: easeOutExpo, delay: 0.04 + position * 0.04 }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-body-sm transition-colors duration-200 outline-none hover:bg-turquoise-5 focus-visible:bg-turquoise-5",
                      selected && "font-medium",
                    )}
                  >
                    <Flag code={language.code as FlagCode} />
                    <span lang={language.code} dir={language.dir} className="flex-1">
                      {language.label}
                    </span>
                    {selected ? <Icon name="check" className="size-4 text-turquoise" /> : null}
                  </m.button>
                );
              })}
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
