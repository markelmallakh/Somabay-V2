"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getLenis } from "@/components/animations/SmoothScroll";
import { Button } from "@/components/ui/Button";

type NavItem = {
  label: string;
  /** The id of the section's heading; the bar finds the section from it. */
  titleId: string;
};

type NeighborhoodSectionNavProps = {
  name: string;
  logo?: string;
  /** Sizing for the logo when it isn't a wide wordmark (e.g. a stacked lockup). */
  logoClassName?: string;
  items: NavItem[];
  /** The button on the right; defaults to the neighborhood's Request Interest. `null` hides it. */
  cta?: { label: string; href: string; external?: boolean } | null;
  /** Hide the logo or name on the left (pages that aren't a single project). */
  hideName?: boolean;
  /** The bar steps aside once the element matching this CSS selector comes into view. */
  hideAt?: string;
};

const defaultCta = { label: "Request interest", href: "#register-interest" };

const sectionOf = (titleId: string) => document.getElementById(titleId)?.closest("section") ?? null;

/**
 * A full-width bar along the foot of the screen for a neighborhood page: the project's logo, a
 * link to each section of the page (the one in view turns turquoise) and a Request Interest button.
 * It slides up once the hero has scrolled away and steps aside when the interest form arrives.
 */
export function NeighborhoodSectionNav({
  name,
  logo,
  logoClassName,
  items,
  cta = defaultCta,
  hideAt = "#register-interest",
  hideName = false,
}: NeighborhoodSectionNavProps) {
  const [shown, setShown] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const height = window.innerHeight;
      const form = document.querySelector(hideAt)?.getBoundingClientRect();
      setShown(window.scrollY > height * 0.6 && (!form || form.top > height * 0.8));
      // The current section: the last one whose top has passed the upper third of the screen.
      let current: string | null = null;
      for (const item of items) {
        const top = sectionOf(item.titleId)?.getBoundingClientRect().top;
        if (top !== undefined && top <= height * 0.35) current = item.titleId;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [items, hideAt]);

  const go = (titleId: string) => {
    const section = sectionOf(titleId);
    if (!section) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(section, { offset: -64, duration: 1.2 });
    else section.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      aria-label={`${name} sections`}
      inert={!shown}
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 hidden border-t border-line bg-white/92 backdrop-blur-xl transition-transform duration-700 ease-out-expo lg:block",
        shown ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="mx-auto flex h-12 max-w-site items-center gap-10 px-gutter">
        {hideName ? null : logo ? (
          // eslint-disable-next-line @next/next/no-img-element -- a small brand SVG, shown as is.
          <img src={logo} alt={name} className={cn("h-4.5 w-auto shrink-0", logoClassName)} />
        ) : (
          <span className="shrink-0 font-serif text-heading-6">{name}</span>
        )}
        <ul className="scrollbar-none flex h-full flex-1 items-stretch justify-center gap-8 overflow-x-auto">
          {items.map((item) => {
            const on = item.titleId === active;
            return (
              <li key={item.titleId} className="flex">
                <button
                  type="button"
                  onClick={() => go(item.titleId)}
                  aria-current={on ? "true" : undefined}
                  className={cn(
                    "relative flex items-center text-body-xs font-semibold tracking-label whitespace-nowrap uppercase transition-colors duration-500",
                    on ? "text-turquoise" : "text-slate hover:text-ink",
                  )}
                >
                  {item.label}
                  {/* A turquoise line along the top edge marks the section in view. */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-0 -top-px h-0.5 origin-left bg-deep transition-transform duration-500 ease-out-expo",
                      on ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </button>
              </li>
            );
          })}
        </ul>
        {cta ? (
          <Button
            href={cta.href}
            external={cta.external}
            icon={cta.external ? "arrow-up-right" : undefined}
            variant="primary"
            size="sm"
            className="shrink-0"
          >
            {cta.label}
          </Button>
        ) : null}
      </div>
    </nav>
  );
}
