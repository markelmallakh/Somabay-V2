"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

/** Phones only: from `sm` up the plan fits its frame and stays still, as it always has. */
const PHONE = "(max-width: 639px)";
const MAX_ZOOM = 4;

type PanZoomProps = {
  /** The plan's own width / height. Its pins are placed by percentage inside it. */
  aspect: number;
  /** Where the plan opens on phones, as a share of its width (0.5 = centred). */
  focusX?: number;
  /** Classes for the frame (its size, corners, background). */
  className?: string;
  /** Accessible name for the zoom controls ("masterplan"). */
  label: string;
  children: ReactNode;
};

type View = { x: number; y: number; s: number };

/**
 * A plan you can explore with your fingers on a phone: drag with one finger, pinch with two,
 * double-tap to zoom in (or back out), and it glides a little on release. The plan keeps its true
 * proportions (so pins placed by percentage stay on their places), opens filling the frame, and
 * can never be dragged out of view; − zooms back out. Pins inside can stay the same size while zooming by using
 * `scale: calc(1 / var(--plan-zoom))` (the `pz-counter` class). A drag never counts as a tap on a pin.
 * Larger screens get the plan fitted to the frame with no gestures, exactly as before.
 */
export function PanZoom({ aspect, focusX = 0.5, className, label, children }: PanZoomProps) {
  const frame = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const view = useRef<View>({ x: 0, y: 0, s: 1 });
  const size = useRef({ fw: 0, fh: 0, w: 0, h: 0 });
  const [phone, setPhone] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  /** Keep the plan covering the frame: no gaps at any edge. */
  const clamp = useCallback((next: View): View => {
    const { fw, fh, w, h } = size.current;
    const s = Math.min(MAX_ZOOM, Math.max(1, next.s));
    return {
      s,
      x: Math.min(0, Math.max(fw - w * s, next.x)),
      y: Math.min(0, Math.max(fh - h * s, next.y)),
    };
  }, []);

  const apply = useCallback(
    (next: View, animate = false) => {
      const element = content.current;
      if (!element) return;
      view.current = clamp(next);
      const { x, y, s } = view.current;
      element.style.transition = animate ? "transform 0.45s cubic-bezier(0.19, 1, 0.22, 1)" : "";
      element.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
      element.style.setProperty("--plan-zoom", String(s));
      setZoomed(s > 1.02);
    },
    [clamp],
  );

  /** Zoom to `s`, keeping the frame point (px, py) still. */
  const zoomAt = useCallback(
    (s: number, px: number, py: number, animate = true) => {
      const current = view.current;
      const k = Math.min(MAX_ZOOM, Math.max(1, s)) / current.s;
      apply(
        { s: current.s * k, x: px - (px - current.x) * k, y: py - (py - current.y) * k },
        animate,
      );
    },
    [apply],
  );

  // Size the plan to cover the frame (phones), or to fit it exactly (larger screens).
  useEffect(() => {
    const element = frame.current;
    const inner = content.current;
    if (!element || !inner) return;
    const query = window.matchMedia(PHONE);
    const layout = () => {
      const isPhone = query.matches;
      setPhone(isPhone);
      const fw = element.clientWidth;
      const fh = element.clientHeight;
      if (!isPhone) {
        inner.style.cssText = "";
        view.current = { x: 0, y: 0, s: 1 };
        setZoomed(false);
        return;
      }
      const w = Math.max(fw, fh * aspect);
      const h = w / aspect;
      size.current = { fw, fh, w, h };
      inner.style.width = `${w}px`;
      inner.style.height = `${h}px`;
      apply({ s: 1, x: fw / 2 - w * focusX, y: (fh - h) / 2 });
    };
    layout();
    const observer = new ResizeObserver(layout);
    observer.observe(element);
    query.addEventListener("change", layout);
    return () => {
      observer.disconnect();
      query.removeEventListener("change", layout);
    };
  }, [aspect, focusX, apply]);

  // Gestures (phones only).
  useEffect(() => {
    const element = frame.current;
    if (!element || !phone) return;
    const pointers = new Map<number, { x: number; y: number }>();
    let start: { view: View; mid: { x: number; y: number }; distance: number } | null = null;
    let moved = 0;
    let velocity = { x: 0, y: 0 };
    let last = { x: 0, y: 0, t: 0 };
    let glide = 0;
    let lastTap = 0;

    const local = (event: PointerEvent) => {
      const box = element.getBoundingClientRect();
      return { x: event.clientX - box.left, y: event.clientY - box.top };
    };
    const centre = () => {
      const points = [...pointers.values()];
      const x = points.reduce((sum, p) => sum + p.x, 0) / points.length;
      const y = points.reduce((sum, p) => sum + p.y, 0) / points.length;
      const distance =
        points.length > 1 ? Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y) : 0;
      return { mid: { x, y }, distance };
    };
    const begin = () => {
      const { mid, distance } = centre();
      start = { view: { ...view.current }, mid, distance };
    };

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      cancelAnimationFrame(glide);
      pointers.set(event.pointerId, local(event));
      if (pointers.size === 1) {
        moved = 0;
        velocity = { x: 0, y: 0 };
        last = { ...local(event), t: performance.now() };
      }
      begin();
    };
    const onMove = (event: PointerEvent) => {
      if (!pointers.has(event.pointerId) || !start) return;
      const point = local(event);
      pointers.set(event.pointerId, point);
      const { mid, distance } = centre();
      const scale =
        pointers.size > 1 && start.distance
          ? (start.view.s * distance) / start.distance
          : start.view.s;
      const k = scale / start.view.s;
      apply({
        s: scale,
        x: mid.x - (start.mid.x - start.view.x) * k,
        y: mid.y - (start.mid.y - start.view.y) * k,
      });
      moved = Math.max(moved, Math.hypot(mid.x - start.mid.x, mid.y - start.mid.y));
      const now = performance.now();
      const dt = Math.max(1, now - last.t);
      velocity = { x: (point.x - last.x) / dt, y: (point.y - last.y) / dt };
      last = { ...point, t: now };
    };
    const onUp = (event: PointerEvent) => {
      if (!pointers.has(event.pointerId)) return;
      const point = local(event);
      pointers.delete(event.pointerId);
      if (pointers.size) {
        begin();
        return;
      }
      start = null;
      if (moved < 6) {
        // A double tap zooms in on that spot, or back out when already zoomed.
        const now = performance.now();
        if (now - lastTap < 300) {
          zoomAt(view.current.s > 1.5 ? 1 : 2.5, point.x, point.y);
          lastTap = 0;
        } else lastTap = now;
        return;
      }
      // A short glide in the direction of the drag, easing to a stop.
      let v = { x: velocity.x * 16, y: velocity.y * 16 };
      const step = () => {
        v = { x: v.x * 0.92, y: v.y * 0.92 };
        apply({ ...view.current, x: view.current.x + v.x, y: view.current.y + v.y });
        if (Math.hypot(v.x, v.y) > 0.4) glide = requestAnimationFrame(step);
      };
      glide = requestAnimationFrame(step);
    };
    // A drag ends without "clicking" the pin it started on.
    const onClick = (event: MouseEvent) => {
      if (moved >= 6) {
        event.stopPropagation();
        event.preventDefault();
      }
    };

    element.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    element.addEventListener("click", onClick, true);
    return () => {
      cancelAnimationFrame(glide);
      element.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      element.removeEventListener("click", onClick, true);
    };
  }, [phone, apply, zoomAt]);

  const zoomBy = (factor: number) => {
    const { fw, fh } = size.current;
    zoomAt(view.current.s * factor, fw / 2, fh / 2);
  };

  const control =
    "grid size-10 place-items-center bg-white/95 text-ink transition-colors active:bg-deep active:text-white disabled:opacity-40";

  return (
    <div
      ref={frame}
      data-no-motion
      // Phones: the page still scrolls with a vertical swipe while the plan is at rest; once
      // zoomed in, every gesture moves the plan.
      className={cn(
        "relative overflow-hidden",
        phone && (zoomed ? "touch-none" : "touch-pan-y"),
        className,
      )}
    >
      <div
        ref={content}
        className="absolute inset-0 origin-top-left will-change-transform sm:will-change-auto"
      >
        {children}
      </div>
      {phone ? (
        <div
          role="group"
          aria-label={`Zoom the ${label}`}
          className="absolute right-3 bottom-3 z-30 flex flex-col overflow-hidden rounded-md shadow-float"
        >
          <button type="button" onClick={() => zoomBy(1.6)} className={control}>
            <Icon name="plus" className="size-4" />
            <span className="sr-only">Zoom in</span>
          </button>
          <button
            type="button"
            onClick={() => zoomBy(1 / 1.6)}
            disabled={!zoomed}
            className={cn(control, "border-t border-line")}
          >
            <Icon name="minus" className="size-4" />
            <span className="sr-only">Zoom out</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
