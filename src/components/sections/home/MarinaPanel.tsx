"use client";

import { useRef } from "react";
import type { Cta } from "@/types/content";
import type { VideoAsset } from "@/types/media";
import { useGsap } from "@/hooks/useGsap";
import { gsap } from "@/lib/gsap";
import { Container } from "@/components/layout/Container";
import { ScrollScrubVideo, type ScrubController } from "@/components/media/ScrollScrubVideo";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { KitIcon, type KitIconName } from "@/components/ui/KitIcon";

type MarinaPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  cta: Cta;
  film: VideoAsset;
  categories: { label: string; icon: KitIconName }[];
  /** The two large lines the film opens between. */
  lines?: [string, string];
};

/**
 * "The Marina" on the homepage, with the Things To Do hero's reveal, in four steps along the
 * scroll (sticky, no pinning): "Somabay / Marina" rises in on white; the marina film, held on its
 * first frame, opens from nothing between the two lines and grows to fill the screen; the film
 * then plays in step with the scroll; last, the eyebrow, title, line, button and amenities rise
 * over it.
 */
export function MarinaPanel({
  eyebrow,
  title,
  description,
  cta,
  film,
  categories,
  lines = ["Somabay", "Marina"],
}: MarinaPanelProps) {
  const scrub = useRef<ScrubController>(null);

  const scope = useGsap<HTMLElement>(({ scope, reducedMotion }) => {
    if (reducedMotion) return;
    const q = gsap.utils.selector(scope);
    const frame = q<HTMLElement>("[data-frame]")[0];
    const lineTop = q<HTMLElement>("[data-line-top]")[0];
    const lineBottom = q<HTMLElement>("[data-line-bottom]")[0];
    if (!frame || !lineTop || !lineBottom) return;

    // The film's top and bottom edges push the two lines ahead of them, so the title always
    // parts around the film and never sits over it. The lines sit tight (the second is pulled up
    // into the first's empty space below its capitals), so the push is measured from the middle
    // of that overlap: the lines start parting as soon as the film opens, never before.
    const gap = () => (bottomEdge() - topEdge()) / 2;
    const topEdge = () => lineTop.offsetTop + lineTop.offsetHeight;
    const bottomEdge = () => lineBottom.offsetTop;
    const setTop = gsap.quickSetter(lineTop, "y", "px");
    const setBottom = gsap.quickSetter(lineBottom, "y", "px");
    const setFade = gsap.quickSetter([lineTop, lineBottom], "opacity");
    const radius = 4;

    // 1. Entrance: as the section arrives, the two lines rise into place, one after the other.
    gsap.from(q("[data-rise]"), {
      yPercent: 100,
      opacity: 0,
      duration: 1.2,
      ease: "expo.out",
      stagger: 0.12,
      scrollTrigger: { trigger: scope, start: "top 75%", toggleActions: "play none none none" },
    });

    // 2. Opening: the film (held on its first frame) opens from nothing between the lines and
    //    grows to fill the screen, pushing the lines apart until they fade.
    const open = { k: 0 };
    const drawOpen = () => {
      const vh = frame.offsetHeight;
      const k = open.k;
      const inset = 50 * (1 - k);
      const r = radius * Math.min(1, (1 - k) / 0.25);
      frame.style.clipPath = `inset(${inset}% ${inset}% ${inset}% ${inset}% round ${r}px)`;
      const half = ((50 - inset) / 100) * vh;
      const g = gap();
      const middle = (topEdge() + bottomEdge()) / 2;
      setTop(Math.min(0, middle - half - g - topEdge()));
      setBottom(Math.max(0, middle + half + g - bottomEdge()));
      setFade(1 - Math.min(Math.max((k - 0.55) / 0.3, 0), 1));
    };
    drawOpen();
    // 3. Playing: once full screen, the film plays in step with the scroll.
    const play = { t: 0 };
    const drawPlay = () => scrub.current?.seek(play.t);

    // The phases follow each other along the section's scroll (a short hold on the headline,
    // the opening, the film, then the text).
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: scope, start: "top top", end: "bottom bottom", scrub: true },
    });
    tl.to(open, { k: 1, duration: 0.32, onUpdate: drawOpen }, 0.06)
      .fromTo(q("[data-zoom]"), { scale: 1.3 }, { scale: 1, duration: 0.32 }, 0.06)
      .to(play, { t: 1, duration: 0.56, onUpdate: drawPlay }, 0.38)
      // 4. As soon as the film is full screen, while it plays: the shade and the copy rise in,
      //    then the hairline draws across, then the amenities appear along it.
      .fromTo(q("[data-shade]"), { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0.38)
      .fromTo(
        q("[data-copy]"),
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.08, stagger: 0.025 },
        0.4,
      )
      .fromTo(q("[data-rule]"), { scaleX: 0 }, { scaleX: 1, duration: 0.12 }, 0.52)
      .fromTo(
        q("[data-chip]"),
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.05, stagger: 0.012 },
        0.6,
      );
  }, []);

  return (
    <section
      ref={scope}
      aria-labelledby="marina-title"
      className="relative h-[450svh] bg-sand-100 motion-reduce:h-auto"
    >
      <div className="sticky top-0 h-svh overflow-hidden motion-reduce:static motion-reduce:h-auto">
        {/* The film that opens from nothing between the lines to the full screen. */}
        <div
          data-frame
          className="absolute inset-0 z-10 overflow-hidden bg-turquoise-10 will-change-[clip-path] [clip-path:inset(50%_50%_50%_50%)] motion-reduce:relative motion-reduce:h-svh motion-reduce:[clip-path:none]"
        >
          <div data-zoom className="absolute inset-0 will-change-transform">
            <ScrollScrubVideo
              asset={film}
              mode="external"
              controllerRef={scrub}
              className="absolute inset-0"
            />
          </div>
          <div
            data-shade
            aria-hidden
            // Phones: shaded from the top, where the copy sits; larger screens from the left
            // and the foot. It fades in only once the film fills the screen.
            className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(0_0_0/0.55)_0%,rgb(0_0_0/0.2)_40%,transparent_60%),linear-gradient(to_top,rgb(0_0_0/0.45),transparent_25%)] opacity-0 motion-reduce:opacity-100 sm:bg-[linear-gradient(to_right,rgb(0_0_0/0.65),rgb(0_0_0/0.15)_55%,transparent),linear-gradient(to_top,rgb(0_0_0/0.55),transparent_35%)]"
          />
        </div>

        {/* "Somabay / Marina", parted by the film. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center text-center motion-reduce:hidden"
        >
          <p className="font-serif text-[clamp(2.75rem,2rem+6vw,8.5rem)] leading-[1] text-ink">
            {/* Each line rises out of its own mask on entry. */}
            <span data-line-top className="block overflow-hidden pb-[0.08em]">
              <span data-rise className="block">
                {lines[0]}
              </span>
            </span>
            {/* Pulled up under the first line: capitals only, so the two lines can sit tight. */}
            <span data-line-bottom className="-mt-[0.28em] block overflow-hidden pb-[0.08em]">
              <span data-rise className="block">
                {lines[1]}
              </span>
            </span>
          </p>
        </div>

        {/* The content, rising over the full-screen film. */}
        <div
          data-theme-surface="dark"
          // Phones: the copy sits high (under the header), the amenities stay along the foot.
          className="absolute inset-0 z-30 flex flex-col justify-end pt-[calc(var(--header-height)+2rem)] pb-8 text-white sm:pt-0 sm:pb-10 lg:pb-12"
        >
          <Container className="flex flex-1 flex-col justify-between gap-12 sm:flex-none sm:justify-start lg:gap-16">
            <div className="flex max-w-[32.5rem] flex-col gap-6">
              <div
                data-copy
                className="flex flex-col gap-2.5 opacity-0 motion-reduce:opacity-100 lg:gap-3"
              >
                <Eyebrow tone="dark">{eyebrow}</Eyebrow>
                <h2 id="marina-title" className="text-heading-2">
                  {title}
                </h2>
              </div>
              <p
                data-copy
                className="text-body-md text-white/90 opacity-0 motion-reduce:opacity-100"
              >
                {description}
              </p>
              <div data-copy className="opacity-0 motion-reduce:opacity-100">
                <Button href={cta.href} variant="primary" icon="arrow-up-right">
                  {cta.label}
                </Button>
              </div>
            </div>

            {/* Amenities: one quiet line along the foot, under a hairline. */}
            <div className="relative">
              {/* The hairline draws across from the left before the amenities appear. */}
              <span
                data-rule
                aria-hidden
                className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-white/25 motion-reduce:scale-x-100"
              />
              {/* Phones: small labels wrapping inside the screen, centred; one row from `lg`. */}
              <ul className="flex flex-wrap justify-center gap-x-5 gap-y-3 pt-4 sm:justify-start sm:gap-x-8 sm:pt-5 lg:gap-x-10">
                {categories.map((category) => (
                  <li
                    key={category.label}
                    data-chip
                    className="flex shrink-0 items-center gap-1.5 text-white/80 opacity-0 transition-colors duration-500 hover:text-white motion-reduce:opacity-100 sm:gap-2"
                  >
                    <KitIcon name={category.icon} className="size-3.5 sm:size-4" />
                    <span className="text-label font-medium tracking-label uppercase sm:text-body-xs">
                      {category.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
