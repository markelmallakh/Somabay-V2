"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useRef } from "react";
import type { ImageAsset } from "@/types/media";
import { easeOutExpo } from "@/components/animations/easing";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { ResponsiveImage } from "./ResponsiveImage";

type PhotoLightboxProps = {
  images: ImageAsset[];
  label: string;
  /** The photo on show, or null when closed. */
  open: number | null;
  onChange: (index: number) => void;
  onClose: () => void;
};

/**
 * Full-screen photo viewer on near-black: the photo as large as the screen allows, previous/next
 * looping round, and every photo as a thumbnail beside it (the current one outlined in
 * turquoise). A click on the black space closes it.
 */
export function PhotoLightbox({ images, label, open, onChange, onClose }: PhotoLightboxProps) {
  const strip = useRef<HTMLUListElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);

  // A click on the black space around the photo (not the photo or the controls) closes it.
  useEffect(() => {
    const element = backdrop.current;
    if (open === null || !element) return;
    const onClick = (event: MouseEvent) => {
      if ((event.target as HTMLElement).hasAttribute("data-backdrop")) onClose();
    };
    element.addEventListener("click", onClick);
    return () => element.removeEventListener("click", onClick);
  }, [open, onClose]);

  // Keep the current thumbnail in view as the photos step on.
  useEffect(() => {
    strip.current
      ?.querySelector<HTMLElement>("[data-current]")
      ?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [open]);

  return (
    <Dialog
      open={open !== null}
      onClose={onClose}
      label={`${label} photos`}
      className="bg-black/95"
    >
      {/* The photo as large as the screen allows; along the foot, within the page padding, the
          thumbnails on the left and the count with the arrows on the right. */}
      <div
        ref={backdrop}
        data-backdrop
        className="relative flex h-full flex-col pt-16 pb-6 md:pb-8"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 grid size-12 place-items-center text-white md:top-6 md:right-6"
          aria-label="Close photos"
          data-autofocus
        >
          <Icon name="close" className="size-8 stroke-1" />
        </button>
        <div data-backdrop className="relative mx-auto min-h-0 w-full max-w-site flex-1 px-gutter">
          <div data-backdrop className="relative size-full">
            <AnimatePresence initial={false}>
              {open !== null ? (
                <m.div
                  key={open}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: easeOutExpo }}
                >
                  <ResponsiveImage
                    asset={images[open]}
                    sizes="90vw"
                    fill
                    className="object-contain"
                  />
                </m.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        <div className="mx-auto mt-6 flex w-full max-w-site items-center gap-6 px-gutter text-white md:mt-8 md:gap-10">
          {/* Every photo as a thumbnail; the current one is outlined in turquoise. */}
          <ul
            ref={strip}
            aria-label="All photos"
            data-no-motion
            className="scrollbar-none flex min-w-0 flex-1 gap-2.5 overflow-x-auto p-1.5"
          >
            {images.map((image, index) => {
              const current = index === open;
              return (
                <li key={`${image.src}-${index}`} className="shrink-0">
                  <button
                    type="button"
                    data-current={current || undefined}
                    onClick={() => onChange(index)}
                    aria-label={`Show photo ${index + 1} of ${images.length}`}
                    aria-current={current ? "true" : undefined}
                    className={cn(
                      "relative block size-14 transition-opacity duration-300 md:size-16",
                      current ? "opacity-100" : "opacity-50 hover:opacity-90",
                    )}
                  >
                    {/* Clipped with a clip-path so the photo's corners never bleed past the
                        frame; the current one's ring sits just outside it. */}
                    <span className="absolute inset-0 [clip-path:inset(0_round_0.25rem)]">
                      <ResponsiveImage asset={image} sizes="64px" fill />
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "pointer-events-none absolute -inset-1 rounded-md border-2 transition-colors duration-300",
                        current ? "border-deep" : "border-transparent",
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="flex shrink-0 items-center gap-4 md:gap-6">
            <p className="text-body-sm tabular-nums" aria-live="polite">
              {String((open ?? 0) + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="grid size-12 place-items-center rounded-full border border-white/40 [--wave:#fff] hover:text-ink"
                onClick={() => onChange(((open ?? 0) - 1 + images.length) % images.length)}
                aria-label="Previous photo"
              >
                <Icon name="chevron-left" className="size-4.5" />
              </button>
              <button
                type="button"
                className="grid size-12 place-items-center rounded-full border border-white/40 [--wave:#fff] hover:text-ink"
                onClick={() => onChange(((open ?? 0) + 1) % images.length)}
                aria-label="Next photo"
              >
                <Icon name="chevron-right" className="size-4.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
