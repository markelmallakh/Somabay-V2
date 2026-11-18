"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { ImageAsset } from "@/types/media";
import { Container } from "@/components/layout/Container";
import { CarouselArrows } from "@/components/ui/CarouselArrows";
import { PhotoLightbox } from "./PhotoLightbox";
import { ResponsiveImage } from "./ResponsiveImage";

type GalleryCarouselProps = {
  images: ImageAsset[];
  label: string;
  className?: string;
  /** `dark` on deep sections: white dots. */
  tone?: "light" | "dark";
};

/** Three copies of the photos; the user always sits in the middle one, so the row never ends. */
const COPIES = 3;

// Where slide `k` (across all copies) snaps to.
const positionOf = (element: HTMLUListElement, k: number) => {
  const slides = element.children;
  const first = slides[0] as HTMLElement | undefined;
  const slide = slides[k] as HTMLElement | undefined;
  return first && slide ? slide.offsetLeft - first.offsetLeft : 0;
};
const currentSlide = (element: HTMLUListElement) => {
  const step = positionOf(element, 1);
  return step ? Math.round(element.scrollLeft / step) : 0;
};

/**
 * Square-slide gallery that loops endlessly: arrows and swipes carry straight on from the last
 * photo to the first. Any photo opens the full-screen viewer with every photo as a thumbnail.
 */
export function GalleryCarousel({
  images,
  label,
  className,
  tone = "light",
}: GalleryCarouselProps) {
  const track = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  // The slide the row is gliding to, so quick repeated clicks each add a step.
  const heading = useRef<number | null>(null);
  const count = images.length;

  useEffect(() => {
    const element = track.current;
    if (!element || count < 2) return;
    // Start on the first photo of the middle copy.
    element.scrollLeft = positionOf(element, count);

    // Once the row comes to rest in the first or last copy, hop (invisibly) to the same photo in
    // the middle copy, so there is always more row on both sides.
    const recentre = () => {
      heading.current = null;
      const k = currentSlide(element);
      if (k < count || k >= count * 2) {
        const offset = element.scrollLeft - positionOf(element, k);
        element.scrollLeft = positionOf(element, count + (k % count)) + offset;
      }
    };
    // Recentre once the scroll events stop (a glide sends them every frame until it lands).
    let settle: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      setActive(((currentSlide(element) % count) + count) % count);
      clearTimeout(settle);
      settle = setTimeout(recentre, 200);
    };
    element.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(settle);
      element.removeEventListener("scroll", onScroll);
    };
  }, [count]);

  const go = (target: number) => {
    const element = track.current;
    if (!element) return;
    // Stay inside the rendered copies; the settle hop recentres afterwards.
    const clamped = Math.max(0, Math.min(count * COPIES - 1, target));
    heading.current = clamped;
    element.scrollTo({ left: positionOf(element, clamped), behavior: "smooth" });
  };
  const step = (delta: number) => {
    const element = track.current;
    if (element) go((heading.current ?? currentSlide(element)) + delta);
  };

  const slides = Array.from({ length: COPIES }, (_, copy) =>
    images.map((image, index) => ({ image, index, copy })),
  ).flat();

  return (
    <div
      className={cn("relative", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      {/* The track sits inside the page padding, so the photos line up with the headings. */}
      <div className="mx-auto max-w-site px-gutter">
        <ul ref={track} className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto">
          {slides.map(({ image, index, copy }) => {
            // Only the middle copy is announced and reachable by keyboard.
            const clone = copy !== 1;
            return (
              <li
                key={`${copy}-${index}`}
                aria-hidden={clone || undefined}
                className="relative aspect-square w-[min(78vw,25.3rem)] shrink-0 snap-start overflow-hidden rounded-md bg-sand-200 lg:w-[calc((100%-1.5rem)/3)]"
              >
                <button
                  type="button"
                  tabIndex={clone ? -1 : undefined}
                  onClick={() => setOpen(index)}
                  aria-label={`Open photo ${index + 1} of ${count}`}
                  className="group absolute inset-0 cursor-zoom-in outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-turquoise"
                >
                  <ResponsiveImage
                    asset={image}
                    sizes="(min-width: 768px) 26rem, 78vw"
                    fill
                    className="transition-transform duration-[1600ms] ease-out-expo group-hover:scale-[1.05]"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      {/* The site's slider controls: a progress line (the lit part is the photo on show) and
          two arrows side by side. */}
      {/* Rail, counter and arrows: tablets and up (phones just swipe). */}
      <Container className="mt-8 hidden items-center gap-8 md:flex">
        {/* Phones: the count alone (no rail). */}
        <div
          aria-hidden
          className={cn(
            "relative hidden h-0.5 flex-1 md:block",
            tone === "dark" ? "bg-white/20" : "bg-line",
          )}
        >
          <span
            className="absolute inset-y-0 bg-deep transition-[left] duration-700 ease-out-expo"
            style={{ left: `${(active / count) * 100}%`, width: `${100 / count}%` }}
          />
        </div>
        <p
          aria-live="polite"
          className={cn(
            "text-body-sm tabular-nums",
            tone === "dark" ? "text-white/80" : "text-slate",
          )}
        >
          {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </p>
        <CarouselArrows
          canBack
          canForward
          onPage={(direction) => step(direction)}
          label="photo"
          tone={tone}
        />
      </Container>

      <PhotoLightbox
        images={images}
        label={label}
        open={open}
        onChange={setOpen}
        onClose={() => setOpen(null)}
      />
    </div>
  );
}
