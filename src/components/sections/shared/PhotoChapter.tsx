"use client";

import type { ImageAsset } from "@/types/media";
import { cn } from "@/lib/utils";
import { useGsap } from "@/hooks/useGsap";
import { gsap } from "@/lib/gsap";
import { SplitHeading } from "@/components/animations/SplitHeading";
import { Reveal } from "@/components/animations/Reveal";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { Eyebrow } from "@/components/ui/Eyebrow";

type PhotoChapterProps = {
  id: string;
  eyebrow: string;
  /** One large serif line set over the photo. */
  title: string;
  description?: string;
  image: ImageAsset;
  /** Where the line sits, so it stays clear of the photo's subject (faces, the horizon). */
  align?: "top" | "bottom";
};

/**
 * A full-screen photo between sections, to let the place itself speak: the photo arrives as an
 * inset, rounded frame and opens out to the full screen as it reaches the top, then drifts in a
 * clear parallax while the page scrolls on. A large serif line rises over it, line by line.
 * Reduced motion: a still, full-bleed photo with the line in place.
 */
export function PhotoChapter({
  id,
  eyebrow,
  title,
  description,
  image,
  align = "bottom",
}: PhotoChapterProps) {
  const ref = useGsap<HTMLElement>(({ scope, reducedMotion }) => {
    if (reducedMotion) return;
    const frame = scope.querySelector<HTMLElement>("[data-chapter-frame]");
    const media = scope.querySelector<HTMLElement>("[data-chapter-media]");
    if (!frame || !media) return;

    // Opens from an inset card to the full screen while it travels up the viewport.
    gsap.fromTo(
      frame,
      { clipPath: "inset(9% 7% 9% 7% round 4px)" },
      {
        clipPath: "inset(0% 0% 0% 0% round 0px)",
        ease: "none",
        scrollTrigger: { trigger: scope, start: "top 85%", end: "top 8%", scrub: 0.6 },
      },
    );
    // Parallax: the photo (taller than its frame) drifts slower than the page.
    gsap.fromTo(
      media,
      { yPercent: -11 },
      {
        yPercent: 11,
        ease: "none",
        scrollTrigger: { trigger: scope, start: "top bottom", end: "bottom top", scrub: true },
      },
    );
  });

  return (
    <section
      ref={ref}
      aria-labelledby={id}
      data-theme-surface="dark"
      className="relative h-[92svh] min-h-[32rem] bg-sand-100 text-white lg:h-svh"
    >
      <div data-chapter-frame className="absolute inset-0 overflow-hidden">
        <div
          data-chapter-media
          className="absolute inset-x-0 -top-[14%] h-[128%] will-change-transform"
        >
          <ResponsiveImage asset={image} sizes="100vw" quality={85} fill />
        </div>
        <div
          aria-hidden
          className={cn(
            "absolute inset-0",
            align === "top"
              ? "bg-[linear-gradient(to_bottom,rgb(0_0_0/0.5)_0%,rgb(0_0_0/0.22)_38%,rgb(0_0_0/0)_58%,rgb(0_0_0/0.15)_100%)]"
              : "bg-[linear-gradient(to_top,rgb(0_0_0/0.6)_0%,rgb(0_0_0/0.18)_42%,rgb(0_0_0/0)_62%,rgb(0_0_0/0.22)_100%)]",
          )}
        />
        <div
          className={cn(
            "absolute inset-x-0 mx-auto flex w-full max-w-site flex-col items-center gap-5 px-gutter text-center",
            align === "top" ? "top-0 pt-[calc(var(--header-bar)+9svh)]" : "bottom-0 pb-[12svh]",
          )}
        >
          <Reveal>
            <Eyebrow tone="dark" className="mx-auto">
              {eyebrow}
            </Eyebrow>
          </Reveal>
          <SplitHeading
            id={id}
            className="max-w-[18ch] font-serif text-[clamp(2.5rem,1.4rem+4.6vw,6rem)] leading-[1.04] text-balance"
          >
            {title}
          </SplitHeading>
          {description ? (
            <Reveal delay={0.2}>
              <p className="max-w-xl text-body-lg text-white/85">{description}</p>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
