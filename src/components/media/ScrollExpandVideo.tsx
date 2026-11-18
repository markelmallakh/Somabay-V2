"use client";

import type { ReactNode } from "react";
import { useGsap } from "@/hooks/useGsap";
import { gsap } from "@/lib/gsap";
import type { VideoAsset } from "@/types/media";
import { Container } from "@/components/layout/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Video } from "./Video";

type ScrollExpandVideoProps = {
  video: VideoAsset;
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Usually a button, shown with the copy once the film is full screen. */
  action?: ReactNode;
  id?: string;
};

/**
 * Scroll-driven film reveal: a rounded film card in the middle of the page grows to fill the
 * screen while the page scrolls, its corners easing square and the film settling from a zoom;
 * the copy then rises over it. Sticky (no pinning), so it never jumps; reduced motion shows the
 * full-screen state directly.
 */
export function ScrollExpandVideo({
  video,
  eyebrow,
  title,
  description,
  action,
  id,
}: ScrollExpandVideoProps) {
  const ref = useGsap<HTMLElement>(({ scope, reducedMotion }) => {
    const frame = scope.querySelector<HTMLElement>("[data-frame]");
    const film = scope.querySelector<HTMLElement>("[data-film]");
    const copy = scope.querySelector<HTMLElement>("[data-copy]");
    const shade = scope.querySelector<HTMLElement>("[data-shade]");
    if (!frame || !film || !copy || !shade || reducedMotion) return;

    // On a tall phone screen equal insets would start the film as a narrow portrait strip; there
    // it starts as a wide frame across the content width instead.
    const start =
      window.innerWidth < 640
        ? "inset(30% 4% 30% 4% round 0.25rem)"
        : "inset(22% 24% 22% 24% round 0.25rem)";
    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: scope, start: "top top", end: "bottom bottom", scrub: 0.8 },
    });
    timeline
      .fromTo(
        frame,
        { clipPath: start },
        { clipPath: "inset(0% 0% 0% 0% round 0rem)", duration: 1 },
        0,
      )
      .fromTo(film, { scale: 1.25 }, { scale: 1, duration: 1 }, 0)
      .fromTo(shade, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.6)
      .fromTo(copy, { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 0.4 }, 0.7)
      // A brief hold once the film fills the screen, so the copy can be read before it moves on.
      .to({}, { duration: 0.22 });
  });

  return (
    <section
      ref={ref}
      aria-labelledby={id}
      data-theme-surface="dark"
      className="relative h-[220svh] bg-white motion-reduce:h-svh sm:h-[290svh]"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <div data-frame className="absolute inset-0 overflow-hidden bg-abyss">
          <div data-film className="absolute inset-0">
            <Video
              asset={video}
              playback="in-view"
              sizes="100vw"
              className="absolute inset-0 size-full"
            />
          </div>
          <div
            data-shade
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_top,rgb(8_46_48/0.85),rgb(8_46_48/0.25)_55%,rgb(8_46_48/0.1))]"
          />
        </div>
        <Container className="relative flex h-full items-end pb-16 md:pb-24">
          <div data-copy className="max-w-2xl text-white">
            {eyebrow ? <Eyebrow tone="dark">{eyebrow}</Eyebrow> : null}
            <h2 id={id} className="mt-4 text-heading-2">
              {title}
            </h2>
            {description ? <p className="mt-5 text-body-lg text-white/80">{description}</p> : null}
            {action ? <div className="mt-8">{action}</div> : null}
          </div>
        </Container>
      </div>
    </section>
  );
}
