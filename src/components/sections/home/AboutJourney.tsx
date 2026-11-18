"use client";

import type { ReactNode } from "react";
import { useGsap } from "@/hooks/useGsap";
import { gsap } from "@/lib/gsap";
import type { VideoAsset } from "@/types/media";
import { Container } from "@/components/layout/Container";
import { ScrollRevealText } from "@/components/animations/ScrollRevealText";
import { Video } from "@/components/media/Video";
import { Eyebrow } from "@/components/ui/Eyebrow";

type AboutJourneyProps = {
  eyebrow: string;
  statement: string;
  statementLead: number;
  paragraphs: string[];
  ambient: VideoAsset;
  /** Shown under the closing line, on the film's last frame (the key figures). */
  outro?: ReactNode;
};

/**
 * The About story as one continuous scroll: a deep-sea colour field rises over the pinned hero
 * with a feathered edge and carries the statement, then dissolves into the top-down shoreline
 * film, which stays as a sticky stage travelling from open water to sand under the copy. Each block rises in softly and fades out as the next one arrives.
 * Reduced motion: static stage, copy simply scrolls.
 */
/** Fraction of the film's height hidden above the stage at the start (its dark top band). */
const FILM_START = 0.18;
/** Fraction of the film's height the travel stops short of its foot, so the open sea stays in
 *  view longer under the copy and the sand arrives later. */
const FILM_DROP = 0.06;

export function AboutJourney({
  eyebrow,
  statement,
  statementLead,
  paragraphs,
  ambient,
  outro,
}: AboutJourneyProps) {
  const ref = useGsap<HTMLDivElement>(({ scope, reducedMotion }) => {
    if (reducedMotion) {
      const film = scope.querySelector<HTMLElement>("[data-film]");
      if (film) gsap.set(film, { yPercent: -FILM_START * 100 });
      return;
    }
    const track = scope;
    const stage = scope.querySelector<HTMLElement>("[data-stage]");
    const film = scope.querySelector<HTMLElement>("[data-film]");
    const veil = scope.querySelector<HTMLElement>("[data-veil]");
    const firstStory = scope.querySelectorAll<HTMLElement>("[data-block]")[1];
    if (!stage || !film || !veil || !firstStory) return;

    // Entry: the stage rises over the pinned hero with a feathered top edge that tightens
    // to nothing as it reaches the top of the screen — no hard section edge.
    gsap.fromTo(
      stage,
      { "--feather": "55%" },
      {
        "--feather": "0%",
        ease: "none",
        scrollTrigger: { trigger: track, start: "top bottom", end: "top top", scrub: 0.6 },
      },
    );

    // The statement sits on a deep-sea colour field; it dissolves into the film as the first
    // story line arrives.
    gsap.to(veil, {
      autoAlpha: 0,
      ease: "none",
      scrollTrigger: { trigger: firstStory, start: "top bottom", end: "top 30%", scrub: 0.6 },
    });

    // The film (taller than the screen) travels up from open sea to sand. It starts below the
    // dark band baked into the top of the clip, so the first thing seen is bright water.
    gsap.fromTo(
      film,
      { y: () => -film.offsetHeight * FILM_START },
      {
        y: () => -(film.offsetHeight * (1 - FILM_DROP) - window.innerHeight),
        ease: "none",
        scrollTrigger: {
          trigger: track,
          start: "top bottom",
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      },
    );

    scope.querySelectorAll<HTMLElement>("[data-block]").forEach((block, index, blocks) => {
      const last = index === blocks.length - 1;
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: block, start: "top bottom", end: "bottom top", scrub: 0.6 },
      });
      timeline.fromTo(
        block.firstElementChild,
        { autoAlpha: 0, yPercent: 30, filter: "blur(10px)" },
        { autoAlpha: 1, yPercent: 0, filter: "blur(0px)", duration: 0.38 },
      );
      timeline.to(block.firstElementChild, { duration: 0.24 });
      if (!last) {
        timeline.to(block.firstElementChild, {
          autoAlpha: 0,
          yPercent: -20,
          filter: "blur(6px)",
          duration: 0.38,
        });
      } else {
        timeline.to(block.firstElementChild, { duration: 0.38 });
      }
    });
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Sticky stage behind the copy. */}
      <div
        data-stage
        className="sticky top-0 -z-10 h-svh overflow-hidden bg-deep [mask-image:linear-gradient(to_bottom,transparent,#000_var(--feather))] [--feather:0%]"
      >
        <div
          data-film
          className="absolute inset-x-0 top-0 h-[max(175vw,230svh)] will-change-transform"
        >
          <Video asset={ambient} playback="in-view" className="absolute inset-0" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] bg-linear-to-t from-dune via-dune/70 via-30% to-transparent"
          />
        </div>
        <div
          aria-hidden
          data-veil
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_85%_0%,rgb(255_255_255/0.14),transparent_60%),linear-gradient(to_bottom,#082e30_0%,#0c3d40_55%,#175659_100%)] motion-reduce:hidden"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/15 via-black/5 via-60% to-transparent"
        />
      </div>

      {/* Copy scrolls over the stage. */}
      <div className="relative -mt-[100svh]">
        <section
          data-block
          aria-labelledby="about-title"
          className="flex min-h-svh items-center pt-(--header-height)"
        >
          <Container className="flex flex-col gap-2">
            <Eyebrow as="h2" id="about-title">
              {eyebrow}
            </Eyebrow>
            <ScrollRevealText
              text={statement}
              leadWords={statementLead}
              dimOpacity={0.45}
              // Phones: centred, like the rest of the layout.
              className="mx-auto max-w-[66.375rem] text-center font-sans text-statement text-white sm:mx-0 sm:text-left"
            />
          </Container>
        </section>
        {paragraphs.map((paragraph, index) => {
          const last = index === paragraphs.length - 1;
          return (
            <div
              key={paragraph}
              data-block
              // Story lines follow each other closely; the closing line and the key figures share
              // the last screen, laid over the end of the film (sand) with no band of their own.
              className={
                last
                  ? "flex min-h-[135svh] items-end pb-section"
                  : "flex min-h-[42svh] items-center"
              }
            >
              <Container className="flex flex-col gap-12 lg:gap-16">
                <p className="mx-auto max-w-[66.875rem] text-center text-statement text-white sm:mx-0 sm:text-left">
                  {paragraph}
                </p>
                {last && outro ? <div>{outro}</div> : null}
              </Container>
            </div>
          );
        })}
      </div>
    </div>
  );
}
