"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import type { Leader } from "@/content/about";
import { cn } from "@/lib/utils";
import { DragRow } from "@/components/ui/DragRow";
import { Dialog } from "@/components/ui/Dialog";
import { DrawerSteppers } from "@/components/ui/DrawerSteppers";
import { Icon } from "@/components/ui/Icon";
import { CardActionBar } from "@/components/ui/PhotoCard";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";

/** Monogram letters, ignoring honorifics such as "Mr.". */
const initials = (name: string) =>
  name
    .split(" ")
    .filter((part) => !/^(mr|mrs|ms|dr)\.?$/i.test(part))
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

const stagger = (index: number) => ({ "--i": index }) as CSSProperties;

/**
 * Leadership as a carousel of equal portrait cards with tight gaps and small corners, dragged or
 * stepped with the arrows under it. Every card carries the experiences cards' hover (its
 * "Read bio" bar flooding turquoise) and opens a side drawer with the full biography. Until
 * portraits are supplied, a card shows a turquoise field with the person's initials.
 */
export function LeadershipGrid({
  leaders,
  fit = false,
  label = "Leadership team",
}: {
  leaders: Leader[];
  /** Share the full row width between the cards on large screens (for a short list). */
  fit?: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <DragRow label={label} className="gap-2" phoneCards="half">
        {leaders.map((leader, index) => (
          <li
            key={leader.name}
            className={cn(
              "shrink-0 md:w-[22rem]",
              fit && "lg:w-[calc((100%-(var(--n)-1)*0.5rem)/var(--n))]",
            )}
            style={fit ? ({ "--n": leaders.length } as CSSProperties) : undefined}
          >
            <button
              type="button"
              onClick={() => setOpen(index)}
              aria-label={`${leader.name}, ${leader.role}: read biography`}
              className="group relative isolate flex aspect-[4/5] w-full flex-col justify-end overflow-hidden rounded-md text-left text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquoise"
            >
              {leader.portrait ? (
                <ResponsiveImage
                  asset={leader.portrait}
                  sizes={
                    fit
                      ? "(min-width: 1024px) 31vw, (min-width: 768px) 22rem, 78vw"
                      : "(min-width: 768px) 22rem, 78vw"
                  }
                  fill
                  className="-z-10 transition-transform duration-[1600ms] ease-out-expo group-hover:scale-[1.05]"
                />
              ) : (
                <span
                  aria-hidden
                  className="absolute inset-0 -z-10 grid place-items-center bg-[linear-gradient(160deg,var(--color-turquoise)_0%,var(--color-turquoise-160)_100%)] font-serif text-[clamp(4rem,3rem+4vw,7rem)] text-white/15 transition-transform duration-[1600ms] ease-out-expo group-hover:scale-[1.05]"
                >
                  {initials(leader.name)}
                </span>
              )}
              <span
                aria-hidden
                className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(0_0_0/0)_40%,rgb(0_0_0/0.25)_65%,rgb(0_0_0/0.7)_100%)]"
              />
              <span className="flex flex-col gap-1 px-4 pb-3.5 sm:px-5 sm:pb-4">
                <span className="font-serif text-heading-6 leading-tight">{leader.name}</span>
                <span className="text-body-sm text-white/75">{leader.role}</span>
              </span>
              <CardActionBar label="Read bio" className="px-4 py-3 sm:px-5 sm:py-3.5" />
            </button>
          </li>
        ))}
      </DragRow>

      <LeaderDrawer
        leaders={leaders}
        index={open}
        onClose={() => setOpen(null)}
        onNavigate={setOpen}
      />
    </>
  );
}

/**
 * Biography drawer, wide and split: the role tag, name and full bio on the left (scrolling), the
 * portrait at full height on the right. Previous / next sit stacked just outside the drawer's
 * bottom-left corner, as plain arrows.
 */
function LeaderDrawer({
  leaders: people,
  index,
  onClose,
  onNavigate,
}: {
  leaders: Leader[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const leader = index === null ? null : people[index];
  const count = people.length;
  const position = index ?? 0;
  const [lead, ...rest] = leader?.bio ?? [];

  return (
    <Dialog
      open={leader !== null}
      onClose={onClose}
      label={leader ? `${leader.name}, ${leader.role}` : "Biography"}
      variant="drawer"
      drawerWidth="max-w-[68rem]"
      outside={
        <DrawerSteppers
          position={position}
          count={count}
          onNavigate={onNavigate}
          noun="team member"
        />
      }
    >
      {leader ? (
        <article
          key={leader.name}
          className="grid min-h-full md:h-full md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]"
        >
          {/* The portrait, full height on the right (on top on small screens). */}
          <div
            data-drawer-item
            style={stagger(0)}
            className="relative order-first aspect-[4/5] bg-turquoise-10 md:order-last md:aspect-auto md:h-full"
          >
            {leader.portrait ? (
              <ResponsiveImage
                asset={leader.portrait}
                sizes="(min-width: 768px) 30rem, 100vw"
                quality={85}
                fill
              />
            ) : (
              <span
                aria-hidden
                className="absolute inset-0 grid place-items-center font-serif text-[6rem] text-turquoise/40"
              >
                {initials(leader.name)}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="wave absolute top-5 right-5 z-20 grid size-12 place-items-center rounded-md bg-white text-ink shadow-[0_8px_24px_rgb(15_30_53/0.12)] transition-colors duration-500 hover:text-white md:hidden"
              aria-label="Close"
            >
              <Icon name="close" className="size-5" />
            </button>
          </div>

          {/* Role, name and biography. */}
          <div
            className="flex flex-col gap-5 px-gutter py-8 md:gap-6 md:overflow-y-auto md:px-12 md:py-16"
            data-lenis-prevent
          >
            <p
              data-drawer-item
              style={stagger(1)}
              className="w-fit rounded-md border border-ink/15 px-3 py-1.5 text-label font-semibold tracking-[0.14em] text-ink uppercase"
            >
              {leader.role}
            </p>
            <h2 data-drawer-item style={stagger(2)} className="font-serif text-heading-2">
              {leader.name}
            </h2>
            {lead ? (
              <p
                data-drawer-item
                style={stagger(3)}
                className="mt-2 text-body-md leading-relaxed text-slate"
              >
                {lead}
              </p>
            ) : null}
            {rest.map((paragraph, offset) => (
              <p
                key={offset}
                data-drawer-item
                style={stagger(4 + offset)}
                className="text-body-md leading-relaxed text-slate"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      ) : null}
    </Dialog>
  );
}
