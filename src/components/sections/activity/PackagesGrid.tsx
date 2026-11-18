"use client";

import { m, type Variants } from "framer-motion";
import { type ReactNode, useState } from "react";
import type { DirectoryItem } from "@/types/content";
import type { ImageAsset } from "@/types/media";
import { DetailDrawer } from "@/components/directory/DetailDrawer";
import { easeOutExpo } from "@/components/animations/easing";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { DragRow } from "@/components/ui/DragRow";
import { Icon } from "@/components/ui/Icon";

type Package = {
  id: string;
  title: string;
  description: string;
  image: ImageAsset;
  /** An outside page, opened in a new tab. Without one, the card opens a side drawer. */
  href?: string;
};

const ease = "duration-700 ease-out-expo";

/** Each card rises in after the one before it, once the row is in view. */
const card: Variants = {
  hidden: { opacity: 0, y: 60 },
  shown: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1.1, ease: easeOutExpo, delay: index * 0.12 },
  }),
};

/** The photo wipes up while settling from a zoom. */
const photo: Variants = {
  hidden: { clipPath: "inset(100% 0% 0% 0%)", scale: 1.25 },
  shown: (index: number) => ({
    clipPath: "inset(0% 0% 0% 0%)",
    scale: 1,
    transition: { duration: 1.4, ease: easeOutExpo, delay: 0.15 + index * 0.12 },
  }),
};

/**
 * The Cascades packages as a compact, draggable slider, styled like the sports and hotel cards:
 * the photo fills the card with the name on its shaded foot; on hover (or focus) the photo pulls
 * up into a rounded frame and a white panel beneath it shows the name, description and an arrow.
 * Touch screens, which cannot hover, show the panel from the start. A card with an outside link
 * opens it in a new tab (and shows an arrow); any other card opens a side drawer, like the venues.
 */
export function PackagesGrid({
  packages,
  label = "Packages",
}: {
  packages: Package[];
  label?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  // Cards without an outside link open a drawer with the photo, the line and a Book button.
  const drawerPackages = packages.filter((pack) => !isExternal(pack.href));
  const drawerItems: DirectoryItem[] = drawerPackages.map((pack) => ({
    id: pack.id,
    title: pack.title,
    chip: label,
    description: pack.description,
    images: [pack.image],
    action: { label: "Book now", href: "#booking" },
  }));

  return (
    // The whole row triggers the entrance (cards past the right edge are never "in view" alone,
    // so watching each card would leave them hidden).
    <m.div
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.25 }}
      data-no-motion=""
    >
      <DragRow
        label={label}
        tone="dark"
        phoneCards="half"
        // Phones: about two and a quarter cards to a screen.
        className="mt-6 max-md:[--swipe-card:40vw] sm:mt-10 lg:mt-12"
      >
        {packages.map((pack, index) => {
          const external = isExternal(pack.href);
          const drawerIndex = drawerPackages.indexOf(pack);
          return (
            <m.li
              key={pack.id}
              custom={index}
              variants={card}
              className="shrink-0 md:w-[min(80vw,20rem)] md:snap-start lg:w-[calc((100%-3rem)/4)]"
            >
              <Card
                href={external ? pack.href : undefined}
                title={pack.title}
                onOpen={() => setOpen(drawerIndex)}
              >
                {/* The photo: the whole card at rest, a rounded frame above the panel when open. */}
                <span
                  className={`absolute inset-0 overflow-hidden transition-[clip-path] [clip-path:inset(0_0_0_0_round_0.25rem)] ${ease} group-hover:[clip-path:inset(0_0_40%_0_round_0.25rem_0.25rem_0_0)] group-focus-visible:[clip-path:inset(0_0_40%_0_round_0.25rem_0.25rem_0_0)] max-sm:[clip-path:inset(0_0_0_0_round_0.25rem)]! [@media(hover:none)]:[clip-path:inset(0_0_40%_0_round_0.25rem_0.25rem_0_0)]`}
                >
                  <span
                    className={`absolute inset-0 transition-transform ${ease} group-hover:-translate-y-[16%] group-focus-visible:-translate-y-[16%] max-sm:translate-y-0! [@media(hover:none)]:-translate-y-[16%]`}
                  >
                    <m.span custom={index} variants={photo} className="absolute inset-0 block">
                      <ResponsiveImage
                        asset={pack.image}
                        sizes="(max-width: 639px) 40vw, 20rem"
                        fill
                      />
                    </m.span>
                  </span>
                  <span
                    aria-hidden
                    className={`absolute inset-0 bg-[linear-gradient(to_bottom,rgb(0_0_0/0)_45%,rgb(0_0_0/0.65)_100%)] transition-opacity max-sm:bg-[linear-gradient(to_bottom,rgb(0_0_0/0)_30%,rgb(0_0_0/0.85)_100%)] max-sm:opacity-100! ${ease} group-hover:opacity-0 group-focus-visible:opacity-0 [@media(hover:none)]:opacity-0`}
                  />
                </span>

                {/* Phones: the outside-link arrow in the card's top-right corner. */}
                {external ? (
                  <span
                    aria-hidden
                    className="absolute top-3 right-3 grid size-7 place-items-center rounded-full bg-deep text-white sm:hidden"
                  >
                    <Icon name="arrow-up-right" className="size-3.5" />
                  </span>
                ) : null}

                {/* At rest: the name on the photo. Phones (no hover) keep it there, with the
                    description, instead of opening the white panel. */}
                <span
                  aria-hidden
                  className={`absolute inset-x-3 bottom-3 flex flex-col gap-1 text-white transition-[opacity,translate] max-sm:translate-y-0! max-sm:opacity-100! sm:inset-x-5 sm:bottom-5 ${ease} group-hover:translate-y-3 group-hover:opacity-0 group-focus-visible:translate-y-3 group-focus-visible:opacity-0 [@media(hover:none)]:opacity-0`}
                >
                  <span className="font-serif text-body-md leading-[1.15] sm:text-heading-5">
                    {pack.title}
                  </span>
                  <span className="line-clamp-2 text-[0.6875rem] leading-snug text-white/80 sm:hidden">
                    {pack.description}
                  </span>
                </span>

                {/* Open: the white panel with the name, description and (for outside links) an arrow. */}
                <span
                  className={`absolute inset-x-0 bottom-0 flex h-[40%] translate-y-4 flex-col justify-center gap-2 px-5 pb-1 opacity-0 transition-[opacity,translate] max-sm:hidden ${ease} group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100`}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="font-serif text-heading-6 leading-[1.2] text-ink">
                      {pack.title}
                    </span>
                    {/* The arrow only on cards that open an outside site. */}
                    {external ? (
                      <span
                        aria-hidden
                        className="grid size-8 shrink-0 place-items-center rounded-full bg-deep text-white"
                      >
                        <Icon name="arrow-up-right" className="size-4" />
                      </span>
                    ) : null}
                  </span>
                  <span className="line-clamp-3 text-body-sm text-slate">{pack.description}</span>
                </span>
              </Card>
            </m.li>
          );
        })}
      </DragRow>
      <DetailDrawer
        items={drawerItems}
        index={open}
        onClose={() => setOpen(null)}
        onNavigate={setOpen}
      />
    </m.div>
  );
}

const isExternal = (href?: string) => Boolean(href && /^https?:/.test(href));

const cardClass =
  "group relative block aspect-[4/5] w-full overflow-hidden rounded-md bg-white text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

/** The card itself: a link to an outside page in a new tab, or a button opening the drawer. */
function Card({
  href,
  title,
  onOpen,
  children,
  className = cardClass,
}: {
  href?: string;
  title: string;
  onOpen: () => void;
  children: ReactNode;
  className?: string;
}) {
  return href ? (
    <a
      href={href}
      data-no-touch-hover
      target="_blank"
      rel="noopener noreferrer"
      draggable={false}
      className={className}
    >
      <span className="sr-only"> (opens in a new tab)</span>
      {children}
    </a>
  ) : (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${title}: details`}
      data-no-touch-hover
      className={className}
    >
      {children}
    </button>
  );
}
