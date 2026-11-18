"use client";

import { type RefObject, useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

/** Tracks whether a horizontal scroller can move back or forward, and pages it smoothly. */
export function useScroller(ref: RefObject<HTMLElement | null>) {
  const [state, setState] = useState({ canBack: false, canForward: false, progress: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => {
      const max = element.scrollWidth - element.clientWidth;
      setState({
        canBack: element.scrollLeft > 4,
        canForward: element.scrollLeft < max - 4,
        progress: max > 0 ? element.scrollLeft / max : 0,
      });
    };
    update();
    element.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      element.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [ref]);

  const page = useCallback(
    (direction: 1 | -1) => {
      const element = ref.current;
      if (!element) return;
      element.scrollBy({ left: direction * element.clientWidth * 0.8, behavior: "smooth" });
    },
    [ref],
  );

  return { ...state, page };
}

type CarouselArrowsProps = {
  canBack: boolean;
  canForward: boolean;
  onPage: (direction: 1 | -1) => void;
  /** What the carousel holds, for the button labels ("Previous hotels"). */
  label: string;
  /** `light` on white/sand, `dark` on photos and dark sections. */
  tone?: "light" | "dark";
  className?: string;
};

/** Previous / next round buttons for long carousels; hidden when everything already fits. */
export function CarouselArrows({
  canBack,
  canForward,
  onPage,
  label,
  tone = "light",
  className,
}: CarouselArrowsProps) {
  if (!canBack && !canForward) return null;
  const button = cn(
    "grid size-13 place-items-center rounded-full border transition-[background-color,border-color,color,opacity] duration-500 ease-out-expo disabled:pointer-events-none disabled:opacity-35",
    tone === "light"
      ? "border-ink/15 text-ink hover:border-aqua hover:bg-aqua hover:text-white"
      : "border-white/40 text-white hover:border-aqua hover:bg-aqua hover:text-white",
  );
  return (
    // Phones swipe (the next card peeks in), so the arrows only show from `md`.
    <div className={cn("hidden gap-3 md:flex", className)}>
      <button
        type="button"
        className={button}
        disabled={!canBack}
        onClick={() => onPage(-1)}
        aria-label={`Previous ${label}`}
      >
        <Icon name="chevron-left" className="size-5" />
      </button>
      <button
        type="button"
        className={button}
        disabled={!canForward}
        onClick={() => onPage(1)}
        aria-label={`Next ${label}`}
      >
        <Icon name="chevron-right" className="size-5" />
      </button>
    </div>
  );
}
