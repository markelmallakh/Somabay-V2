"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useState } from "react";
import { easeOutExpo } from "@/components/animations/easing";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { PriceFrom } from "@/components/ui/PriceFrom";
import { StarChip } from "./StarChip";

type BookingBarProps = {
  /** The in-page booking box this bar stands in for once it has scrolled away. */
  targetId: string;
  name: string;
  stars?: number;
  badges: string[];
  price: string;
  href?: string;
};

/**
 * Phones and tablets: once the hotel's booking box has scrolled up out of view, a compact bar
 * slides up at the foot of the screen with the hotel's name, stars and badges, the nightly price
 * and Book now, so booking is always one tap away. It steps aside again over the footer.
 */
export function BookingBar({ targetId, name, stars, badges, price, href }: BookingBarProps) {
  const [passed, setPassed] = useState(false);
  const [atFooter, setAtFooter] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    const footer = document.querySelector("[data-site-footer]");
    const observers: IntersectionObserver[] = [];
    if (target) {
      const observer = new IntersectionObserver(([entry]) =>
        // Shown only after the box has gone off the top (not before it is reached).
        setPassed(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      );
      observer.observe(target);
      observers.push(observer);
    }
    if (footer) {
      const observer = new IntersectionObserver(([entry]) => setAtFooter(entry.isIntersecting));
      observer.observe(footer);
      observers.push(observer);
    }
    return () => observers.forEach((observer) => observer.disconnect());
  }, [targetId]);

  return (
    <AnimatePresence>
      {passed && !atFooter ? (
        <m.div
          key="booking-bar"
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          exit={{ y: "110%" }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
          className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white px-gutter py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgb(15_30_53/0.1)] lg:hidden"
        >
          {/* Name, stars and badges on the left; the price on one line over Book now on the
              right, so the bar stays slim. */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate font-serif text-body-md leading-tight">{name}</p>
                {stars ? (
                  <StarChip
                    count={stars}
                    className="shrink-0 px-1.5 py-0.5 text-[0.625rem] [&_svg]:size-2.5"
                  />
                ) : null}
              </div>
              {badges.length ? (
                <ul className="flex min-w-0 gap-1 overflow-hidden">
                  {badges.slice(0, 2).map((badge) => (
                    <li key={badge}>
                      <Chip className="px-1.5 py-0.5 text-[0.5625rem]">{badge}</Chip>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <PriceFrom amount={price} size="line" />
              {href ? (
                <Button
                  href={href}
                  external
                  variant="primary"
                  icon="arrow-up-right"
                  className="self-auto"
                >
                  Book now
                </Button>
              ) : null}
            </div>
          </div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
