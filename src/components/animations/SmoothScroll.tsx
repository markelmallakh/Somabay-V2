"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";

let lenisInstance: Lenis | null = null;

/** Returns the active smooth-scroll instance (null when disabled, e.g. reduced motion). */
export function getLenis(): Lenis | null {
  return lenisInstance;
}

/**
 * Inertial smooth scrolling driven by GSAP's ticker so ScrollTrigger and Lenis stay in sync.
 * Disabled entirely for visitors who prefer reduced motion and on touch devices, where native
 * momentum scrolling is already smooth.
 */
export function SmoothScroll() {
  useEffect(() => {
    registerGsap();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || coarse) return;

    // In-page links (e.g. "Book treatment" → #booking) glide to their section and work again
    // even when the address already has that hash. Sections clear the fixed header with their
    // own scroll-margin (scroll-mt-(--header-height)), which Lenis honours.
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      anchors: true,
    });
    lenisInstance = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  useHashLanding();
  useRefreshOnContentResize();
  return null;
}

/**
 * ScrollTrigger measures where each pinned section starts once, and only measures again when the
 * window resizes. When content above a pin changes height (a tab with fewer rows, an image or a
 * card settling), the pin would start at the old position: the section scrolls up past the top,
 * then snaps back down once the stale start is reached. Measure again whenever the page's height
 * changes, once it has settled.
 */
function useRefreshOnContentResize() {
  useEffect(() => {
    registerGsap();
    let height = document.body.scrollHeight;
    let timer = 0;
    const observer = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const next = document.body.scrollHeight;
        if (Math.abs(next - height) < 2) return;
        ScrollTrigger.refresh();
        // The height after the refresh (pin spacers included), so the refresh doesn't trigger itself.
        height = document.body.scrollHeight;
      }, 150);
    });
    observer.observe(document.body);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, []);
}

/**
 * Arriving on a page with a hash (e.g. a drawer's "Book now" → /things-to-do/sports#booking):
 * the browser jumps before the page has settled, and pinned sections, revealed images and
 * late fonts then shift the layout, so the visitor lands in the wrong place (often the
 * footer). Once the page settles, land on the target again, clearing the header with its
 * scroll-margin; re-checked after each ScrollTrigger refresh for the first couple of seconds.
 */
function useHashLanding() {
  const pathname = usePathname();
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    let done = false;
    const land = () => {
      if (done) return;
      const target = document.getElementById(id);
      if (!target) return;
      const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      const top = target.getBoundingClientRect().top + window.scrollY - margin;
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
      else window.scrollTo({ top, behavior: "instant" });
    };
    const timers = [80, 400, 900, 1600].map((delay) => window.setTimeout(land, delay));
    ScrollTrigger.addEventListener("refresh", land);
    // Stop correcting once the visitor scrolls on their own (wheel, touch or keys).
    const stop = () => {
      done = true;
    };
    const quit = window.setTimeout(stop, 2200);
    window.addEventListener("wheel", stop, { passive: true, once: true });
    window.addEventListener("touchstart", stop, { passive: true, once: true });
    window.addEventListener("keydown", stop, { once: true });
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(quit);
      ScrollTrigger.removeEventListener("refresh", land);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
    };
  }, [pathname]);
}
