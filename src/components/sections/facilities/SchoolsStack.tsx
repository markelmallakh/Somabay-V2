"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { ImageAsset } from "@/types/media";
import { schools } from "@/content/facilities-page";
import { useGsap } from "@/hooks/useGsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { Button } from "@/components/ui/Button";
import { CarouselArrows } from "@/components/ui/CarouselArrows";

/** A school's photos: they crossfade by themselves; two arrows over a soft fade step through them. */
function SchoolGallery({ images, label }: { images: ImageAsset[]; label: string }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const count = images.length;

  useEffect(() => {
    if (count < 2 || paused || reducedMotion) return;
    const timer = window.setTimeout(() => setActive((current) => (current + 1) % count), 5000);
    return () => window.clearTimeout(timer);
  }, [active, count, paused, reducedMotion]);

  return (
    <div
      className="relative size-full overflow-hidden"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      {images.map((image, index) => (
        <div
          key={image.src}
          aria-hidden={index !== active}
          className={cn(
            "absolute inset-0 transition-[opacity,scale] duration-[1400ms] ease-out-expo",
            index === active ? "scale-100 opacity-100" : "scale-[1.06] opacity-0",
          )}
        >
          <ResponsiveImage
            asset={image}
            sizes="(min-width: 1440px) 820px, (min-width: 1024px) 56vw, 100vw"
            fill
          />
        </div>
      ))}
      {/* A soft dark fade at the foot, and the site's two white-bordered arrows on it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-linear-to-t from-black/45 to-transparent"
      />
      <div className="absolute bottom-5 left-5 z-10 hidden sm:bottom-6 sm:left-6 md:block">
        <CarouselArrows
          canBack
          canForward
          onPage={(direction) => setActive((current) => (current + direction + count) % count)}
          label={`photo of ${label}`}
          tone="dark"
        />
      </div>
    </div>
  );
}

/**
 * The two schools as large stacking cards, each in its own identity: the logo and the school's
 * brand colours on the text side, and a gallery of its own photos on the other (alternating
 * sides). On large screens each card sticks below the header; the next slides up over it while
 * the first eases back and softens. Phones and reduced motion get a plain list. The buttons go to
 * the schools' websites.
 */
export function SchoolsStack() {
  const ref = useGsap<HTMLOListElement>(({ scope, reducedMotion }) => {
    if (reducedMotion) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-school]", scope);
      cards.slice(0, -1).forEach((card, index) => {
        const next = cards[index + 1];
        const tl = gsap.timeline({
          scrollTrigger: { trigger: next, start: "top bottom", end: "top 30%", scrub: true },
        });
        tl.to(card.querySelector("[data-school-inner]"), {
          scale: 0.92,
          filter: "blur(4px)",
          ease: "none",
        }).to(card.querySelector("[data-school-veil]"), { opacity: 0.45, ease: "none" }, 0);
      });
    });
    return () => mm.revert();
  });

  return (
    <ol
      ref={ref}
      data-no-motion
      className="mt-7 flex flex-col gap-5 sm:mt-10 sm:gap-8 md:mt-12 lg:gap-[12vh]"
    >
      {schools.map((school, index) => (
        <li
          key={school.name}
          data-school
          className="lg:sticky lg:top-[calc(var(--header-height)+2rem+var(--i)*2.5rem)]"
          style={{ "--i": index } as CSSProperties}
        >
          <article
            data-school-inner
            style={
              {
                "--panel": school.brand.panel,
                "--ink": school.brand.ink,
                "--accent": school.brand.accent,
                "--label": school.brand.label,
                "--muted": school.brand.muted,
              } as CSSProperties
            }
            className="relative grid origin-top overflow-hidden rounded-md bg-(--panel) text-(--ink) [backface-visibility:hidden] lg:h-[min(40rem,calc(100svh-var(--header-height)-10rem))] lg:grid-cols-12 lg:will-change-[transform,filter]"
          >
            <span
              aria-hidden
              data-school-veil
              className="pointer-events-none absolute inset-0 z-20 bg-white opacity-0"
            />
            <div
              className={cn(
                "relative aspect-[4/3] sm:aspect-[16/10] lg:col-span-7 lg:aspect-auto",
                index % 2 && "lg:order-2",
              )}
            >
              <SchoolGallery images={school.gallery} label={school.name} />
            </div>
            <div className="flex flex-col p-5 sm:p-6 md:p-10 lg:col-span-5 lg:p-12">
              {/* The logo; a blue wordmark sits on a white plate so it reads on the blue panel. */}
              <span
                className={cn(
                  "self-start",
                  school.logo.plate && "rounded-md bg-white px-4 py-3 shadow-soft",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- the school's own logo file, shown as is. */}
                <img
                  src={school.logo.src}
                  alt={`${school.name} logo`}
                  width={school.logo.width}
                  height={school.logo.height}
                  className="h-11 w-auto object-contain sm:h-14"
                />
              </span>
              <p className="mt-6 text-body-xs font-semibold tracking-label text-(--label) uppercase sm:mt-8">
                {school.label}
              </p>
              <h3 className="mt-2 font-serif text-heading-3 leading-[1.1] sm:mt-3">
                {school.name}
              </h3>
              <p className="mt-3 text-body-md text-(--muted) sm:mt-5">{school.description}</p>
              <div className="mt-auto pt-6 sm:pt-8">
                {/* The site's border CTA: white on the GEMS blue, turquoise on the Kompass cream. */}
                <Button
                  href={school.website.href}
                  external
                  variant={school.brand.dark ? "outline-light" : "outline"}
                  size="md"
                  icon="arrow-up-right"
                  className={school.brand.dark ? undefined : "border-deep text-turquoise"}
                >
                  {school.website.label}
                </Button>
              </div>
            </div>
          </article>
        </li>
      ))}
      {/* Room for the last card to hold over the one behind it before the page moves on. */}
      <li aria-hidden className="-mt-[12vh] hidden h-[24vh] lg:block" />
    </ol>
  );
}
