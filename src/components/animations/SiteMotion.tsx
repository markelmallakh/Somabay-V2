"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, registerGsap, ScrollTrigger, SplitText } from "@/lib/gsap";

/** Photos smaller than this are left still: parallax only reads on large imagery. */
const MIN_WIDTH = 400;
const MIN_HEIGHT = 260;
/** How far a photo drifts each way, as a share of its frame's height. */
const DRIFT = 0.055;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * React has taken this element over. Until then (streamed sections hydrate a little after the
 * layout) it must not be touched, or hydration would find markup it did not render.
 */
const hydrated = (element: Element) =>
  Object.keys(element).some((key) => key.startsWith("__reactFiber"));

/** Inside something that already animates itself, or that should stay still. */
const optedOut = (element: Element) =>
  Boolean(
    element.closest(
      "[data-no-motion], [data-sticky-hero], [role='dialog'], dialog, header, footer, .leaflet-container",
    ),
  );

/** The nearest ancestor that clips the photo, so its oversize never shows. */
function clippingFrame(image: HTMLElement): HTMLElement | null {
  let node = image.parentElement;
  for (let depth = 0; node && depth < 4; depth += 1, node = node.parentElement) {
    const overflow = getComputedStyle(node).overflow;
    if (overflow.includes("hidden") || overflow.includes("clip")) return node;
  }
  return null;
}

/**
 * The site-wide motion layer, mounted once in the root layout. It looks at whatever page is on
 * screen and adds, without each page asking for it:
 *
 * - Sticky heroes: a hero marked `data-sticky-hero` holds while the content scrolls up over it,
 *   easing back a little (smaller, dimmer) as it is covered, then rests out of sight.
 * - Photos: large clipped photos drift in parallax and settle from a slight zoom the first time
 *   they come into view. Photos that are still downloading show a shimmering skeleton and fade
 *   in when ready.
 * - Text: section headings rise line by line out of a mask; eyebrows ease in with their tracking.
 * - App touches: a scroll progress line under the header and a soft fade between pages.
 *
 * Anything already animated by its own component (`data-no-motion`, `data-split`, hover-zoom
 * cards, dialogs) is left alone. Reduced motion keeps only the skeletons.
 */
export function SiteMotion() {
  const pathname = usePathname();
  const progress = useRef<HTMLDivElement>(null);
  const firstPage = useRef(true);

  useEffect(() => {
    const main = document.getElementById("main-content");
    if (!main) return;
    registerGsap();
    const still = reducedMotion();
    const cleanups: (() => void)[] = [];

    // A soft fade when moving between pages (not on the first load).
    if (!firstPage.current && !still) {
      main.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, easing: "ease-out" });
    }
    firstPage.current = false;

    // ---- Photos: skeleton while loading, then parallax and a settle from zoom. ----
    const seen = new WeakSet<Element>();
    const moving = new Set<{ image: HTMLElement; frame: HTMLElement }>();
    const visible = new Set<HTMLElement>();
    const watcher = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const frame = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            visible.add(frame);
            frame.querySelector("img[data-px]")?.setAttribute("data-in", "");
          } else visible.delete(frame);
        }
        schedule();
      },
      { rootMargin: "12% 0px 12% 0px" },
    );

    const scanImages = () => {
      main.querySelectorAll<HTMLImageElement>("img[data-nimg]").forEach((image) => {
        if (seen.has(image) || !hydrated(image)) return;
        seen.add(image);
        const parent = image.parentElement;
        // Skeleton: only for photos that fill their own frame and are still on their way.
        if (parent && image.dataset.nimg === "fill" && !image.complete) {
          parent.setAttribute("data-skeleton", "");
          image.setAttribute("data-loading", "");
          const done = () => {
            parent.removeAttribute("data-skeleton");
            image.removeAttribute("data-loading");
            image.setAttribute("data-loaded", "");
          };
          image.addEventListener("load", done, { once: true });
          image.addEventListener("error", done, { once: true });
        }
        if (still || image.dataset.nimg !== "fill" || optedOut(image)) return;
        if (image.style.transform) return;
        const style = getComputedStyle(image);
        // Hover-zoom photos (cards) keep their own transform.
        const animatesTransform =
          /transform|scale|all/.test(style.transitionProperty) &&
          style.transitionDuration.split(",").some((value) => parseFloat(value) > 0);
        if (animatesTransform) return;
        const box = image.getBoundingClientRect();
        if (box.width < MIN_WIDTH || box.height < MIN_HEIGHT) return;
        const frame = clippingFrame(image);
        if (!frame) return;
        // The clip must hug the photo. If it is a larger box (a whole card with the photo in one
        // part), the oversized photo would spill over the card's text and padding.
        const clip = frame.getBoundingClientRect();
        if (Math.abs(clip.width - box.width) > 4 || Math.abs(clip.height - box.height) > 4) return;
        image.setAttribute("data-px", "");
        moving.add({ image, frame });
        watcher.observe(frame);
      });
    };

    // ---- Text: headings rise line by line; eyebrows ease in. ----
    const splits: { revert: () => void }[] = [];
    const textWatcher = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-in", "");
          textWatcher.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    const scanText = () => {
      if (still) return;
      main.querySelectorAll<HTMLElement>("h2").forEach((heading) => {
        if (seen.has(heading) || !hydrated(heading)) return;
        seen.add(heading);
        // Plain-text headings only: nothing with its own spans, masks or animation.
        if (heading.dataset.split !== undefined || heading.children.length > 0) return;
        if (optedOut(heading) || heading.closest("[aria-hidden='true'], .sr-only")) return;
        if (heading.classList.contains("sr-only") || !heading.textContent?.trim()) return;
        const split = SplitText.create(heading, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit(self) {
            gsap.set(self.masks, { paddingBottom: "0.2em", marginBottom: "-0.2em" });
            return gsap.from(self.lines, {
              yPercent: 125,
              duration: 1.3,
              stagger: 0.09,
              ease: "expo.out",
              scrollTrigger: { trigger: heading, start: "top 90%", once: true },
            });
          },
        });
        splits.push(split);
      });
      main.querySelectorAll<HTMLElement>(".eyebrow-tag").forEach((eyebrow) => {
        if (seen.has(eyebrow) || !hydrated(eyebrow)) return;
        seen.add(eyebrow);
        if (optedOut(eyebrow)) return;
        eyebrow.setAttribute("data-eb", "");
        textWatcher.observe(eyebrow);
      });
    };

    // ---- Scroll: parallax, the sticky hero easing back, the progress line. ----
    const hero = main.querySelector<HTMLElement>("[data-sticky-hero]");
    let frameId = 0;
    const update = () => {
      frameId = 0;
      const height = window.innerHeight;
      for (const { image, frame } of moving) {
        if (!visible.has(frame)) continue;
        const box = frame.getBoundingClientRect();
        // -1 as the frame enters at the foot of the screen, +1 as it leaves at the top.
        const position = (height / 2 - (box.top + box.height / 2)) / (height / 2 + box.height / 2);
        const offset = Math.max(-1, Math.min(1, position)) * box.height * DRIFT;
        image.style.setProperty("--py", `${offset.toFixed(1)}px`);
      }
      if (hero && hydrated(hero)) {
        const covered = Math.min(1, Math.max(0, window.scrollY / Math.max(1, hero.offsetHeight)));
        hero.style.setProperty("--hero-cover", covered.toFixed(3));
        // Once fully covered it rests out of sight, so it never shows through a later gap.
        hero.style.visibility = covered >= 1 ? "hidden" : "";
      }
      if (progress.current) {
        const max = document.documentElement.scrollHeight - height;
        progress.current.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
      }
    };
    function schedule() {
      if (!frameId) frameId = requestAnimationFrame(update);
    }

    const scan = () => {
      scanImages();
      scanText();
      schedule();
    };
    scan();
    // Sections still hydrating are picked up on these later passes.
    const passes = [400, 1200, 2500, 5000].map((delay) => window.setTimeout(scan, delay));
    cleanups.push(() => passes.forEach((pass) => window.clearTimeout(pass)));
    // Content that arrives later (streamed sections, "load more" batches) gets the same care.
    let pending = 0;
    const mutations = new MutationObserver(() => {
      window.clearTimeout(pending);
      pending = window.setTimeout(scan, 250);
    });
    mutations.observe(main, { childList: true, subtree: true });

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    cleanups.push(() => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.clearTimeout(pending);
      cancelAnimationFrame(frameId);
      mutations.disconnect();
      watcher.disconnect();
      textWatcher.disconnect();
      splits.forEach((split) => split.revert());
      for (const { image } of moving) {
        image.removeAttribute("data-px");
        image.removeAttribute("data-in");
        image.style.removeProperty("--py");
      }
      if (hero) {
        hero.style.removeProperty("--hero-cover");
        hero.style.visibility = "";
      }
    });

    // Sections stream in and set up their scroll animations in whatever order they hydrate, so a
    // pinned section higher up (which adds scroll length) can register after one below it has
    // measured itself, and that one would then start early. Once the page has settled, put the
    // triggers back in page order and measure them all again.
    const settle = () => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    };
    const settleTimer = window.setTimeout(settle, 1200);
    window.addEventListener("load", settle, { once: true });
    cleanups.push(() => {
      window.clearTimeout(settleTimer);
      window.removeEventListener("load", settle);
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [pathname]);

  return (
    <div
      ref={progress}
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[45] h-0.5 origin-left scale-x-0 bg-deep"
    />
  );
}
