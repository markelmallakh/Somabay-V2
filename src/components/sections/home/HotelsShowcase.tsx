"use client";

import { useState } from "react";
import { amenityIcon } from "@/lib/amenity-icons";
import { cn } from "@/lib/utils";
import type { Cta } from "@/types/content";
import type { ImageAsset } from "@/types/media";
import { Container } from "@/components/layout/Container";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { StarChip } from "@/components/sections/holidays/StarChip";
import type { StayCardItem } from "@/components/sections/shared/StackingCards";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { PriceFrom } from "@/components/ui/PriceFrom";

export type ShowcaseHotel = StayCardItem & {
  /** The hotel's photos; the first is the cover. */
  gallery: ImageAsset[];
};

type HotelsShowcaseProps = {
  hotels: ShowcaseHotel[];
  ctaLabel: string;
  eyebrow?: string;
  title: string;
  description?: string;
  cta: Cta;
  titleId: string;
};

/**
 * Stay spotlight (after the Meridian reference). A full-width photo of the chosen stay fills the
 * section; the section title sits top left and its paragraph and CTA top right; a card in the middle holds
 * a second photo beside the stay's details (badges, name, story, facilities, price, CTA), on
 * a black veil. Along the foot, every stay is a compact glass pill in a still,
 * centred row; bare arrows on each side step through them. Picking a stay cross-fades its photo
 * (slow ease-in-out) and lifts the card in. The section is one screen tall whatever the number
 * of stays.
 * (The earlier stacking deck is saved as `StackingCards`.)
 */
export function HotelsShowcase({
  hotels,
  ctaLabel,
  eyebrow,
  title,
  description,
  cta,
  titleId,
}: HotelsShowcaseProps) {
  const count = hotels.length;
  const [active, setActive] = useState(0);
  // The photo underneath while the new one fades in over it.
  const [previous, setPrevious] = useState<number | null>(null);
  const hotel = hotels[active];

  const choose = (index: number) => {
    const next = (index + count) % count;
    if (next === active) return;
    setPrevious(active);
    setActive(next);
  };

  const cardPhoto = hotel.gallery[1] ?? hotel.image;
  const badges = hotel.tags.filter((tag, index, all) => all.indexOf(tag) === index);

  return (
    <div
      data-theme-surface="dark"
      className="relative isolate flex min-h-[50rem] flex-col overflow-hidden bg-deep text-white lg:h-[max(46rem,min(100svh,58rem))] lg:min-h-0"
    >
      {/* Background: the chosen stay's photo, full width, cross-fading over the last one with a
          slow ease-in-out. */}
      <div aria-hidden className="absolute inset-0 -z-20">
        {previous !== null ? (
          <div key={hotels[previous].slug} className="absolute inset-0">
            <ResponsiveImage asset={hotels[previous].image} sizes="100vw" fill />
          </div>
        ) : null}
        <div
          key={hotel.slug}
          className="absolute inset-0 animate-[photo-fade_1.4s_var(--ease-in-out-quart)_both] motion-reduce:animate-none"
        >
          <ResponsiveImage asset={hotel.image} sizes="100vw" fill />
        </div>
      </div>
      {/* A black veil over the whole photo keeps the text and the glass card high in contrast. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/40" />
      {/* Shade: the top band and its left corner for the title row, the foot for the stay pills. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(8_46_48/0.85)_0%,rgb(8_46_48/0.3)_22%,transparent_45%),radial-gradient(85%_80%_at_0%_0%,rgb(8_46_48/0.92),rgb(8_46_48/0.5)_45%,transparent_78%),linear-gradient(to_right,rgb(8_46_48/0.7),rgb(8_46_48/0.25)_40%,transparent_60%),linear-gradient(to_bottom,rgb(8_46_48/0.6),rgb(8_46_48/0.2)_30%,transparent_45%)] max-lg:bg-deep/50"
      />

      <Container className="flex flex-1 flex-col justify-between gap-8 pt-[calc(var(--header-bar)+2rem)] pb-6 lg:pt-[calc(var(--header-bar)+2.5rem)]">
        {/* Top row: the title on the left; the paragraph and the section CTA on the right. */}
        <div className="flex flex-col items-start gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="flex flex-col items-start gap-3 sm:gap-4">
            {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
            <h2 id={titleId} className="text-heading-1">
              {title}
            </h2>
          </div>
          <div className="flex max-w-sm flex-col items-start gap-4 sm:gap-5 lg:pb-1">
            {description ? <p className="text-body-md text-white/80">{description}</p> : null}
            <Button href={cta.href} variant="light" icon="arrow-up-right">
              {cta.label}
            </Button>
          </div>
        </div>

        {/* The card and the stay chips sit together at the foot of the photo. */}
        <div className="flex flex-col gap-5">
          {/* The chosen stay: a white card, photo beside its details. */}
          <article
            key={hotel.slug}
            aria-labelledby={`spot-${hotel.slug}`}
            className="mx-auto grid w-full max-w-[52rem] animate-rise gap-2 rounded-[1.75rem] bg-white p-2 text-ink shadow-[0_40px_80px_-30px_rgb(0_0_0/0.6)] motion-reduce:animate-none md:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] md:aspect-auto md:min-h-[19rem]">
              <ResponsiveImage asset={cardPhoto} sizes="(min-width: 768px) 304px, 100vw" fill />
            </div>
            <div className="flex min-w-0 flex-col gap-5 px-3 pt-2 pb-3 md:px-5 md:py-4">
              <div className="flex flex-col gap-3">
                {/* High-contrast tag badges above the name. */}
                <ul className="flex flex-wrap gap-1.5">
                  {badges.map((badge) => (
                    <li key={badge}>
                      <span className="inline-flex items-center rounded-full bg-deep px-2.5 py-1 text-[0.6875rem] leading-none font-semibold tracking-[0.1em] text-white uppercase">
                        {badge}
                      </span>
                    </li>
                  ))}
                </ul>
                {/* The name with its star rating beside it: the sun-yellow "5 ★" StarChip. */}
                <div className="flex flex-wrap items-center gap-3">
                  <h3 id={`spot-${hotel.slug}`} className="text-heading-4 leading-[0.95]">
                    {hotel.name}
                  </h3>
                  {hotel.stars ? <StarChip count={hotel.stars} /> : null}
                </div>
                <p className="line-clamp-4 text-body-sm text-slate">{hotel.description}</p>
              </div>
              {hotel.amenities.length ? (
                <ul
                  aria-label={`${hotel.name} amenities`}
                  // A hairline and a clear gap keep the facilities apart from a longer story.
                  className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-4"
                >
                  {hotel.amenities.slice(0, 4).map((amenity) => (
                    <li key={amenity} className="flex min-w-0 items-center gap-2 text-body-xs">
                      <Icon
                        name={amenityIcon(amenity)}
                        strokeWidth={1.5}
                        className="size-4 shrink-0 text-deep"
                      />
                      <span className="truncate">{amenity}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                {hotel.price ? <PriceFrom amount={hotel.price} /> : null}
                <Button href={hotel.href} variant="turquoise" size="sm" icon="arrow-up-right">
                  {ctaLabel}
                  <span className="sr-only">: {hotel.name}</span>
                </Button>
              </div>
            </div>
          </article>

          {/* Every stay as a compact glass pill, the row centred and still; bare arrows on each
            side step through them. */}
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => choose(active - 1)}
              aria-label="Previous stay"
              className="grid size-9 shrink-0 place-items-center text-white/80 transition-colors duration-500 hover:text-aqua"
            >
              <Icon name="chevron-left" className="size-6" />
            </button>
            <ul
              aria-label="Choose a stay"
              // Phones: one row that swipes; larger screens: a centred row that wraps if it must.
              className="scrollbar-none flex min-w-0 gap-1.5 overflow-x-auto sm:flex-wrap sm:justify-center sm:overflow-visible"
            >
              {hotels.map((item, index) => {
                const current = index === active;
                return (
                  <li key={item.slug} className="shrink-0">
                    <button
                      type="button"
                      aria-pressed={current}
                      onClick={() => choose(index)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border py-0.5 pr-3 pl-0.5 text-body-xs whitespace-nowrap backdrop-blur-md transition-colors duration-500",
                        current
                          ? "border-white bg-white text-ink"
                          : "border-white/20 bg-white/10 text-white/85 hover:border-white/50 hover:text-white",
                      )}
                    >
                      <span className="relative size-6 shrink-0 overflow-hidden rounded-full">
                        <ResponsiveImage asset={item.image} sizes="24px" fill />
                      </span>
                      <span className="font-medium">{item.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={() => choose(active + 1)}
              aria-label="Next stay"
              className="grid size-9 shrink-0 place-items-center text-white/80 transition-colors duration-500 hover:text-aqua"
            >
              <Icon name="chevron-right" className="size-6" />
            </button>
          </div>
        </div>
      </Container>
      <p aria-live="polite" className="sr-only">
        Showing {hotel.name}, {active + 1} of {count}
      </p>
    </div>
  );
}
