"use client";

import { AnimatePresence, m, useDragControls } from "framer-motion";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { getLenis } from "@/components/animations/SmoothScroll";
import { easeInOutQuart } from "@/components/animations/easing";

import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

/** Brand orange and turquoise layers that lead the drawer panel in (React Bits "staggered menu"). */
const DRAWER_LAYERS = ["#00b2ba", "#082e30"];
const easeInCubic = [0.55, 0, 1, 0.45] as const;
/** Small head start so the native dialog is open before the sweep begins. */
const LEAD = 0.05;
/** One width for every side drawer on the site. */
const DRAWER_WIDTH = "max-w-[42.5rem]";
/** Below this width drawers open as bottom sheets. */
const SHEET_QUERY = "(max-width: 767px)";

/** Phones: the drawer is a bottom sheet (decided when it opens). */
function useSheet(open: boolean) {
  const [sheet, setSheet] = useState(false);
  useEffect(() => {
    if (!open) return;
    const query = window.matchMedia(SHEET_QUERY);
    const update = () => setSheet(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [open]);
  return sheet;
}

type DialogProps = {
  open: boolean;
  onClose: () => void;
  /** Accessible name for the dialog. */
  label: string;
  children: ReactNode;
  className?: string;
  /**
   * `fade` full-screen overlay, `rise` centred panel, `drawer` panel sliding in from the right
   * behind two staggered colour layers, over a dimmed backdrop (click outside to close). Mark
   * drawer content with `data-drawer-item` (and `--i` for its order) to stagger it in.
   */
  variant?: "fade" | "rise" | "drawer";
  /** Drawer only: a different width (a `max-w-*` class) than the site's standard drawer. */
  drawerWidth?: string;
  /**
   * Drawer only: controls placed just outside the panel, beside its left edge (e.g. previous /
   * next). Position them inside this box, which spans the panel's height.
   */
  outside?: ReactNode;
};

/**
 * Modal built on the native `<dialog>` element, which provides focus trapping, `Esc` handling
 * and an inert background for free. Framer Motion handles the enter/exit transition; the
 * element is only closed once the exit animation has finished. Mark the element that should
 * receive focus on open with `data-autofocus`.
 */
export function Dialog({
  open,
  onClose,
  label,
  children,
  className,
  variant = "fade",
  drawerWidth = DRAWER_WIDTH,
  outside,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const sheet = useSheet(open && variant === "drawer");
  const drag = useDragControls();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    if (!dialog.open) dialog.showModal();
    // Native dialogs focus their first focusable element; honour an explicit target instead.
    // preventScroll: the drawer's close button starts off-screen mid-sweep, and focusing it
    // would otherwise scroll the whole dialog sideways.
    dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus({ preventScroll: true });
    const lenis = getLenis();
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  // When the page is hidden or left mid-animation (Next keeps a visited page alive but hidden, so
  // the exit animation never finishes), close the native dialog outright; otherwise an empty,
  // invisible dialog stays open and blocks clicks when the visitor comes back.
  useEffect(() => {
    const dialog = ref.current;
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      className={cn(
        "m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-transparent",
        variant === "drawer" && "overflow-hidden",
      )}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <AnimatePresence onExitComplete={() => ref.current?.close()}>
        {open && variant === "drawer" ? (
          <m.div
            key="drawer"
            className="relative size-full overflow-hidden"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <m.button
              type="button"
              tabIndex={-1}
              aria-hidden
              onClick={onClose}
              className="absolute inset-0 size-full cursor-default bg-abyss/55 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.35, delay: 0.1 } }}
              transition={{ duration: 0.5 }}
            />
            {/* Staggered colour layers sweep in ahead of the panel (brand orange, then turquoise).
                Desktop only: a bottom sheet rises on its own. */}
            {DRAWER_LAYERS.map((color, index) => (
              <m.div
                key={color}
                aria-hidden
                className={cn(
                  "drawer-sweep absolute inset-y-0 right-0 hidden w-full md:block",
                  drawerWidth,
                )}
                style={{
                  backgroundColor: color,
                  animationDelay: `${LEAD + index * 0.07}s`,
                  animationDuration: "0.5s",
                }}
                exit={{ x: "100%", transition: { duration: 0.32, ease: easeInCubic } }}
              />
            ))}
            {/* Phones: a bottom sheet as tall as its content (up to 90% of the screen) that rises
                from the foot, with a grab bar to drag it down and away. Desktop: the side panel. */}
            <m.div
              data-lenis-prevent
              className={cn(
                "drawer-sweep absolute inset-x-0 bottom-0 flex max-h-[90svh] w-full flex-col overflow-hidden rounded-t-md bg-sand-50 shadow-soft",
                "md:inset-x-auto md:inset-y-0 md:right-0 md:block md:max-h-none md:overflow-y-auto md:rounded-none",
                drawerWidth,
                className,
              )}
              style={{
                animationDelay: sheet
                  ? `${LEAD}s`
                  : `${LEAD + (DRAWER_LAYERS.length - 1) * 0.07 + 0.08}s`,
                animationDuration: sheet ? "0.6s" : "0.65s",
              }}
              drag={sheet ? "y" : false}
              dragListener={false}
              dragControls={drag}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.9 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 120 || info.velocity.y > 600) onClose();
              }}
              exit={
                sheet
                  ? { y: "100%", transition: { duration: 0.38, ease: easeInCubic } }
                  : { x: "100%", transition: { duration: 0.32, ease: easeInCubic } }
              }
            >
              <div
                aria-hidden
                onPointerDown={(event) => drag.start(event)}
                className="flex h-6 shrink-0 cursor-grab touch-none items-center justify-center md:hidden"
              >
                <span className="h-1 w-10 rounded-full bg-ink/20" />
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain md:contents">
                {children}
              </div>
            </m.div>
            {/* Outside the panel's left edge: the close X at the top and any controls (e.g.
                previous / next) at the foot, in one column. Phones keep the panel's own close. */}
            <m.div
              className={cn(
                "pointer-events-none absolute inset-y-0 right-0 hidden w-full md:block",
                drawerWidth,
              )}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.55 } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                data-autofocus
                className="pointer-events-auto absolute top-6 right-full mr-4 grid size-12 place-items-center text-white opacity-80 transition-opacity duration-300 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-white"
              >
                <Icon name="close" className="size-7" />
              </button>
              {outside ? (
                <div className="pointer-events-auto absolute right-full bottom-6 mr-4">
                  {outside}
                </div>
              ) : null}
            </m.div>
          </m.div>
        ) : open ? (
          <m.div
            key="dialog"
            className={cn("size-full", className)}
            initial={variant === "fade" ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: variant === "fade" ? 0 : 12, transition: { duration: 0.45 } }}
            transition={{ duration: 0.75, ease: easeInOutQuart }}
          >
            {children}
          </m.div>
        ) : null}
      </AnimatePresence>
    </dialog>
  );
}
