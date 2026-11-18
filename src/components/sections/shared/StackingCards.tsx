"use client";

import type { CSSProperties } from "react";
import { useGsap } from "@/hooks/useGsap";
import { amenityIcon } from "@/lib/amenity-icons";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import type { ImageAsset } from "@/types/media";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { PriceFrom } from "@/components/ui/PriceFrom";

/**
 * Saved pattern: "stacking cards" (V2 homepage, Red Sea Holidays, first version).
 *
 * A deck of split cards (photo left, details right) that stick under the header as the page
 * scrolls. Each new card slides up over the last, which eases back a little; every card sticks a
 * step lower than the one before, so a strip of each earlier card stays in view above the newest.
 * Best for a short list (up to about six items); longer lists scroll for too long.
 *
 * Usage: <StackingCards items={...} ctaLabel="Explore" label="Hotels" />
 * `StayCard` is the card on its own, for other layouts that want the same look.
 */

export type StayCardItem = {
  slug: string;
  name: string;
  tagline: string;
  stars?: number;
  description: string;
  image: ImageAsset;
  href: string;
  tags: string[];
  /** "Starting from" nightly price. */
  price?: string;
  /** A few facilities, listed as a ruled two-column list (hidden on phones). */
  amenities: string[];
};

/** Card grounds: dark grey and light grey-blue. Text, rules, icons and the CTA follow the ground. */
export const STAY_CARD_THEMES = [
  {
    card: "bg-[#2b2e33] text-white",
    muted: "text-white/70",
    faint: "text-white/40",
    rule: "border-white/15",
    icon: "text-aqua",
    star: "bg-star text-ink",
    button: "light",
    price: "dark",
  },
  {
    card: "bg-frost-soft text-ink",
    muted: "text-slate",
    faint: "text-ink/35",
    rule: "border-ink/12",
    icon: "text-deep",
    star: "bg-star text-ink",
    button: "primary",
    price: "light",
  },
] as const;

export type StayCardTheme = (typeof STAY_CARD_THEMES)[number];

const pad = (value: number) => String(value).padStart(2, "0");

type StayCardProps = {
  item: StayCardItem;
  index: number;
  count: number;
  ctaLabel: string;
  theme?: StayCardTheme;
  /** Fade the photo and lift the details in when the card mounts (for cards that swap content). */
  animateIn?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Extra attributes for the stacking motion. */
  stackCard?: boolean;
};

/** One split stay card: the photo in its own rounded frame, the details beside it. */
export function StayCard({
  item,
  index,
  count,
  ctaLabel,
  theme = STAY_CARD_THEMES[0],
  animateIn = false,
  className,
  style,
  stackCard = false,
}: StayCardProps) {
  const rise = (delay: string) =>
    animateIn ? cn("animate-rise motion-reduce:animate-none", delay) : undefined;
  return (
    <article
      data-stack-card={stackCard || undefined}
      aria-labelledby={`stay-${item.slug}`}
      style={style}
      className={cn(
        "grid min-h-[27rem] origin-top grid-rows-[minmax(0,50%)_minmax(0,1fr)] gap-2.5 overflow-hidden rounded-media p-2 sm:p-2.5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-rows-1 lg:gap-0",
        theme.card,
        className,
      )}
    >
      {/* Photo, inset in the card with its own rounded frame. */}
      <div className="relative isolate overflow-hidden rounded-[calc(var(--radius-media)-0.625rem)]">
        <div
          className={cn(
            "absolute inset-0",
            animateIn &&
              "animate-[photo-fade_0.9s_var(--ease-out-quart)_both] motion-reduce:animate-none",
          )}
        >
          <ResponsiveImage asset={item.image} sizes="(min-width: 1024px) 52vw, 100vw" fill />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-black/35 to-transparent"
        />
        <ul className="absolute top-3 left-3 flex flex-wrap gap-1.5 sm:top-5 sm:left-5 sm:gap-2">
          {item.tags.map((tag) => (
            <li key={tag}>
              <Chip tone="light" className="rounded-full">
                {tag}
              </Chip>
            </li>
          ))}
        </ul>
      </div>

      {/* Details. */}
      <div className="flex min-h-0 flex-col justify-between gap-4 px-2 pb-2 sm:px-4 sm:pb-4 lg:px-8 lg:py-6">
        <div className="flex min-h-0 flex-col gap-2.5 sm:gap-3">
          <div
            data-stack-rise
            className={cn(
              "flex items-center justify-between gap-4",
              rise("[animation-delay:40ms]"),
            )}
          >
            <div className="flex flex-wrap items-center gap-3">
              {item.stars ? (
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-body-xs leading-none font-semibold tabular-nums",
                    theme.star,
                  )}
                  aria-label={`${item.stars}-star hotel`}
                >
                  {item.stars}
                  <Icon name="star" className="size-3" />
                </span>
              ) : null}
              <span
                className={cn(
                  "text-body-xs font-semibold tracking-[0.14em] uppercase",
                  theme.muted,
                )}
              >
                {item.tagline}
              </span>
            </div>
            <p className="shrink-0 font-serif text-body-lg leading-none whitespace-nowrap tabular-nums">
              {pad(index + 1)}
              <span className={theme.faint}> / {pad(count)}</span>
            </p>
          </div>
          <h3
            id={`stay-${item.slug}`}
            data-stack-rise
            className={cn(
              "text-[clamp(1.75rem,1.3rem+1.8vw,3rem)] leading-[0.92]",
              rise("[animation-delay:90ms]"),
            )}
          >
            {item.name}
          </h3>
          <p
            data-stack-rise
            className={cn(
              "line-clamp-3 text-body-sm sm:text-body-md",
              theme.muted,
              rise("[animation-delay:140ms]"),
            )}
          >
            {item.description}
          </p>
          {item.amenities.length ? (
            <ul
              data-stack-rise
              aria-label={`${item.name} amenities`}
              className={cn(
                "mt-1 hidden grid-cols-2 gap-x-6 border-t md:grid",
                theme.rule,
                rise("[animation-delay:190ms]"),
              )}
            >
              {item.amenities.map((amenity) => (
                <li
                  key={amenity}
                  className={cn("flex items-center gap-2.5 border-b py-2 text-body-sm", theme.rule)}
                >
                  <Icon
                    name={amenityIcon(amenity)}
                    strokeWidth={1.5}
                    className={cn("size-5 shrink-0", theme.icon)}
                  />
                  <span className="truncate">{amenity}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div
          data-stack-rise
          className={cn(
            "flex flex-wrap items-center justify-between gap-4",
            rise("[animation-delay:240ms]"),
          )}
        >
          {item.price ? <PriceFrom amount={item.price} tone={theme.price} /> : null}
          <Button
            href={item.href}
            variant={theme.button}
            icon="arrow-up-right"
            className="self-auto"
          >
            {ctaLabel}
            <span className="sr-only">: {item.name}</span>
          </Button>
        </div>
      </div>
    </article>
  );
}

type StackingCardsProps = {
  items: StayCardItem[];
  ctaLabel: string;
  /** Accessible name for the list, e.g. "Hotels". */
  label: string;
  className?: string;
};

/** The stacking deck. Wrap it in a `Container`. */
export function StackingCards({ items, ctaLabel, label, className }: StackingCardsProps) {
  const count = items.length;

  const ref = useGsap<HTMLUListElement>(
    ({ scope, reducedMotion }) => {
      if (reducedMotion) return;
      const stack = gsap.utils.toArray<HTMLElement>("[data-stack-item]", scope);
      stack.forEach((item, index) => {
        const card = item.querySelector<HTMLElement>("[data-stack-card]");
        const details = item.querySelectorAll<HTMLElement>("[data-stack-rise]");
        if (!card) return;

        gsap.from(details, {
          y: 20,
          autoAlpha: 0,
          duration: 0.8,
          stagger: 0.06,
          ease: "expo.out",
          scrollTrigger: {
            trigger: item,
            start: "top 92%",
            toggleActions: "play none none reverse",
          },
        });

        // Once the next card starts to cover this one, it eases back into the deck.
        const next = stack[index + 1];
        if (!next) return;
        const stickyTop = (element: HTMLElement) => parseFloat(getComputedStyle(element).top) || 0;
        gsap.fromTo(
          card,
          { scale: 1 },
          {
            scale: 0.95,
            ease: "none",
            scrollTrigger: {
              trigger: next,
              start: () => `top ${stickyTop(item) + card.offsetHeight}px`,
              end: () => `top ${stickyTop(next)}px`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });
    },
    [count],
  );

  return (
    <ul
      ref={ref}
      aria-label={label}
      // The step each card sticks below the one before: the strip of it that stays in view.
      className={cn(
        "flex flex-col gap-6 [--stack-step:0.75rem] sm:gap-8 lg:[--stack-step:1.5rem]",
        className,
      )}
    >
      {items.map((item, index) => (
        <li
          key={item.slug}
          data-stack-item
          className="sticky"
          // Each card sticks a step lower than the one before, so the deck's edges show.
          style={{ top: `calc(var(--header-bar) + 0.75rem + ${index} * var(--stack-step))` }}
        >
          <StayCard
            item={item}
            index={index}
            count={count}
            ctaLabel={ctaLabel}
            theme={STAY_CARD_THEMES[index % STAY_CARD_THEMES.length]}
            stackCard
            className="shadow-[0_-24px_60px_-30px_rgb(0_0_0/0.35)] will-change-transform"
            // Short enough that even the last card, sitting lowest, fits on screen.
            style={{
              height: `min(34rem, calc(100svh - var(--header-bar) - 1.75rem - ${count - 1} * var(--stack-step)))`,
            }}
          />
        </li>
      ))}
    </ul>
  );
}
