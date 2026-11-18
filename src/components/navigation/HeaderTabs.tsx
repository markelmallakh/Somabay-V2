"use client";

import { AnimatePresence, m } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types/navigation";
import { easeOutExpo } from "@/components/animations/easing";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { Icon } from "@/components/ui/Icon";
import { MaskRoll } from "./MaskRoll";
import { NavBadge } from "./NavBadge";

/** Menu entries shown as header tabs, each opening its mega menu. */
export const HEADER_TAB_LABELS = ["Book Stay", "Experience Somabay", "Live At Somabay"];

/** Pause before a hover opens a panel (a pointer passing over the bar shouldn't open one). */
const OPEN_DELAY = 90;
/** Grace period after the pointer leaves before the panel closes. */
const CLOSE_DELAY = 220;

const rise = (order: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: easeOutExpo, delay: 0.08 + order * 0.035 },
});

type HeaderTabsProps = {
  items: MenuItem[];
  /** Tells the header a panel is open, so it turns into one white sheet with the panel. */
  onOpenChange: (open: boolean) => void;
  /** Header text tone at rest (white over a dark hero). */
  onDark: boolean;
};

/**
 * Header tabs centred in a row under the logo bar (Book Stay, Experience Somabay, Live At Somabay). Hovering or
 * clicking a tab drops a white mega menu under the header with that section's feature photo and
 * its subcategories, so visitors reach them without opening the full menu. Closes on leave,
 * Escape, an outside click or navigation.
 */
export function HeaderTabs({ items, onOpenChange, onDark }: HeaderTabsProps) {
  const pathname = usePathname();
  const [active, setActive] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const root = useRef<HTMLDivElement>(null);
  const tabs = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);

  /**
   * Whether the mouse is over the tabs or the panel's box. Checked by position, not by which
   * element is under it: while the panel unrolls (or swaps sections) its lower part is clipped,
   * so a resting pointer can briefly sit over the dimmed page even though the panel is landing
   * right under it, and must not close it.
   */
  const pointerOnMenu = () => {
    const point = pointer.current;
    if (!point) return false;
    return [tabs.current, panel.current].some((element) => {
      const box = element?.getBoundingClientRect();
      return (
        !!box &&
        point.x >= box.left &&
        point.x <= box.right &&
        point.y >= box.top - 1 &&
        point.y <= box.bottom
      );
    });
  };

  const pendingClose = useRef(false);
  const schedule = (next: number | null, delay: number) => {
    clearTimeout(timer.current);
    pendingClose.current = next === null;
    timer.current = setTimeout(() => {
      pendingClose.current = false;
      // A close only lands if the pointer really has left the tabs and the panel.
      if (next === null && pointerOnMenu()) return;
      setActive(next);
    }, delay);
  };
  const close = () => {
    clearTimeout(timer.current);
    setActive(null);
  };

  useEffect(() => onOpenChange(active !== null), [active, onOpenChange]);
  useEffect(() => () => clearTimeout(timer.current), []);
  // Track the mouse while a panel is open (for the close check above).
  useEffect(() => {
    if (active === null) return;
    const track = (event: PointerEvent) => {
      if (event.pointerType === "mouse") pointer.current = { x: event.clientX, y: event.clientY };
    };
    window.addEventListener("pointermove", track, { passive: true });
    return () => window.removeEventListener("pointermove", track);
  }, [active]);
  // Leaving the page (any link inside, or browser navigation) closes the panel.
  const [shownPath, setShownPath] = useState(pathname);
  if (shownPath !== pathname) {
    setShownPath(pathname);
    setActive(null);
  }

  useEffect(() => {
    if (active === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActive(null);
        root.current?.querySelector<HTMLButtonElement>(`[data-tab="${active}"]`)?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const item = active === null ? null : items[active];

  return (
    // Hover-intent and focus-out tracking for the tabs and their panel; the tabs themselves are
    // buttons, so keyboard and touch use them directly.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      ref={root}
      className="h-full"
      onPointerLeave={(event) => {
        if (event.pointerType !== "mouse") return;
        pointer.current = { x: event.clientX, y: event.clientY };
        schedule(null, CLOSE_DELAY);
      }}
      onPointerEnter={() => {
        clearTimeout(timer.current);
        pendingClose.current = false;
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close();
      }}
    >
      <nav ref={tabs} aria-label="Main sections" className="hidden h-full justify-center lg:flex">
        <ul className="flex items-stretch gap-9">
          {items.map((tab, index) => {
            const open = active === index;
            return (
              <li key={tab.href} className="flex">
                <button
                  type="button"
                  data-tab={index}
                  aria-expanded={open}
                  aria-controls="mega-menu"
                  onClick={() => (open ? close() : setActive(index))}
                  onPointerEnter={(event) => {
                    if (event.pointerType !== "mouse") return;
                    pointer.current = { x: event.clientX, y: event.clientY };
                    schedule(index, active === null ? OPEN_DELAY : 0);
                  }}
                  className={cn(
                    "group relative flex items-center gap-1.5 text-body-xs font-semibold tracking-[0.12em] uppercase transition-colors duration-500",
                    // The open tab reads bolder without changing its width: a hairline text shadow
                    // either side thickens the strokes in place (a heavier weight would widen it).
                    open
                      ? cn(
                          "[text-shadow:0.4px_0_0_currentColor,-0.4px_0_0_currentColor]",
                          onDark ? "text-white" : "text-ink",
                        )
                      : onDark
                        ? "text-white/90 hover:text-white"
                        : "text-ink hover:text-turquoise",
                  )}
                >
                  <MaskRoll>{tab.label}</MaskRoll>
                  <Icon
                    name="chevron-down"
                    className={cn(
                      "size-3.5 transition-transform duration-500 ease-out-expo",
                      open && "rotate-180",
                    )}
                  />
                  {/* Underline that draws across under the open tab. */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-0 bottom-0 h-0.5 origin-left bg-current transition-transform duration-500 ease-out-expo",
                      open ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* The page dims under an open panel; a click there closes it. */}
      <AnimatePresence>
        {item ? (
          <m.div
            key="scrim"
            aria-hidden
            onClick={close}
            // The dimmed page counts as "outside": resting the pointer there closes the panel.
            onPointerEnter={(event) => {
              if (event.pointerType !== "mouse") return;
              pointer.current = { x: event.clientX, y: event.clientY };
              schedule(null, CLOSE_DELAY);
            }}
            // Moving on over the dimmed page (e.g. after a close was skipped while the panel
            // was still unrolling) closes it, unless a close is already on its way.
            onPointerMove={(event) => {
              if (event.pointerType !== "mouse" || pendingClose.current) return;
              pointer.current = { x: event.clientX, y: event.clientY };
              if (!pointerOnMenu()) schedule(null, CLOSE_DELAY);
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-x-0 top-full hidden h-svh bg-black/35 lg:block"
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {item ? (
          <m.div
            key="panel"
            ref={panel}
            id="mega-menu"
            onPointerEnter={() => {
              clearTimeout(timer.current);
              pendingClose.current = false;
            }}
            onPointerMove={() => {
              clearTimeout(timer.current);
              pendingClose.current = false;
            }}
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
            // A rounded white panel just under the header, inset by the page padding.
            className="absolute inset-x-gutter top-full mx-auto mt-2 hidden max-w-[calc(var(--container-site)-2*var(--spacing-gutter))] overflow-hidden rounded-media bg-white text-ink shadow-[0_30px_70px_-20px_rgb(0_0_0/0.35)] lg:block"
          >
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={item.href}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                className="grid grid-cols-12 gap-10 p-10"
              >
                <m.div {...rise(0)} className="col-span-3">
                  {/* A picture of the section, not a link: the pages beside it are the way in. */}
                  <div className="relative aspect-[4/3] overflow-hidden rounded-md text-white">
                    <ResponsiveImage asset={item.image} alt="" sizes="22rem" fill />
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(0_0_0/0)_40%,rgb(0_0_0/0.7)_100%)]"
                    />
                    <span className="absolute inset-x-5 bottom-4 font-serif text-heading-6 leading-[1.15]">
                      {item.label}
                    </span>
                  </div>
                </m.div>

                <MegaGroups item={item} onNavigate={close} />
              </m.div>
            </AnimatePresence>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** The section's subcategories in columns; a group with children spreads them over two columns. */
function MegaGroups({ item, onNavigate }: { item: MenuItem; onNavigate: () => void }) {
  const link =
    "group inline-block text-navy transition-colors hover:text-turquoise-160 focus-visible:text-turquoise-160";
  let order = 1;
  const groups = item.groups ?? [];
  const nested = (group: (typeof groups)[number]) => group.children ?? group.preview;
  const flat = groups.every((group) => !nested(group));

  return (
    <div className="col-span-9 flex flex-col">
      {flat ? (
        <ul className="grid grid-cols-3 gap-x-10 gap-y-4">
          {groups.map((group) => (
            <m.li key={group.href} {...rise(order++)}>
              <Link
                href={group.href}
                onClick={onNavigate}
                className={cn(
                  link,
                  "font-serif text-heading-6 leading-[1.25]",
                  group.badge && "inline-flex items-center",
                )}
              >
                <MaskRoll>{group.label}</MaskRoll>
                {group.badge ? <NavBadge>{group.badge}</NavBadge> : null}
              </Link>
            </m.li>
          ))}
        </ul>
      ) : (
        // Groups with children spread over two columns; the single links stack in the third.
        // Fills the panel height, so the divider before the single pages runs its full length.
        <div className="grid flex-1 grid-cols-3 gap-x-10 gap-y-6">
          {groups
            .filter((group) => nested(group))
            .map((group) => (
              <div key={group.href} className="col-span-2">
                <m.div {...rise(order++)}>
                  <Link
                    href={group.href}
                    onClick={onNavigate}
                    className={cn(link, "font-serif text-heading-6 leading-[1.25]")}
                  >
                    <MaskRoll>{group.label}</MaskRoll>
                  </Link>
                </m.div>
                <ul className="mt-4 grid grid-cols-2 gap-x-10 gap-y-2.5">
                  {nested(group)?.map((child) => (
                    <m.li key={child.href} {...rise(order++)}>
                      <Link
                        href={child.href}
                        onClick={onNavigate}
                        className={cn(link, "text-body-md")}
                      >
                        <MaskRoll>{child.label}</MaskRoll>
                      </Link>
                    </m.li>
                  ))}
                </ul>
                {/* Every group ends with a link to its own page, listing all of it. */}
                {nested(group) ? (
                  <m.div {...rise(order++)} className="mt-5">
                    <Link
                      href={group.href}
                      onClick={onNavigate}
                      className="group eyebrow inline-flex items-center gap-2 text-turquoise transition-colors hover:text-turquoise-160"
                    >
                      View all
                      <Icon
                        name="arrow-right"
                        className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1"
                      />
                    </Link>
                  </m.div>
                ) : null}
              </div>
            ))}
          {/* A hairline sets the single pages apart from the group beside them. */}
          <ul className="flex flex-col gap-4 border-l border-line pl-10">
            {groups
              .filter((group) => !nested(group))
              .map((group) => (
                <m.li key={group.href} {...rise(order++)}>
                  <Link
                    href={group.href}
                    onClick={onNavigate}
                    className={cn(link, "font-serif text-heading-6 leading-[1.25]")}
                  >
                    <MaskRoll>{group.label}</MaskRoll>
                  </Link>
                </m.li>
              ))}
          </ul>
        </div>
      )}
      {item.footerLink ? (
        <m.div {...rise(order++)} className="mt-auto pt-8">
          <Link
            href={item.footerLink.href}
            onClick={onNavigate}
            className="group eyebrow inline-flex items-center gap-2 text-turquoise transition-colors hover:text-turquoise-160"
          >
            {item.footerLink.label}
            <Icon
              name="arrow-right"
              className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1"
            />
          </Link>
        </m.div>
      ) : null}
    </div>
  );
}
