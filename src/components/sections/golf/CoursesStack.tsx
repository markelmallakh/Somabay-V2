"use client";

import type { CSSProperties } from "react";
import { courses } from "@/content/golf";
import { useGsap } from "@/hooks/useGsap";
import { gsap } from "@/lib/gsap";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/**
 * The courses as cards stacking over each other: on large screens each card sticks a little
 * below the one before, so the next course slides up and settles on top while the earlier
 * cards ease back (scale down and dim). Phones and reduced motion get a plain list.
 */
export function CoursesStack() {
  const ref = useGsap<HTMLOListElement>(({ scope, reducedMotion }) => {
    if (reducedMotion) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-course]", scope);
      cards.slice(0, -1).forEach((card, index) => {
        const next = cards[index + 1];
        // No darkening filter (it flashed black on the photo while scrolling): the card eases
        // back, softens with a light blur and a white veil, so its edges read behind the next.
        const tl = gsap.timeline({
          scrollTrigger: { trigger: next, start: "top bottom", end: "top 30%", scrub: true },
        });
        tl.to(card.querySelector("[data-course-inner]"), {
          scale: 0.92,
          filter: "blur(4px)",
          ease: "none",
        }).to(card.querySelector("[data-course-veil]"), { opacity: 0.45, ease: "none" }, 0);
      });
    });
    return () => mm.revert();
  });

  return (
    <ol ref={ref} className="flex flex-col gap-5 sm:gap-8 lg:gap-[12vh]">
      {courses.map((course, index) => (
        <li
          key={course.title}
          data-course
          className="lg:sticky lg:top-[calc(var(--header-height)+2rem+var(--i)*2.5rem)]"
          style={{ "--i": index } as CSSProperties}
        >
          <article
            data-course-inner
            className="relative grid origin-top overflow-hidden rounded-md bg-white shadow-[0_-6px_20px_-12px_rgb(15_30_53/0.12),0_10px_28px_-18px_rgb(15_30_53/0.12)] [backface-visibility:hidden] lg:h-[min(40rem,calc(100svh-var(--header-height)-12rem))] lg:grid-cols-12 lg:will-change-[transform,filter]"
          >
            <span
              aria-hidden
              data-course-veil
              className="pointer-events-none absolute inset-0 z-10 bg-white opacity-0"
            />
            <div className="relative aspect-[16/10] overflow-hidden lg:col-span-7 lg:aspect-auto">
              <ResponsiveImage
                asset={course.image}
                sizes="(min-width: 1440px) 760px, (min-width: 1024px) 56vw, 100vw"
                fill
              />
            </div>
            <div className="flex flex-col p-5 sm:p-6 md:p-10 lg:col-span-5 lg:p-12">
              <p className="text-body-xs font-semibold tracking-label text-turquoise uppercase">
                {course.label}
              </p>
              <h3 className="mt-2 font-serif text-heading-4 leading-[1.1] lg:mt-3">
                {course.title}
              </h3>
              <p className="mt-3 text-body-sm text-slate sm:mt-4">{course.description}</p>
              <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-5 sm:mt-6 sm:pt-6 xl:grid-cols-3">
                {course.facts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="text-body-xs tracking-label text-slate uppercase">
                      {fact.label}
                    </dt>
                    <dd className="mt-1 text-body-sm font-semibold text-ink">{fact.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-auto flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pt-5 sm:gap-y-5 sm:pt-6">
                <ul className="flex flex-col gap-2 text-body-sm text-slate">
                  {course.hours.map((line) => (
                    <li key={line} className="flex items-center gap-2">
                      <Icon name="clock-solid" className="size-4 shrink-0 text-turquoise" />
                      {line}
                    </li>
                  ))}
                </ul>
                <Button
                  href={course.url}
                  external
                  variant="outline"
                  size="sm"
                  icon="arrow-up-right"
                  className="border-deep text-turquoise"
                  aria-label={`Know more about the ${course.title} on the Somabay Golf website`}
                >
                  Know more
                </Button>
              </div>
            </div>
          </article>
        </li>
      ))}
      {/* Room for the last card to hold over the two behind it before the stack moves on
          (sticky can't travel into padding, so the hold needs a real element). */}
      <li aria-hidden className="-mt-[12vh] hidden h-[30vh] lg:block" />
    </ol>
  );
}
