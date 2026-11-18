"use client";

import type { CSSProperties } from "react";
import { routes } from "@/config/routes";
import { resale } from "@/content/home";
import { units } from "@/content/resale";
import { useGsap } from "@/hooks/useGsap";
import { gsap } from "@/lib/gsap";
import { Container } from "@/components/layout/Container";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { ArrowChip } from "@/components/ui/ArrowChip";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { SmartLink } from "@/components/ui/SmartLink";

/*
 * Figma gallery (378:18992) at its 1512 × 982 frame: a five-photo collage. While the section is
 * pinned, the centre lounge photo grows to fill the screen, the others drift out, and the
 * Resale panel ("Own Your Next Home") rises in over it.
 */
const W = 1512;
const H = 982;
const box = (x: number, y: number, w: number, h: number) => ({
  left: `${(x / W) * 100}%`,
  top: `${(y / H) * 100}%`,
  width: `${(w / W) * 100}%`,
  height: `${(h / H) * 100}%`,
});

// Full-height portraits frame the stack; landscapes above and below share the centre width.
const tiles = [
  { key: "top", rect: box(388, 88, 736, 220), out: { yPercent: -120 } },
  { key: "left", rect: box(60, 148, 304, 711), out: { xPercent: -140 } },
  { key: "right", rect: box(1148, 148, 304, 711), out: { xPercent: 140 } },
  { key: "bottom", rect: box(388, 699, 736, 220), out: { yPercent: 130 } },
] as const;
const centre = box(388, 332, 736, 343);
const featured = units.slice(0, 3);

export function ResaleSection() {
  const ref = useGsap<HTMLElement>(({ scope, reducedMotion }) => {
    const hero = scope.querySelector<HTMLElement>("[data-centre]");
    const panel = scope.querySelector<HTMLElement>("[data-panel]");
    const veil = scope.querySelector<HTMLElement>("[data-veil]");
    if (!hero || !panel || !veil) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      if (reducedMotion) {
        gsap.set(hero, { left: 0, top: 0, width: "100%", height: "100%", borderRadius: 0 });
        gsap.set(scope.querySelectorAll("[data-tile]"), { autoAlpha: 0 });
        gsap.set([panel, veil], { autoAlpha: 1 });
        return;
      }
      // Entrance: the photos unveil from their bottom edge and settle up, centre first, then
      // the landscapes above and below, then the portraits from the outside in.
      const tileEls = gsap.utils.toArray<HTMLElement>("[data-tile]", scope);
      const order = [hero, tileEls[0], tileEls[3], tileEls[1], tileEls[2]];
      gsap.fromTo(
        order,
        { clipPath: "inset(100% 0% 0% 0% round 4px)", y: 80 },
        {
          clipPath: "inset(0% 0% 0% 0% round 4px)",
          y: 0,
          duration: 1.4,
          ease: "expo.out",
          stagger: 0.12,
          clearProps: "clipPath",
          scrollTrigger: { trigger: scope, start: "top 75%", toggleActions: "play none none none" },
        },
      );
      gsap.fromTo(
        scope.querySelectorAll("[data-tile] img, [data-centre] img"),
        { scale: 1.25 },
        {
          scale: 1,
          duration: 1.8,
          ease: "expo.out",
          stagger: 0.12,
          scrollTrigger: { trigger: scope, start: "top 75%", toggleActions: "play none none none" },
        },
      );

      const timeline = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: scope,
          start: "top top",
          end: "+=140%",
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });
      scope.querySelectorAll<HTMLElement>("[data-tile]").forEach((tile, index) => {
        timeline.to(tile, { ...tiles[index].out, autoAlpha: 0, duration: 0.8 }, 0);
      });
      timeline
        .to(
          hero,
          { left: 0, top: 0, width: "100%", height: "100%", borderRadius: 0, duration: 1 },
          0,
        )
        .fromTo(veil, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.6)
        .fromTo(
          panel,
          { autoAlpha: 0, y: 60 },
          { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out" },
          0.75,
        )
        .fromTo(
          scope.querySelectorAll("[data-unit]"),
          { autoAlpha: 0, x: 40 },
          { autoAlpha: 1, x: 0, duration: 0.3, stagger: 0.06, ease: "power3.out" },
          0.82,
        )
        .to({}, { duration: 0.25 });

      // Parallax: the lounge photo drifts up through its frame, uncovering its lower part (the
      // lounge and the guest) from the moment the section
      // arrives until it has scrolled away (the pin's length included), so it reads as depth.
      const media = scope.querySelector<HTMLElement>("[data-centre-media]");
      if (media) {
        gsap.fromTo(
          media,
          { yPercent: 12 },
          {
            yPercent: -14,
            ease: "none",
            scrollTrigger: {
              trigger: scope,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      }
    });
    return () => mm.revert();
  }, []);

  const { gallery } = resale;

  return (
    <section
      ref={ref}
      aria-labelledby="resale-title"
      data-theme-surface="light"
      className="relative overflow-hidden bg-white md:h-svh"
    >
      {/* Collage (desktop); on small screens the lounge photo simply carries the panel. */}
      <div className="absolute inset-0 hidden md:block">
        {tiles.map((tile) => (
          <div
            key={tile.key}
            data-tile
            className="absolute overflow-hidden rounded-md"
            style={tile.rect}
          >
            <ResponsiveImage
              asset={gallery[tile.key]}
              sizes={
                tile.key === "top" || tile.key === "bottom"
                  ? "50vw"
                  : tile.key === "right"
                    ? "100vw"
                    : "60vw"
              }
              quality={85}
              fill
            />
          </div>
        ))}
      </div>

      <div
        data-centre
        // Phones: a full-width 4:5 photo, whatever the desktop animation left inline after the
        // window was narrowed (hence the !important resets below `md`).
        className="relative aspect-[4/5] overflow-hidden max-md:!relative max-md:!inset-auto max-md:!h-auto max-md:!w-full max-md:!rounded-none md:absolute md:top-(--top) md:left-(--left) md:aspect-auto md:h-(--height) md:w-(--width) md:rounded-md"
        style={
          {
            "--left": centre.left,
            "--top": centre.top,
            "--width": centre.width,
            "--height": centre.height,
          } as CSSProperties
        }
      >
        {/* Taller than its frame so it can drift in a clear parallax as the section scrolls. */}
        <div
          data-centre-media
          className="absolute inset-x-0 -top-[20%] h-[140%] will-change-transform max-md:!transform-none"
        >
          <ResponsiveImage asset={gallery.centre} sizes="100vw" quality={85} fill />
        </div>
        <div
          data-veil
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_right,rgb(0_0_0/0.55),rgb(0_0_0/0.15)_55%,transparent),linear-gradient(to_top,rgb(0_0_0/0.45),transparent_50%)] max-md:!visible max-md:!opacity-100 md:opacity-0"
        />
      </div>

      <div
        data-panel
        className="absolute inset-x-0 bottom-0 pb-[clamp(2.5rem,6vh,4rem)] text-white max-md:!visible max-md:!transform-none max-md:!opacity-100 md:opacity-0"
      >
        <Container className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-[30rem] flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Eyebrow tone="dark">{resale.eyebrow}</Eyebrow>
              <h2 id="resale-title" className="text-heading-1">
                {resale.title}
              </h2>
            </div>
            <p className="text-body-lg">{resale.description}</p>
            <div>
              <Button href={resale.cta.href} variant="light" icon="arrow-up-right">
                {resale.cta.label}
              </Button>
            </div>
          </div>

          {/* Frosted-glass widget over the photo: a peek at three available units in white, with no
              rules between them; a row brightens on hover and its arrow chip fills turquoise. */}
          <div className="hidden w-[26rem] shrink-0 flex-col overflow-hidden rounded-md bg-white/10 py-2 text-white shadow-[0_24px_60px_-24px_rgb(0_0_0/0.5)] backdrop-blur-xl backdrop-saturate-150 lg:flex">
            <div className="px-5 pt-3 pb-1.5">
              <span className="eyebrow text-body-2xs text-white">Recently added</span>
            </div>
            <ul className="flex flex-col">
              {featured.map((unit) => (
                <li key={unit.slug} data-unit>
                  <SmartLink
                    href={routes.unit(unit.slug)}
                    className="group flex items-center gap-3.5 px-5 py-3.5 transition-colors duration-500 ease-out-expo hover:bg-white/10 focus-visible:bg-white/10"
                  >
                    <span className="relative block size-16 shrink-0 overflow-hidden rounded-md">
                      <ResponsiveImage
                        asset={unit.images[0]}
                        sizes="64px"
                        fill
                        className="transition-transform duration-[1600ms] ease-out-expo group-hover:scale-[1.08]"
                      />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <span className="truncate font-serif text-body-lg leading-tight">
                        {unit.title}
                      </span>
                      <span className="flex items-center gap-2.5 text-body-xs text-white/75">
                        <span className="flex min-w-0 items-center gap-1">
                          <Icon name="pin-min" strokeWidth={1.5} className="size-4.5 shrink-0" />
                          <span className="truncate">{unit.neighborhood}</span>
                        </span>
                        <span aria-hidden className="h-3 w-px shrink-0 bg-white/30" />
                        <span className="flex shrink-0 items-center gap-1">
                          <Icon name="bed-min" strokeWidth={1.5} className="size-4.5" />
                          {unit.bedrooms}
                        </span>
                        <span aria-hidden className="h-3 w-px shrink-0 bg-white/30" />
                        <span className="flex shrink-0 items-center gap-1">
                          <Icon name="bath-min" strokeWidth={1.5} className="size-4.5" />
                          {unit.bathrooms}
                        </span>
                      </span>
                    </span>
                    <ArrowChip className="border-transparent" />
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </div>
    </section>
  );
}
