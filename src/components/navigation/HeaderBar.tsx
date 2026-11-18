"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, m } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import { hasDarkHero, hasShortHeroShade, routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import type { HeaderData } from "@/types/navigation";
import type { WeatherForecast } from "@/lib/weather";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { easeOutExpo } from "@/components/animations/easing";
import { getLenis } from "@/components/animations/SmoothScroll";
import { HEADER_TAB_LABELS, HeaderTabs } from "./HeaderTabs";
import { LanguageMenu } from "./LanguageMenu";
import { useHeaderScroll } from "./useHeaderScroll";
import { NavBadge } from "./NavBadge";

const MenuOverlay = dynamic(() => import("./MenuOverlay").then((module) => module.MenuOverlay));
const SearchDialog = dynamic(() => import("./SearchDialog").then((module) => module.SearchDialog));
const WeatherDialog = dynamic(() =>
  import("./WeatherDialog").then((module) => module.WeatherDialog),
);

/** Menu icon lines: the Figma "menu-03" bars, and the X they fold into when the menu is open. */
// Drawn 1:1 in pixels (42 × 22) with each line on the same sub-pixel offset, so all three
// render with exactly the same weight.
const MENU_LINES = [
  {
    closed: "M17.5 5L35 5",
    open: "M14.5 4.5L27.5 17.5",
    hover: "group-hover:-translate-x-[10.5px]",
  },
  { closed: "M7 11L35 11", open: "M21 11L21 11", hover: "" },
  {
    closed: "M7 17L24.5 17",
    open: "M14.5 17.5L27.5 4.5",
    hover: "group-hover:translate-x-[10.5px]",
  },
];

type HeaderBarProps = {
  temperature: number | null;
  /** Full forecast for the weather popup opened from the temperature. */
  forecast: WeatherForecast | null;
  data: HeaderData;
};

export function HeaderBar({ temperature, forecast, data }: HeaderBarProps) {
  const pathname = usePathname();
  // The header stays put while scrolling and condenses into a compact bar.
  const { scrolled: pastTop, up } = useHeaderScroll();
  // Scrolling down folds the tabs row away, leaving the logo bar on white; scrolling back up
  // anywhere on the page brings the tabs back. Only the tabs row moves, so the switch stays calm.
  const scrolled = pastTop && !up;
  const solid = pastTop;
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuLoaded, setMenuLoaded] = useState(false);
  const [menuOrigin, setMenuOrigin] = useState({ x: 0, y: 0 });
  // Phones: a header tab opens the menu straight into its section's sub-menu.
  const [menuSection, setMenuSection] = useState<string | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [searchLoaded, setSearchLoaded] = useState(false);
  const [weatherOpen, setWeatherOpen] = useState(false);
  const [weatherLoaded, setWeatherLoaded] = useState(false);
  const [weatherAnchor, setWeatherAnchor] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  // A header tab's mega menu is open (desktop): it floats as a rounded white panel under the
  // header, and the bar keeps its own look (transparent over a hero).
  const [, setMegaOpen] = useState(false);
  // Phones and tablets: the header tab whose white panel is open under the header; there the bar
  // and the panel read as one white sheet.
  const [phoneTab, setPhoneTab] = useState<string | null>(null);
  const megaOpen = phoneTab !== null;
  const tabItems = data.menu.filter((item) => HEADER_TAB_LABELS.includes(item.label));
  // The footer carries the weather and language too, so the bar steps aside once it arrives.
  const [atFooter, setAtFooter] = useState(false);

  useEffect(() => {
    const footer = document.querySelector("[data-site-footer]");
    if (!footer) return;
    // Only once the footer fills most of the screen (its top within the top quarter), not as soon
    // as its first edge scrolls in. Measured on scroll rather than with an IntersectionObserver,
    // whose margin is ignored when the site runs inside a frame (the review previews).
    let frame = 0;
    const check = () => {
      frame = 0;
      setAtFooter(footer.getBoundingClientRect().top < window.innerHeight * 0.25);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  const backdropOverHero = hasDarkHero(pathname) && !solid && !megaOpen;
  const overHero = backdropOverHero && !menuOpen;
  // Past the top the bar sits on a dark frosted gradient, so it keeps the white look it has over
  // the hero. A mega menu or phone panel still turns it into one white sheet with its panel.
  const darkBar = solid && !menuOpen && !megaOpen;
  // Light (white) header over a dark hero, on the dark scrolled bar, and over the open menu's deep
  // turquoise screen.
  const onDark = overHero || darkBar || menuOpen;

  // The phone tab panel closes on navigation and Escape, and holds the page still while open.
  const [panelPath, setPanelPath] = useState(pathname);
  if (panelPath !== pathname) {
    setPanelPath(pathname);
    setPhoneTab(null);
  }
  useEffect(() => {
    if (!phoneTab) return;
    const lenis = getLenis();
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPhoneTab(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [phoneTab]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    menuButton.current?.focus({ preventScroll: true });
  }, []);
  const openMenu = (section: string | null, from: HTMLElement | null) => {
    const box = from?.getBoundingClientRect();
    if (box) setMenuOrigin({ x: box.left + box.width / 2, y: box.top + box.height / 2 });
    setMenuSection(section);
    setMenuLoaded(true);
    setMenuOpen(true);
  };
  const toggleMenu = () => {
    // Homepage-only demo: the menu button stays put (only the header dropdowns open).
    if (siteConfig.homepageOnly) return;
    if (menuOpen) {
      closeMenu();
      return;
    }
    setPhoneTab(null);
    openMenu(null, menuButton.current);
  };
  const openSearch = () => {
    setSearchLoaded(true);
    setSearchOpen(true);
  };

  const divider = <span aria-hidden className="h-5 w-px bg-current opacity-30" />;
  // The tabs row folds away once the page scrolls (the bar condenses) and under the open menu.
  const showTabs = !scrolled && !menuOpen;
  const hidden = atFooter && !menuOpen && !searchOpen && !phoneTab;
  const phoneItem = tabItems.find((item) => item.label === phoneTab);
  // Past the top the bar tightens on desktop: 4rem tall with a smaller logo, on solid white.
  const compact = solid && !menuOpen;

  return (
    <>
      {/* The header's backdrop sits in its own layer beneath the menu, so the menu's circle sweeps
          over it instead of being sliced along the header's edge; the bar itself stays on top. */}
      {/* Two layers cross-fade, since a gradient can't animate into a colour: the dark-hero shade
          and the frosted white sheet. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-[29] transition-[transform,height] duration-500 ease-in-out",
          scrolled
            ? "h-(--header-bar) lg:h-16"
            : compact
              ? "h-(--header-height) lg:h-[calc(4rem+var(--header-tabs))]"
              : "h-(--header-height)",
          hidden && "-translate-y-full",
        )}
      >
        {/* Over a dark hero: a tall, eased shade that fades out well below the header, so it
            reads as soft light falloff rather than a band with an edge. */}
        <div
          className={cn(
            "absolute inset-x-0 top-0 bg-[linear-gradient(to_bottom,rgb(0_0_0/0.62)_0%,rgb(0_0_0/0.5)_30%,rgb(0_0_0/0.3)_55%,rgb(0_0_0/0.12)_78%,rgb(0_0_0/0.03)_92%,transparent_100%)] transition-opacity duration-300 ease-out",
            hasShortHeroShade(pathname)
              ? "h-[calc(var(--header-height)+1rem)]"
              : "h-[calc(var(--header-height)+9rem)]",
            backdropOverHero ? "opacity-100" : "opacity-0",
          )}
        />
        {/* Past the top: a dark frosted gradient, deepest at the top, that runs on below the bar
            and fades out (blur too) with no edge, so the white header reads over any section. */}
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-[calc(100%+4rem)] bg-[linear-gradient(to_bottom,rgb(0_0_0/0.35)_0%,rgb(0_0_0/0.26)_35%,rgb(0_0_0/0.13)_65%,rgb(0_0_0/0.04)_85%,transparent_100%)] [mask-image:linear-gradient(to_bottom,black_0%,black_45%,transparent_100%)] backdrop-blur-md transition-opacity duration-500 ease-in-out",
            darkBar ? "opacity-100" : "opacity-0",
          )}
        />
        {/* Frosted white: with a mega menu or phone panel open the bar turns solid white, so the
            bar and the white panel read as one sheet and the tabs keep their full contrast. */}
        <div
          className={cn(
            "absolute inset-0 transition-[opacity,background-color,box-shadow] duration-500 ease-in-out",
            megaOpen
              ? "bg-white/[0.97] shadow-[0_1px_0_rgb(15_30_53/0.06),0_4px_10px_-6px_rgb(15_30_53/0.09)] backdrop-blur-lg"
              : // At the top of light pages: fully transparent, on the page's own colour.
                "bg-transparent shadow-none",
            backdropOverHero ? "opacity-0" : "opacity-100",
          )}
        />
      </div>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-[transform,color] duration-500 ease-in-out",
          hidden && "-translate-y-full",
          onDark ? "text-white" : "text-ink",
        )}
      >
        {/* Logo bar: menu and search on the left, the logo centred, weather, language and the
            hotline on the right. */}
        <div
          className={cn(
            "mx-auto grid h-(--header-bar) max-w-site grid-cols-[1fr_auto_1fr] items-center gap-3 px-gutter text-body-xs font-semibold transition-[height] duration-500 ease-in-out sm:gap-6",
            compact && "lg:h-16",
          )}
        >
          <div className="flex items-center gap-5 lg:gap-6">
            <button
              ref={menuButton}
              type="button"
              onClick={toggleMenu}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              className={cn(
                // At least 44px tall so it is an easy thumb target on phones.
                "group relative z-10 -my-2 flex min-h-11 shrink-0 items-center gap-2.5 py-2 transition-colors duration-500 sm:gap-3",
                // White over a hero, on the dark scrolled bar and with the menu open; black on the
                // white sheet of an open dropdown; turquoise at the top of light pages.
                menuOpen
                  ? "hover:text-sun focus-visible:text-sun"
                  : darkBar || overHero
                    ? "text-white"
                    : megaOpen
                      ? "text-ink"
                      : "text-turquoise",
              )}
            >
              {/* Figma "menu-03": staggered lines that swap sides on hover, folding into an X that
                  draws in slightly on hover. */}
              {/* Phones: the lines sit in a turquoise square, the same over a photo or the white
                  bar. Desktop: the lines alone in the bar's accent colour. */}
              <span className="grid size-10 place-items-center rounded-md bg-deep text-white lg:contents lg:text-inherit">
                <svg
                  aria-hidden
                  viewBox="0 0 42 22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  className="h-[1.0625rem] w-8 overflow-visible lg:h-[1.375rem] lg:w-[2.625rem]"
                >
                  {MENU_LINES.map((line, index) => (
                    <m.path
                      key={index}
                      initial={false}
                      animate={{
                        d: menuOpen ? line.open : line.closed,
                        opacity: menuOpen && index === 1 ? 0 : 1,
                      }}
                      transition={{ duration: 0.7, ease: easeOutExpo, delay: menuOpen ? 0.1 : 0 }}
                      className={cn(
                        "transition-transform duration-700 ease-out-expo",
                        !menuOpen && line.hover,
                        menuOpen && "group-hover:scale-[0.82] group-focus-visible:scale-[0.82]",
                      )}
                      style={{ transformOrigin: "21px 11px", transformBox: "view-box" }}
                    />
                  ))}
                </svg>
              </span>
              <span className="sr-only">{menuOpen ? "Close site menu" : "Open site menu"}</span>
              {/* The label rolls between MENU and CLOSE in step with the lines folding into an X.
                  Phones show the icon alone. */}
              <span
                aria-hidden
                className="relative hidden h-[1.2em] overflow-hidden leading-[1.2] tracking-[0.12em] uppercase lg:block"
              >
                {/* Both words stacked, so the box is as wide as the longer one. */}
                <span
                  aria-hidden
                  className={cn(
                    "flex flex-col transition-transform duration-700 ease-out-expo motion-reduce:transition-none",
                    menuOpen && "-translate-y-1/2",
                  )}
                >
                  <span>Menu</span>
                  <span>Close</span>
                </span>
              </span>
            </button>
            <span className="hidden md:contents">{divider}</span>
            <button
              type="button"
              onClick={openSearch}
              className="-ml-2 flex min-h-11 min-w-11 items-center justify-center gap-2 transition-opacity hover:opacity-70 md:ml-0 md:min-w-0"
            >
              <Icon name="search" className="size-5" />
              <span className="sr-only tracking-[0.12em] uppercase md:not-sr-only">Search</span>
            </button>
          </div>

          {/* Always home: it closes the menu (or search) first, and on the homepage itself it
              glides back to the top. */}
          <Link
            href={routes.home}
            className="relative z-10 shrink-0"
            aria-label="Somabay — home"
            onClick={() => {
              if (menuOpen) setMenuOpen(false);
              setSearchOpen(false);
              setPhoneTab(null);
              if (pathname === routes.home) {
                const lenis = getLenis();
                if (lenis) lenis.scrollTo(0, { duration: 1.2 });
                else window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            <Logo
              tone={onDark ? "light" : "brand"}
              title="Somabay"
              className={cn(
                "w-[6.25rem] transition-[width] duration-500 ease-in-out sm:w-28",
                compact ? "lg:w-28" : "lg:w-36",
              )}
            />
          </Link>

          <nav
            aria-label="Utility"
            className="flex items-center justify-end gap-1 sm:gap-5 lg:gap-6"
          >
            {/* Phones and tablets: the language is reachable without opening the menu. */}
            <span className="text-body-xs lg:hidden">
              <LanguageMenu variant="compact" />
            </span>
            <span className="hidden lg:contents">
              {temperature !== null ? (
                <>
                  {forecast ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        const box = event.currentTarget.getBoundingClientRect();
                        setWeatherAnchor({
                          left: box.left,
                          top: box.top,
                          width: box.width,
                          height: box.height,
                        });
                        setWeatherLoaded(true);
                        setWeatherOpen(true);
                      }}
                      aria-haspopup="dialog"
                      className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
                    >
                      <Icon name="cloud-sun" className="size-5" />
                      <span>
                        <span className="sr-only">Weather forecast. Current temperature: </span>
                        {temperature}°C
                      </span>
                    </button>
                  ) : (
                    <p className="flex items-center gap-1.5">
                      <Icon name="cloud-sun" className="size-5" />
                      <span>
                        <span className="sr-only">Current temperature at Somabay: </span>
                        {temperature}°C
                      </span>
                    </p>
                  )}
                  {divider}
                </>
              ) : null}
              <LanguageMenu />
              {divider}
            </span>
            <a
              href={siteConfig.contact.hotlineHref}
              className="-mr-3 flex min-h-11 min-w-11 items-center justify-center gap-1.5 transition-opacity hover:opacity-70 md:mr-0 md:min-w-0 md:justify-start"
            >
              <Icon name="phone-solid" className="size-[0.9375rem] opacity-75" />
              <span className="sr-only md:not-sr-only">
                <span className="sr-only">Call our hotline </span>
                {siteConfig.contact.hotline}
              </span>
            </a>
          </nav>
        </div>

        {/* Tabs row: a hairline under the logo bar, then the three main sections, each opening its
            mega menu (which drops from this row's foot). */}
        <div
          className={cn(
            "relative hidden transition-[height,opacity] duration-500 ease-in-out lg:block",
            showTabs ? "h-(--header-tabs) opacity-100" : "pointer-events-none h-0 opacity-0",
          )}
        >
          <div className="mx-auto h-full max-w-site px-gutter">
            <div className="h-full border-t border-current/15">
              <HeaderTabs items={tabItems} onOpenChange={setMegaOpen} onDark={onDark} />
            </div>
          </div>
        </div>
        {/* Phones and tablets: the three main sections as a row of tabs under the logo bar; each
            opens the menu straight into that section. Folds away with the desktop tabs on scroll. */}
        <div
          className={cn(
            "mx-auto flex max-w-[calc(100%-2*var(--spacing-gutter))] justify-between gap-3 border-t border-current/15 transition-[height,opacity] duration-500 ease-in-out lg:hidden",
            showTabs ? "h-(--header-tabs) opacity-100" : "pointer-events-none h-0 opacity-0",
          )}
        >
          {tabItems.map((item) => (
            <button
              key={item.label}
              type="button"
              tabIndex={showTabs ? undefined : -1}
              aria-expanded={phoneTab === item.label}
              onClick={() => setPhoneTab((open) => (open === item.label ? null : item.label))}
              className="relative flex h-full items-center text-[0.6875rem] font-semibold tracking-[0.06em] whitespace-nowrap uppercase transition-opacity active:opacity-60"
            >
              {item.label}
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-0 bottom-0 h-0.5 origin-left bg-deep transition-transform duration-500 ease-out-expo",
                  phoneTab === item.label ? "scale-x-100" : "scale-x-0",
                )}
              />
            </button>
          ))}
        </div>
      </header>

      {/* Phones and tablets: a header tab drops a white panel from the top, under the header (which
          turns white with it), listing that section's pages — like the desktop mega menu. */}
      <AnimatePresence>
        {phoneItem?.groups ? (
          <>
            <m.button
              key="shade"
              type="button"
              tabIndex={-1}
              aria-hidden
              onClick={() => setPhoneTab(null)}
              className="fixed inset-0 z-[28] cursor-default bg-abyss/45 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
            <m.div
              key="panel"
              data-lenis-prevent
              className="fixed inset-x-0 top-0 z-[35] max-h-svh overflow-y-auto overscroll-contain bg-white pt-(--header-height) text-ink shadow-soft lg:hidden"
              initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
              animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
              exit={{ clipPath: "inset(0% 0% 100% 0%)", transition: { duration: 0.35 } }}
              transition={{ duration: 0.6, ease: easeOutExpo }}
            >
              <nav aria-label={phoneItem.label} className="px-gutter pt-2 pb-6">
                <ul>
                  {phoneItem.groups.map((group, index) => (
                    <m.li
                      key={group.href + group.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.1 + index * 0.04 }}
                      className="border-b border-line"
                    >
                      <Link
                        href={group.href}
                        onClick={() => setPhoneTab(null)}
                        aria-current={group.href === pathname ? "page" : undefined}
                        className={cn(
                          "flex min-h-12 items-center text-body-sm font-medium tracking-[0.04em] uppercase transition-colors active:text-turquoise",
                          group.href === pathname && "text-turquoise",
                        )}
                      >
                        {group.label}
                        {group.badge ? <NavBadge>{group.badge}</NavBadge> : null}
                      </Link>
                      {group.children ? (
                        <ul className="mb-3 grid grid-cols-2 gap-x-4 border-l border-line pl-4">
                          {group.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                onClick={() => setPhoneTab(null)}
                                className={cn(
                                  "flex min-h-10 items-center text-body-xs tracking-[0.04em] text-slate uppercase transition-colors active:text-turquoise",
                                  child.href === pathname && "text-turquoise",
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
                {phoneItem.footerLink ? (
                  <Link
                    href={phoneItem.footerLink.href}
                    onClick={() => setPhoneTab(null)}
                    className="eyebrow mt-4 flex min-h-11 items-center justify-center gap-2 text-turquoise"
                  >
                    {phoneItem.footerLink.label}
                    <Icon name="arrow-right" className="size-4" />
                  </Link>
                ) : null}
              </nav>
            </m.div>
          </>
        ) : null}
      </AnimatePresence>

      {menuLoaded ? (
        <MenuOverlay
          open={menuOpen}
          onClose={closeMenu}
          origin={menuOrigin}
          data={data}
          section={menuSection}
          forecast={forecast}
        />
      ) : null}
      {searchLoaded ? (
        <SearchDialog
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          index={data.searchIndex}
          cards={data.searchCards}
        />
      ) : null}
      {weatherLoaded && forecast ? (
        <WeatherDialog
          open={weatherOpen}
          onClose={() => setWeatherOpen(false)}
          forecast={forecast}
          anchor={weatherAnchor}
        />
      ) : null}
    </>
  );
}
