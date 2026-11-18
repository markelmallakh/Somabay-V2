"use client";

import type { ImageAsset } from "@/types/media";
import type { SectionIntro } from "@/types/content";
import { useGsap } from "@/hooks/useGsap";
import { gsap, SplitText } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/Container";
import { Parallax } from "@/components/animations/Parallax";
import { Reveal } from "@/components/animations/Reveal";
import { SplitHeading } from "@/components/animations/SplitHeading";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

type Stat = { value: string; unit?: string; label: string };

type NeighborhoodOverviewProps = {
  id: string;
  name: string;
  /** The project's logo, centred above its numbers. */
  logo?: string;
  stats?: Stat[];
  concept?: SectionIntro & { images: [ImageAsset, ImageAsset] };
};

/**
 * The neighborhood at a glance, after the hero: a row of tall deep-teal tiles (a small label at
 * the top, the figure large at the foot, its number counting up), then the concept as an overview
 * (eyebrow and title on the left, the description as a large turquoise statement rising word by
 * word on the right) and its two photos drifting at different speeds.
 */
export function NeighborhoodOverview({
  id,
  name,
  logo,
  stats = [],
  concept,
}: NeighborhoodOverviewProps) {
  const tiles = stats;

  const ref = useGsap<HTMLElement>(({ scope, reducedMotion }) => {
    if (reducedMotion) return;
    const cards = gsap.utils.toArray<HTMLElement>("[data-tile]", scope);
    if (!cards.length) return;

    const timeline = gsap.timeline({
      scrollTrigger: { trigger: cards[0], start: "top 85%", toggleActions: "play none none none" },
    });
    // The figures rise in one after another…
    timeline.from(
      gsap.utils.toArray<HTMLElement>("[data-tile-copy]", scope),
      { y: 24, autoAlpha: 0, duration: 1, stagger: 0.08, ease: "power3.out" },
      0,
    );
    // …and each number counts up to its figure.
    gsap.utils.toArray<HTMLElement>("[data-count]", scope).forEach((element, index) => {
      const target = Number(element.dataset.count);
      const counter = { value: 0 };
      timeline.to(
        counter,
        {
          value: target,
          duration: 1.8,
          ease: "power3.out",
          onUpdate: () => {
            element.textContent = Math.round(counter.value).toLocaleString("en-US");
          },
        },
        0.3 + index * 0.1,
      );
    });
  }, []);

  return (
    <section ref={ref} aria-labelledby={id} className="bg-white py-section text-ink">
      <Container>
        {logo ? (
          <Reveal className="mb-8 flex justify-center sm:mb-10 lg:mb-12">
            {/* eslint-disable-next-line @next/next/no-img-element -- the project's brand SVG, shown as is. */}
            <img src={logo} alt={`${name} logo`} className="h-10 w-auto sm:h-12 lg:h-14" />
          </Reveal>
        ) : null}
        {/* The figures in a light row between hairlines, divided by thin rules. Phones set them
            two by two (an odd last figure spans the row). */}
        <ul
          className={cn(
            "mx-auto grid grid-cols-2 border-t border-line sm:divide-x sm:divide-line sm:border-b",
            tiles.length >= 4 ? "max-w-6xl sm:grid-cols-4" : "max-w-4xl sm:grid-cols-3",
          )}
        >
          {tiles.map((tile, index) => {
            const numeric = /^\d[\d,]*$/.test(tile.value);
            const lastAlone = tiles.length % 2 === 1 && index === tiles.length - 1;
            return (
              <li
                key={tile.label}
                data-tile
                className={cn(
                  "border-b border-line px-3 py-6 text-center sm:border-b-0 sm:px-6 sm:py-8 lg:py-10",
                  lastAlone ? "col-span-2 sm:col-span-1" : "odd:border-r sm:odd:border-r-0",
                )}
              >
                <p data-tile-copy className="font-serif text-heading-2 leading-none text-ink">
                  <span data-count={numeric ? tile.value.replace(/,/g, "") : undefined}>
                    {tile.value}
                  </span>
                  {tile.unit ? (
                    <span className="ml-1.5 font-sans text-body-md text-turquoise">
                      {tile.unit}
                    </span>
                  ) : null}
                </p>
                <p
                  data-tile-copy
                  className="mt-2 text-label tracking-label text-slate uppercase sm:mt-3"
                >
                  {tile.label}
                </p>
              </li>
            );
          })}
        </ul>

        {concept ? (
          <>
            <div className="mt-12 grid gap-6 sm:mt-20 sm:gap-10 lg:mt-28 lg:grid-cols-12 lg:gap-6">
              <div className="flex flex-col gap-2 lg:col-span-4 lg:gap-3">
                <Reveal distance={12}>
                  <Eyebrow>{concept.eyebrow ?? "Overview"}</Eyebrow>
                </Reveal>
                <SplitHeading id={id} className="text-heading-1 text-balance">
                  {concept.title}
                </SplitHeading>
              </div>
              {concept.description ? (
                <div className="flex flex-col items-start gap-6 sm:gap-10 lg:col-span-8 lg:col-start-5">
                  <FillText
                    text={concept.description}
                    className="font-sans text-[clamp(1.25rem,0.95rem+1.3vw,2.125rem)] leading-[1.35] tracking-[-0.01em] text-ink"
                  />
                  {/* Takes the visitor down to the register-interest form at the foot of the page. */}
                  <Reveal delay={0.1} className="flex flex-wrap gap-3">
                    <Button href="#register-interest" variant="primary">
                      Request interest
                    </Button>
                    {/* DRAFT: the neighborhood brochures (PDF) have not been supplied yet, so the
                        link is a placeholder until they arrive. */}
                    <Button
                      href="#"
                      variant="outline"
                      icon="download"
                      className="border-deep text-turquoise"
                    >
                      Download brochure
                    </Button>
                  </Reveal>
                </div>
              ) : null}
            </div>

            {/* The two concept photos: a wide one and a tall one set lower, each drifting. Phones
                and tablets keep the pair side by side, staggered, instead of two full-width frames. */}
            <div className="mt-10 grid grid-cols-5 gap-3 sm:mt-16 lg:mt-24 lg:grid-cols-12 lg:gap-6">
              <Reveal className="col-span-3 lg:col-span-7">
                <Parallax className="relative aspect-[4/5] overflow-hidden rounded-md sm:aspect-[16/11]">
                  <div className="absolute inset-0">
                    <ResponsiveImage
                      asset={concept.images[0]}
                      sizes="(min-width: 1024px) 55vw, 60vw"
                      fill
                    />
                  </div>
                </Parallax>
              </Reveal>
              <Reveal
                delay={0.15}
                className="col-span-2 mt-16 sm:mt-24 lg:col-span-4 lg:col-start-9 lg:mt-32"
              >
                <Parallax amount={12} className="relative aspect-[4/5] overflow-hidden rounded-md">
                  <div className="absolute inset-0">
                    <ResponsiveImage
                      asset={concept.images[1]}
                      sizes="(min-width: 1024px) 30vw, 40vw"
                      fill
                    />
                  </div>
                </Parallax>
              </Reveal>
            </div>
          </>
        ) : null}
      </Container>
    </section>
  );
}

/**
 * A statement written in as it is read: the paragraph is split into masked lines, and every word
 * rises into its line out of a soft blur, one after another in reading order, tied to the scroll
 * (scrolling back up takes them away again).
 */
function FillText({ text, className }: { text: string; className?: string }) {
  const ref = useGsap<HTMLParagraphElement>(
    ({ scope, reducedMotion }) => {
      if (reducedMotion) return;
      const split = SplitText.create(scope, {
        type: "lines,words",
        mask: "lines",
        autoSplit: true,
        onSplit(self) {
          // Let descenders (g, y, p) show below each line's mask without changing the rhythm.
          gsap.set(self.masks, { paddingBottom: "0.18em", marginBottom: "-0.18em" });
          return gsap.fromTo(
            self.words,
            { yPercent: 110, opacity: 0, filter: "blur(6px)" },
            {
              yPercent: 0,
              opacity: 1,
              filter: "blur(0px)",
              stagger: 0.08,
              ease: "power3.out",
              scrollTrigger: { trigger: scope, start: "top 88%", end: "bottom 62%", scrub: 0.9 },
            },
          );
        },
      });
      return () => split.revert();
    },
    [text],
  );

  return (
    <p ref={ref} className={className}>
      {text}
    </p>
  );
}
