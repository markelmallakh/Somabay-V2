"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getLenis } from "@/components/animations/SmoothScroll";
import type { ContactCard, ContactGroup, ContactLine } from "@/content/contact";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/animations/Reveal";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/** Every tile and photo shares one size (phones: tiles fit their content). */
const CELL = "rounded-md sm:h-[14.5rem]";

/** A rounded pill for one way in: a small solid icon and the number, address or link. */
function ActionPill({ action }: { action: ContactLine }) {
  const className =
    "inline-flex min-h-10 max-w-full items-center sm:min-h-8 gap-1.5 rounded-full border border-ink/15 px-3 text-body-xs text-ink transition-[border-color,color] duration-500 ease-out-expo hover:border-deep hover:text-turquoise-160";
  const content = (
    <>
      <Icon name={action.icon} className="size-3 shrink-0 text-turquoise" />
      <span className="truncate">{action.label}</span>
    </>
  );
  if (action.href.startsWith("/")) {
    return (
      <Link href={action.href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <a
      href={action.href}
      {...(action.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={className}
    >
      {content}
    </a>
  );
}

/** A flat white tile: the title and its line at the top, the ways in at the bottom. */
function Tile({ card }: { card: ContactCard }) {
  return (
    <div className={cn(CELL, "flex flex-col justify-between gap-4 bg-white p-4 text-ink sm:p-6")}>
      {/* The title with its line (and any hours) directly under it; the ways in at the foot. */}
      <div className="flex flex-col gap-1">
        <h4 className="mb-1 font-serif text-heading-6">{card.title}</h4>
        <p className="max-w-xs text-body-sm text-ink/80">{card.text}</p>
        {card.note ? <p className="text-body-xs text-slate">{card.note}</p> : null}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {card.actions.map((action) => (
          <ActionPill key={action.href} action={action} />
        ))}
      </div>
    </div>
  );
}

const groupId = (id: string) => `contacts-${id}`;

/**
 * "Reach the Right Team": a centred title, then each group under
 * its own title as equal white tiles with photos set between them. While the list scrolls past, a
 * bar along the foot of the screen (the neighborhood pages' section bar, without a logo) links to
 * each group, the one in view marked in turquoise. Each tab scrolls to its group.
 */
export function ContactDirectory({ groups }: { groups: ContactGroup[] }) {
  const [shown, setShown] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const height = window.innerHeight;
      const box = list.current?.getBoundingClientRect();
      // Shown while the list fills the screen: its top has risen past the middle and its end
      // hasn't yet left the lower part of the screen.
      setShown(!!box && box.top < height * 0.5 && box.bottom > height * 0.6);
      let current: string | null = null;
      for (const group of groups) {
        const top = document.getElementById(groupId(group.id))?.getBoundingClientRect().top;
        if (top !== undefined && top <= height * 0.4) current = group.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [groups]);

  const go = (id: string) => {
    const target = document.getElementById(groupId(id));
    if (!target) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(target, { offset: -140, duration: 1.2 });
    else
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - 140,
        behavior: "smooth",
      });
  };

  return (
    <section aria-labelledby="directory-title" className="bg-sand-100 py-section text-ink">
      <Container>
        <Reveal className="flex flex-col items-center gap-3 text-center sm:gap-4">
          <h2 id="directory-title" className="text-heading-2">
            Reach the Right Team
          </h2>
          <p className="max-w-md text-body-md text-slate">
            Every team and hotel in one place, so you reach the people who handle it directly.
          </p>
        </Reveal>
        <div ref={list} className="mt-6 flex flex-col gap-8 sm:mt-8 sm:gap-10">
          {groups.map((group) => (
            <div key={group.id} id={groupId(group.id)} className="flex flex-col gap-3">
              <h3 className="flex items-center gap-2.5 font-serif text-heading-5">
                <span aria-hidden className="size-2 rounded-full bg-deep" />
                {group.title}
              </h3>
              <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item, index) =>
                  item.kind === "card" ? (
                    <Tile key={item.title} card={item} />
                  ) : (
                    <div
                      key={index}
                      // Phones: the photos between the tiles are left out, so the directory stays a
                      // short list of teams.
                      className={cn(
                        CELL,
                        "relative hidden overflow-hidden sm:block",
                        item.wide && "lg:col-span-2",
                      )}
                    >
                      <ResponsiveImage
                        asset={item.image}
                        sizes={
                          item.wide
                            ? "(min-width: 1024px) 66vw, (min-width: 640px) 50vw, 100vw"
                            : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        }
                        fill
                      />
                    </div>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* The groups, along the foot of the screen while the list scrolls past. */}
      <nav
        aria-label="Contact groups"
        inert={!shown}
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl transition-transform duration-700 ease-out-expo",
          shown ? "translate-y-0" : "translate-y-full",
        )}
      >
        <ul className="mx-auto scrollbar-none flex h-12 max-w-site items-stretch justify-start gap-6 overflow-x-auto px-gutter sm:justify-center sm:gap-8">
          {groups.map((group) => {
            const on = group.id === active;
            return (
              <li key={group.id} className="flex">
                <button
                  type="button"
                  onClick={() => go(group.id)}
                  aria-current={on ? "true" : undefined}
                  className={cn(
                    "relative flex cursor-pointer items-center text-body-xs font-semibold tracking-label whitespace-nowrap uppercase transition-colors duration-500",
                    on ? "text-turquoise" : "text-slate hover:text-ink",
                  )}
                >
                  {group.title}
                  {/* A turquoise line along the top edge marks the group in view. */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-0 -top-px h-0.5 origin-left bg-deep transition-transform duration-500 ease-out-expo",
                      on ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </section>
  );
}
