"use client";

import { useState } from "react";
import { useGsap } from "@/hooks/useGsap";
import { gsap } from "@/lib/gsap";
import { sports, sportsIntro } from "@/content/things-to-do";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/animations/Reveal";
import { DetailDrawer } from "@/components/directory/DetailDrawer";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { HeadingRow } from "./HeadingRow";
import { PhoneEndCta } from "@/components/layout/HeadingRow";

const ease = "duration-700 ease-out-expo";

/**
 * Sports heading row over a draggable row of photo cards. Each card opens a side drawer with the
 * sport's details from the Somabay directory (description, hours, phone, directions).
 */
export function SportsRow() {
  const [open, setOpen] = useState<number | null>(null);

  // Laptop and up: like Hotel Facilities, the section pins once it is centred on screen and
  // scrolling down slides the cards across until the last one is in view; then the page moves
  // on. Tablets: the row glides as the page scrolls past (no pin). Phones swipe the row
  // themselves (a native scroller).
  const scope = useGsap<HTMLDivElement>(({ scope, reducedMotion }) => {
    if (reducedMotion) return;
    const track = scope.querySelector<HTMLElement>("[data-sports-track]");
    const row = track?.parentElement;
    if (!track || !row) return;
    const distance = () => Math.max(track.scrollWidth - row.clientWidth, 0);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      gsap.fromTo(
        track,
        { x: 0 },
        {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: scope,
            start: "center center",
            end: () => `+=${Math.max(distance(), 1)}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        },
      );
    });
    mm.add("(min-width: 768px) and (max-width: 1023px)", () => {
      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: row,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    });
    return () => mm.revert();
  });

  const cta = (
    <Button href={sportsIntro.cta.href} variant="outline" icon="arrow-up-right">
      {sportsIntro.cta.label}
    </Button>
  );
  return (
    <div ref={scope}>
      <Section tone="white" aria-labelledby="sports-title" className="overflow-hidden">
        <Container>
          <HeadingRow
            id="sports-title"
            align="top"
            title={sportsIntro.title}
            description={sportsIntro.description}
            aside={<div>{cta}</div>}
          />
        </Container>
        <Reveal className="mt-6 sm:mt-10 lg:mt-12">
          {/* No arrows: the row slides sideways on its own as the page scrolls. */}
          <div className="motion-reduce:overflow-x-auto max-md:px-gutter">
            <ul
              data-sports-track
              aria-label="Sports at Somabay"
              className="max-md:swipe-row-half max-md:[--swipe-card:40vw] md:flex md:w-max md:gap-4 md:ps-site md:pe-gutter md:will-change-transform"
            >
              {sports.map((sport, index) => (
                <li key={sport.id} className="shrink-0 md:w-[min(72vw,18.5rem)]">
                  {/* At rest the sport's name sits on the photo's shaded foot; on hover the rounded
                  photo pulls up and a white panel beneath it shows the name, tagline and arrow. */}
                  <button
                    type="button"
                    onClick={() => setOpen(index)}
                    aria-label={`${sport.chip}: details`}
                    // Phones have no hover: the name and tagline stay on the photo instead.
                    data-no-touch-hover
                    className="group relative block aspect-[4/5] w-full overflow-hidden rounded-md bg-white text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquoise"
                  >
                    {/* The photo keeps its rounded corners on hover, pulled up above the panel. */}
                    <span
                      className={`absolute inset-0 overflow-hidden transition-[clip-path] [clip-path:inset(0_0_0_0_round_0.25rem)] ${ease} group-hover:[clip-path:inset(0_0_30%_0_round_0.25rem_0.25rem_0_0)] group-focus-visible:[clip-path:inset(0_0_30%_0_round_0.25rem_0.25rem_0_0)]`}
                    >
                      <span
                        className={`absolute inset-0 transition-transform ${ease} group-hover:-translate-y-[12%] group-focus-visible:-translate-y-[12%]`}
                      >
                        <ResponsiveImage
                          asset={sport.images[0]}
                          sizes="(max-width: 767px) 40vw, 18.5rem"
                          fill
                        />
                      </span>
                      <span
                        aria-hidden
                        className={`absolute inset-0 bg-[linear-gradient(to_bottom,rgb(0_0_0/0)_45%,rgb(0_0_0/0.75)_100%)] transition-opacity sm:bg-[linear-gradient(to_bottom,rgb(0_0_0/0)_50%,rgb(0_0_0/0.6)_100%)] ${ease} group-hover:opacity-0 group-focus-visible:opacity-0`}
                      />
                    </span>

                    {/* At rest: the name (and, on phones, the tagline) on the photo. */}
                    <span
                      aria-hidden
                      className={`absolute inset-x-3 bottom-3 flex flex-col gap-1 text-white transition-[opacity,translate] sm:inset-x-5 sm:bottom-5 ${ease} group-hover:translate-y-3 group-hover:opacity-0 group-focus-visible:translate-y-3 group-focus-visible:opacity-0`}
                    >
                      <span className="font-serif text-body-md leading-[1.15] sm:text-heading-5">
                        {sport.chip}
                      </span>
                      {sport.kicker ? (
                        <span className="text-[0.6875rem] leading-snug text-white/80 sm:hidden">
                          {sport.kicker}
                        </span>
                      ) : null}
                    </span>

                    {/* On hover: the white panel. */}
                    <span
                      className={`absolute inset-x-0 bottom-0 flex h-[30%] translate-y-4 items-center justify-between gap-2 px-3 opacity-0 transition-[opacity,translate] max-sm:hidden sm:gap-4 sm:px-5 ${ease} group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100`}
                    >
                      <span className="flex flex-col gap-1">
                        <span className="font-serif text-body-sm leading-[1.15] text-ink sm:text-heading-5">
                          {sport.chip}
                        </span>
                        {sport.kicker ? (
                          <span className="text-body-sm text-slate max-sm:hidden">
                            {sport.kicker}
                          </span>
                        ) : null}
                      </span>
                      <span
                        aria-hidden
                        className="grid size-7 shrink-0 place-items-center rounded-full bg-deep text-white sm:size-10"
                      >
                        <Icon name="arrow-up-right" className="size-3.5 sm:size-4.5" />
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <PhoneEndCta className="mt-6 px-gutter">{cta}</PhoneEndCta>
        <DetailDrawer
          items={sports}
          index={open}
          onClose={() => setOpen(null)}
          onNavigate={setOpen}
        />
      </Section>
    </div>
  );
}
