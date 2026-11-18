"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { SectionHeading } from "@/components/layout/SectionHeading";
import type { SectionIntro } from "@/types/content";
import type { ImageAsset } from "@/types/media";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/Container";
import { easeOutExpo } from "@/components/animations/easing";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { Icon } from "@/components/ui/Icon";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Milestone = { year: string; title: string; description: string };

type TimelineSectionProps = {
  intro: SectionIntro;
  milestones: Milestone[];
  /** The one image behind the whole section. */
  image: ImageAsset;
};

/** A character rolls in from below going forward, from above going back. */
const roll = {
  enter: (direction: number) => ({ y: direction > 0 ? "105%" : "-105%" }),
  center: { y: "0%" },
  exit: (direction: number) => ({ y: direction > 0 ? "-105%" : "105%" }),
};

/** How long each milestone stays before the timeline moves on, seconds. */
const STEP = 6;

/**
 * Milestones over one fixed background image. The year is set very large and rolls in character
 * by character; the title and story sit beside it. Along the bottom runs the timeline: a line
 * with a stop per milestone, already drawn up to the current one, and drawing on towards the next
 * while the section is on screen. When it arrives, the next milestone rolls in. It never takes
 * over the page scroll; hovering or focusing pauses it, and any stop (or the arrows) can be
 * picked by hand.
 */
export function TimelineSection({ intro, milestones, image }: TimelineSectionProps) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(section, { threshold: 0.35 });
  const reduced = useReducedMotion();
  const count = milestones.length;
  const current = milestones[active];
  const last = count - 1;
  const running = inView && !paused;

  const goTo = (index: number) => {
    const next = (index + count) % count;
    if (next === active) return;
    // Stepping on (including the wrap from the last back to the first) rolls forward.
    setDirection(index === active + 1 || (index > active && index !== active - 1) ? 1 : -1);
    setActive(next);
  };

  // Hovering or focusing the timeline pauses it.
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const pause = () => setPaused(true);
    const resume = () => setPaused(false);
    element.addEventListener("pointerenter", pause);
    element.addEventListener("pointerleave", resume);
    element.addEventListener("focusin", pause);
    element.addEventListener("focusout", resume);
    return () => {
      element.removeEventListener("pointerenter", pause);
      element.removeEventListener("pointerleave", resume);
      element.removeEventListener("focusin", pause);
      element.removeEventListener("focusout", resume);
    };
  }, []);

  const stop = (index: number) => (last ? (index / last) * 100 : 0);
  const glassArrow =
    "wave glass grid size-11 place-items-center rounded-md border border-white/40 text-white transition-colors duration-500 [--wave:#fff] hover:border-white hover:text-ink";

  return (
    <section
      ref={section}
      aria-labelledby="timeline-title"
      data-theme-surface="dark"
      className="relative isolate overflow-hidden text-white [clip-path:inset(0)]"
    >
      <style>{`@keyframes somabay-milestone{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>

      {/* One fixed image behind the whole section (it stays put while the page moves). */}
      <div aria-hidden className="fixed inset-0 -z-20">
        <ResponsiveImage asset={image} sizes="100vw" quality={85} fill />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(0_0_0/0.55)_0%,rgb(0_0_0/0.25)_35%,rgb(0_0_0/0.35)_60%,rgb(0_0_0/0.8)_100%)]"
      />

      <Container className="flex min-h-[38rem] flex-col py-14 sm:min-h-[48rem] sm:py-24 lg:min-h-[52rem] lg:py-28">
        <SectionHeading
          id="timeline-title"
          align="center"
          tone="light"
          eyebrow={intro.eyebrow}
          title={intro.title}
        />

        <div ref={stage} className="mt-auto flex flex-col gap-8 pt-10 sm:gap-12 sm:pt-16 lg:gap-16">
          {/* The year, rolling in letter by letter, with its story beside it. */}
          <div className="grid items-end gap-4 sm:gap-6 lg:grid-cols-12">
            <p
              aria-live="polite"
              className="font-serif text-[clamp(3.5rem,1.4rem+9.5vw,10.5rem)] leading-[0.9] lg:col-span-7"
            >
              <span className="sr-only">{current.year}</span>
              {/* Odometer: each position keeps its own slot and only rolls when its character
                  changes (2005 → 2007 moves the last digit alone), up going forward, down going
                  back. */}
              <span aria-hidden className="flex whitespace-pre">
                <AnimatePresence initial={false}>
                  {current.year.split("").map((character, index) => (
                    <m.span
                      key={index}
                      exit={{ opacity: 0, transition: { duration: 0.25 } }}
                      className="relative inline-grid overflow-hidden pb-[0.08em]"
                    >
                      <AnimatePresence initial={false} custom={direction}>
                        <m.span
                          key={character}
                          custom={direction}
                          variants={roll}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ duration: 0.9, ease: easeOutExpo, delay: index * 0.05 }}
                          className="col-start-1 row-start-1 inline-block"
                        >
                          {character}
                        </m.span>
                      </AnimatePresence>
                    </m.span>
                  ))}
                </AnimatePresence>
              </span>
            </p>
            <div className="lg:col-span-4 lg:col-start-9 lg:pb-4">
              <AnimatePresence mode="wait" initial={false}>
                <m.div
                  key={current.year}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.7, ease: easeOutExpo, delay: 0.15 },
                  }}
                  exit={{ opacity: 0, y: -10, transition: { duration: 0.3 } }}
                  className="flex flex-col gap-3"
                >
                  <h3 className="font-serif text-heading-4 leading-[1.15]">{current.title}</h3>
                  <p className="text-body-md text-white/80">{current.description}</p>
                </m.div>
              </AnimatePresence>
            </div>
          </div>

          {/* The timeline. */}
          <div className="flex items-end gap-6 lg:gap-10">
            <div className="relative min-w-0 flex-1">
              {/* Base line, the part already travelled, and the part drawing on. */}
              <div aria-hidden className="absolute inset-x-0 top-[0.4375rem] h-px bg-white/25" />
              <div
                aria-hidden
                className="absolute top-[0.4375rem] left-0 h-px bg-white transition-[width] duration-1000 ease-out-expo"
                style={{ width: `${stop(active)}%` }}
              />
              <span
                key={`progress-${active}`}
                aria-hidden
                className={cn(
                  "absolute top-[0.4375rem] h-px origin-left bg-sun",
                  active === last && "opacity-0",
                )}
                style={{
                  left: `${stop(active)}%`,
                  width: active === last ? "100%" : `${stop(1)}%`,
                  ...(reduced
                    ? { transform: "scaleX(0)" }
                    : {
                        animation: `somabay-milestone ${STEP}s linear forwards`,
                        animationPlayState: running ? "running" : "paused",
                      }),
                }}
                onAnimationEnd={() => goTo(active + 1)}
              />

              <ol className="relative flex justify-between" aria-label="Milestones">
                {milestones.map((milestone, index) => {
                  const selected = index === active;
                  const passed = index < active;
                  const edge = index === 0 ? "start" : index === last ? "end" : "center";
                  return (
                    <li
                      key={milestone.year}
                      className={cn(
                        "flex",
                        edge === "start"
                          ? "justify-start"
                          : edge === "end"
                            ? "justify-end"
                            : "justify-center",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => goTo(index)}
                        aria-current={selected ? "step" : undefined}
                        className={cn(
                          // The hit area reaches past the small dot, for fingers.
                          "group relative flex flex-col gap-3 before:absolute before:-inset-x-1.5 before:-inset-y-3 before:content-['']",
                          edge === "start"
                            ? "items-start"
                            : edge === "end"
                              ? "items-end"
                              : "items-center",
                        )}
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "size-3.5 rounded-full border transition-[background-color,border-color,scale,box-shadow] duration-700 ease-out-expo",
                            selected
                              ? "scale-125 border-deep bg-deep shadow-[0_0_0_6px_rgb(0_178_186/0.3)]"
                              : passed
                                ? "border-white bg-white"
                                : "border-white/60 bg-black/30 group-hover:border-white",
                          )}
                        />
                        <span
                          className={cn(
                            "text-body-sm font-medium whitespace-nowrap transition-colors duration-500",
                            // Phones: eleven years don't fit side by side, so only the current
                            // one is labelled (the big year above names it too).
                            selected
                              ? "text-white"
                              : "hidden text-white/55 group-hover:text-white/80 sm:inline",
                          )}
                        >
                          {milestone.year}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="hidden shrink-0 gap-2 lg:flex">
              <button type="button" onClick={() => goTo(active - 1)} className={glassArrow}>
                <span className="sr-only">Previous milestone</span>
                <Icon name="arrow-right" className="size-5 rotate-180" />
              </button>
              <button type="button" onClick={() => goTo(active + 1)} className={glassArrow}>
                <span className="sr-only">Next milestone</span>
                <Icon name="arrow-right" className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
