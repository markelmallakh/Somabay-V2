"use client";

import { AnimatePresence, m } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import type { WeatherForecast } from "@/lib/weather";
import { cn } from "@/lib/utils";
import type { HeaderData, MenuItem, NavGroup } from "@/types/navigation";
import { getLenis } from "@/components/animations/SmoothScroll";
import { easeOutExpo } from "@/components/animations/easing";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { FooterWeather } from "./FooterWeather";
import { LanguageMenu } from "./LanguageMenu";
import { NavBadge } from "./NavBadge";

type MenuOverlayProps = {
  open: boolean;
  /** Phones: open straight into this section's sub-menu (from a header tab). */
  section?: string | null;
  /** For the weather pill at the foot of the phone menu. */
  forecast?: WeatherForecast | null;
  onClose: () => void;
  data: HeaderData;
  /** Viewport point of the menu button (kept for callers; the menu now simply fades in). */
  origin?: { x: number; y: number };
};

/** Each block fades in with a short rise, a beat after the one before. */
const rise = (order: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: easeOutExpo, delay: 0.12 + order * 0.03 },
});

/**
 * Full-screen menu that simply fades in over the page. Every section is laid out
 * at once, like a sitemap: on desktop a photo on the left, then ruled columns with each section's
 * title and all of its pages under it, so nothing hides behind a hover. The photo follows the
 * section under the pointer. Not a native `<dialog>`, so the header can sit above it: Esc closes,
 * the page behind is made inert and scroll is locked while open.
 */
export function MenuOverlay({
  open,
  onClose,
  data,
  section = null,
  forecast = null,
}: MenuOverlayProps) {
  const sections = data.menu.filter((item) => item.groups);
  const singles = data.menu.filter((item) => !item.groups);
  const [shown, setShown] = useState<MenuItem>(sections[0] ?? data.menu[0]);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const behind = [...document.querySelectorAll<HTMLElement>("main, [data-site-footer]")];
    behind.forEach((element) => (element.inert = true));
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const focus = window.setTimeout(() => panelRef.current?.focus({ preventScroll: true }), 450);
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
      behind.forEach((element) => (element.inert = false));
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(focus);
    };
  }, [open, onClose]);

  // A group with its own sub-pages (Things To Do and its activities) becomes a column of its own,
  // right after the section it belongs to, which keeps its other pages.
  // What's Up Soma sits in the first column, under the single pages (desktop).
  const whatsUp = sections.find((item) => item.label === "What's Up Soma");
  const expanded: MenuItem[] = sections
    .filter((item) => item !== whatsUp)
    .flatMap((item) => {
      const nested = item.groups?.filter((group) => group.children) ?? [];
      if (!nested.length) return [item];
      return [
        { ...item, groups: item.groups?.filter((group) => !group.children) },
        ...nested.map((group) => ({
          label: group.label,
          href: group.href,
          image: item.image,
          groups: group.children,
          footerLink: {
            label: group.label === "Things To Do" ? "All things to do" : "View all",
            href: group.href,
          },
        })),
      ];
    });
  // Book Stay on its own; Experience Somabay stacked over Things To Do; the rest share the last.
  const columns: MenuItem[][] = [expanded.slice(0, 1), expanded.slice(1, 3), expanded.slice(3)];
  let order = 0;

  return (
    <AnimatePresence>
      {open ? (
        <m.div
          key="menu"
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-30 bg-turquoise-160 text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.35, ease: "easeOut" } }}
          exit={{ opacity: 0, transition: { duration: 0.25, ease: "easeIn" } }}
        >
          <div
            ref={panelRef}
            tabIndex={-1}
            className="mx-auto flex h-full max-w-site flex-col overflow-y-auto overscroll-contain px-gutter pt-(--header-bar) pb-8 outline-none"
          >
            {/* Phones and tablets: one column of large rows, sections folding open in place. */}
            <MobileMenu data={data} onNavigate={onClose} section={section} forecast={forecast} />

            {/* One hairline between the header and the menu. */}
            <div className="hidden gap-x-10 gap-y-8 border-t border-white/15 pt-7 lg:grid lg:grid-cols-4 lg:pt-8">
              {/* First column: the single pages, What's Up Soma, then the calls to action. */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  {singles.map((item) => (
                    <m.div
                      key={item.label}
                      {...rise(order++)}
                      onPointerEnter={() => setShown(item)}
                      onFocus={() => setShown(item)}
                    >
                      <SectionTitle item={item} onNavigate={onClose} />
                    </m.div>
                  ))}
                </div>

                {whatsUp ? (
                  <m.section
                    {...rise(order++)}
                    onPointerEnter={() => setShown(whatsUp)}
                    onFocus={() => setShown(whatsUp)}
                    className="border-t border-white/15 pt-5"
                  >
                    <h2 className="font-serif text-body-lg leading-[1.2]">{whatsUp.label}</h2>
                    <ul className="mt-2.5 flex flex-col gap-1.5">
                      {whatsUp.groups?.map((group) => (
                        <li key={group.href}>
                          <MenuLink href={group.href} onNavigate={onClose}>
                            {group.label}
                          </MenuLink>
                        </li>
                      ))}
                    </ul>
                  </m.section>
                ) : null}

                <m.div {...rise(order++)} className="grid gap-3">
                  <Button
                    href={data.actions.contact.href}
                    variant="light"
                    icon="chevron-right"
                    iconPosition="start"
                    onClick={onClose}
                  >
                    {data.actions.contact.label}
                  </Button>
                  <Button
                    href={data.actions.virtualTour.href}
                    external
                    variant="outline-light"
                    icon="cube"
                    iconPosition="start"
                  >
                    {data.actions.virtualTour.label}
                  </Button>
                  {/* FAQs and Careers, small, side by side under the buttons. */}
                  <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                    {data.utilityLinks.map((link) => (
                      <li key={link.href}>
                        <MenuLink href={link.href} onNavigate={onClose} small>
                          {link.label}
                        </MenuLink>
                      </li>
                    ))}
                  </ul>
                </m.div>
              </div>

              <nav
                aria-label="Site sections"
                className="grid content-start gap-x-10 gap-y-10 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-3"
              >
                {columns.map((column, index) => (
                  // A hairline down the middle of the gap before each column.
                  <div
                    key={index}
                    className="relative flex flex-col gap-7 lg:before:absolute lg:before:inset-y-0 lg:before:-left-5 lg:before:w-px lg:before:bg-white/15"
                  >
                    {column.map((item, position) => (
                      <m.section
                        key={item.label}
                        {...rise(order++)}
                        // A hairline across the column between sections stacked in it.
                        className={position > 0 ? "border-t border-white/15 pt-6" : undefined}
                        onPointerEnter={() => setShown(item)}
                        onFocus={() => setShown(item)}
                      >
                        {/* A heading over its pages, not a link of its own. */}
                        <h2 className="font-serif text-body-lg leading-[1.2]">{item.label}</h2>
                        <ul className="mt-2.5 flex flex-col gap-1.5">
                          {item.groups?.map((group) => (
                            <li key={group.href}>
                              <MenuLink href={group.href} onNavigate={onClose}>
                                {group.label}
                                {group.badge ? <NavBadge>{group.badge}</NavBadge> : null}
                              </MenuLink>
                              {group.children ? (
                                <ul className="mt-3 ml-1 flex flex-col gap-2 border-l border-white/15 pl-4">
                                  {group.children.map((child) => (
                                    <li key={child.href}>
                                      <MenuLink href={child.href} onNavigate={onClose} small>
                                        {child.label}
                                      </MenuLink>
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </li>
                          ))}
                          {item.footerLink ? (
                            <li className="mt-2">
                              <Link
                                href={item.footerLink.href}
                                onClick={onClose}
                                className="group eyebrow inline-flex items-center gap-2 text-white transition-opacity hover:opacity-70"
                              >
                                {item.footerLink.label}
                                <Icon
                                  name="arrow-right"
                                  className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1"
                                />
                              </Link>
                            </li>
                          ) : null}
                        </ul>
                      </m.section>
                    ))}
                  </div>
                ))}
              </nav>
            </div>
            {/* A landscape band along the foot: the photo of the section under the pointer (keyed by the
                photo, so sections sharing one, e.g. Experience Somabay and Things To Do, keep it), wiping up
                over the last one. */}
            <m.div
              className="relative mt-8 hidden min-h-32 flex-1 overflow-hidden rounded-md bg-white/5 lg:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.6, ease: "easeOut", delay: 0.2 } }}
            >
              <AnimatePresence initial={false}>
                <m.div
                  key={shown.image.src}
                  className="absolute inset-0"
                  initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
                  animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                  exit={{ opacity: 0, transition: { duration: 0.2, delay: 0.8 } }}
                  transition={{ duration: 0.9, ease: easeOutExpo }}
                >
                  <m.div
                    className="absolute inset-0"
                    initial={{ scale: 1.15 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.6, ease: easeOutExpo }}
                  >
                    <ResponsiveImage
                      asset={shown.image}
                      alt=""
                      sizes="(min-width: 1024px) 100vw, 0px"
                      quality={85}
                      fill
                    />
                  </m.div>
                </m.div>
              </AnimatePresence>
            </m.div>
          </div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}

/** A single page (Home, About, Facilities) as a title over a hairline, with its arrow. */
function SectionTitle({ item, onNavigate }: { item: MenuItem; onNavigate: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className="group flex items-center justify-between gap-4"
    >
      <span className="font-serif text-body-lg leading-[1.2] transition-colors duration-500 group-hover:text-sun">
        {item.label}
      </span>
      <span className="grid size-8 shrink-0 place-items-center rounded-full border border-white/30 transition-[background-color,border-color,color] duration-500 group-hover:border-sun group-hover:bg-sun group-hover:text-ink">
        <Icon name="arrow-right" className="size-3.5" />
      </span>
    </Link>
  );
}

function MenuLink({
  href,
  onNavigate,
  small,
  children,
}: {
  href: string;
  onNavigate: () => void;
  small?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "link-underline inline-block tracking-[0.04em] uppercase transition-colors duration-500 hover:text-white",
        small ? "text-body-xs text-white/65" : "text-[0.8125rem] leading-[1.3] text-white/85",
      )}
    >
      {children}
    </Link>
  );
}

/**
 * The menu on phones and tablets, in two levels. The main list holds every page and section as a
 * 56px row on a hairline, in the header's order: single pages are plain rows; sections carry a
 * chevron and slide their own sub-menu in from the right, with a Back row to return. The page you
 * are on is marked in sun yellow. The calls to action, the weather, the language and the hotline
 * close the main list. A header tab opens the menu straight into its section.
 */
function MobileMenu({
  data,
  onNavigate,
  section,
  forecast,
}: {
  data: HeaderData;
  onNavigate: () => void;
  section: string | null;
  forecast: WeatherForecast | null;
}) {
  const pathname = usePathname();
  const isCurrent = (href: string) => href === pathname;
  const [openLabel, setOpenLabel] = useState<string | null>(section);
  // Which way the panels slide: into a section (1) or back to the main list (-1).
  const [direction, setDirection] = useState(1);
  const opened = data.menu.find((item) => item.label === openLabel && item.groups);

  const enter = (label: string) => {
    setDirection(1);
    setOpenLabel(label);
  };
  const back = () => {
    setDirection(-1);
    setOpenLabel(null);
  };

  const row =
    "flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left font-serif text-[1.375rem] leading-[1.2] transition-colors active:text-sun";
  const slide = {
    initial: (dir: number) => ({ x: dir > 0 ? "100%" : "-30%", opacity: 0 }),
    animate: { x: "0%", opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? "-30%" : "100%", opacity: 0 }),
  };

  return (
    <div className="relative flex min-h-full flex-col overflow-x-clip lg:hidden">
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        {opened?.groups ? (
          <m.nav
            key={opened.label}
            aria-label={opened.label}
            custom={direction}
            variants={slide}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.55, ease: easeOutExpo }}
            className="flex flex-col"
          >
            <button
              type="button"
              onClick={back}
              className="flex min-h-12 items-center gap-2 border-t border-white/15 text-body-xs font-semibold tracking-[0.12em] text-white/75 uppercase transition-colors active:text-sun"
            >
              <Icon name="arrow-right" className="size-4 rotate-180" />
              Main menu
            </button>
            <p className="border-t border-white/15 pt-5 pb-3 font-serif text-heading-4 text-white">
              {opened.label}
            </p>
            <ul>
              {opened.groups.map((group: NavGroup, index) => (
                <m.li
                  key={group.href + group.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.12 + index * 0.04 }}
                  className="border-b border-white/15"
                >
                  <div className="flex items-center justify-between gap-4">
                    <Link
                      href={group.href}
                      onClick={onNavigate}
                      aria-current={isCurrent(group.href) ? "page" : undefined}
                      className={cn(
                        "flex min-h-13 items-center gap-2 text-body-md tracking-[0.04em] text-white/90 uppercase transition-colors active:text-sun",
                        isCurrent(group.href) && "text-sun",
                      )}
                    >
                      {isCurrent(group.href) ? (
                        <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-sun" />
                      ) : null}
                      {group.label}
                      {group.badge ? <NavBadge className="ml-0">{group.badge}</NavBadge> : null}
                    </Link>
                    {/* A group with its own pages (Things To Do) links to its overview. */}
                    {group.children ? (
                      <Link
                        href={group.href}
                        onClick={onNavigate}
                        aria-label={`View all ${group.label}`}
                        className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-body-xs font-semibold tracking-[0.08em] text-white/85 uppercase transition-colors active:text-sun"
                      >
                        View all
                        <Icon name="arrow-right" className="size-3.5" />
                      </Link>
                    ) : null}
                  </div>
                  {group.children ? (
                    // Nested pages (the activities) as a compact two-column list.
                    <ul className="mb-3 grid grid-cols-2 gap-x-4 border-l border-white/15 pl-4">
                      {group.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={onNavigate}
                            aria-current={isCurrent(child.href) ? "page" : undefined}
                            className={cn(
                              "flex min-h-10 items-center text-body-xs tracking-[0.04em] text-white/65 uppercase transition-colors active:text-sun",
                              isCurrent(child.href) && "text-sun",
                            )}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </m.li>
              ))}
            </ul>
            {opened.footerLink ? (
              <Link
                href={opened.footerLink.href}
                onClick={onNavigate}
                className="eyebrow mt-4 inline-flex min-h-11 items-center gap-2 self-start text-white"
              >
                {opened.footerLink.label}
                <Icon name="arrow-right" className="size-4" />
              </Link>
            ) : null}
          </m.nav>
        ) : (
          <m.div
            key="main"
            custom={direction}
            variants={slide}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.55, ease: easeOutExpo }}
            className="flex min-h-full flex-1 flex-col"
          >
            <nav aria-label="Site menu" className="border-t border-white/15">
              <ul>
                {data.menu.map((item, index) => (
                  <m.li key={item.label} {...rise(index)} className="border-b border-white/15">
                    {item.groups ? (
                      <button
                        type="button"
                        aria-haspopup="true"
                        onClick={() => enter(item.label)}
                        className={row}
                      >
                        {item.label}
                        <Icon name="chevron-right" className="size-5 shrink-0 opacity-70" />
                      </button>
                    ) : (
                      // A page with no sub-pages: a plain row, no arrow.
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={isCurrent(item.href) ? "page" : undefined}
                        className={cn(row, isCurrent(item.href) && "text-sun")}
                      >
                        {item.label}
                      </Link>
                    )}
                  </m.li>
                ))}
              </ul>
            </nav>

            <m.div {...rise(data.menu.length)} className="mt-auto grid gap-4 pt-8">
              <div className="grid gap-2.5">
                <Button
                  href={data.actions.contact.href}
                  variant="light"
                  onClick={onNavigate}
                  className="w-full"
                >
                  {data.actions.contact.label}
                </Button>
                <Button
                  href={data.actions.virtualTour.href}
                  external
                  variant="outline-light"
                  icon="cube"
                  iconPosition="start"
                  className="w-full"
                >
                  {data.actions.virtualTour.label}
                </Button>
                {/* FAQs and Careers, small, side by side under the buttons. */}
                <ul className="mt-1 flex justify-center gap-x-8">
                  {data.utilityLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={onNavigate}
                        className="text-body-sm tracking-[0.04em] text-white/75 uppercase active:text-sun"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              {/* One full-width row: the weather, the language and the hotline in equal cells,
                  with hairlines above and below and between them (no buttons' borders). */}
              <div className="grid grid-cols-3 divide-x divide-white/15 border-y border-white/15">
                {forecast ? (
                  <FooterWeather forecast={forecast} tone="dark" short bare />
                ) : (
                  <span aria-hidden />
                )}
                <LanguageMenu variant="pill" placement="above" tone="dark" bare />
                <a
                  href={siteConfig.contact.hotlineHref}
                  className="flex min-h-11 items-center justify-center gap-2 text-body-xs font-semibold text-white tabular-nums transition-opacity hover:opacity-75"
                >
                  <Icon name="phone-solid" className="size-3.5 text-sun" />
                  <span className="sr-only">Hotline </span>
                  {siteConfig.contact.hotline}
                </a>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
