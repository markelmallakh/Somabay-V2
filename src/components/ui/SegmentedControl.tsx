"use client";

import { type KeyboardEvent, useRef } from "react";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "./Icon";

export type SegmentOption<T extends string> = { id: T; label: string; icon?: IconName };

type SegmentedControlProps<T extends string> = {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  /** `light` sits on pale grounds, `dark` floats over imagery. */
  tone?: "light" | "dark";
  /** `sm` is the compact version for overlays on photos and maps. */
  size?: "md" | "sm";
  className?: string;
};

/**
 * Tab switch (radio semantics) for views and categories: 4px corners, the active tab fills
 * turquoise on a white track.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  tone = "light",
  size = "md",
  className,
}: SegmentedControlProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const current = options.findIndex((option) => option.id === value);
    const next =
      (current + (event.key === "ArrowRight" ? 1 : -1) + options.length) % options.length;
    onChange(options[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        "scrollbar-none inline-flex max-w-full gap-1 overflow-x-auto rounded-md p-1",
        tone === "light"
          ? "bg-white shadow-[0_1px_3px_rgb(15_30_53/0.06)]"
          : "border border-white/15 glass",
        className,
      )}
    >
      {options.map((option, index) => {
        const checked = option.id === value;
        return (
          <button
            key={option.id}
            ref={(element) => {
              refs.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(option.id)}
            className={cn(
              "relative flex shrink-0 flex-col items-center justify-center rounded-[3px] whitespace-nowrap transition-colors duration-500",
              size === "sm" ? "min-h-8 px-3 text-body-xs" : "min-h-10 px-5 text-[0.8125rem]",
              checked
                ? "bg-deep text-white"
                : tone === "light"
                  ? "text-slate hover:text-turquoise-160"
                  : "text-white/80 hover:text-white",
            )}
          >
            <span className="flex items-center gap-2">
              {option.icon ? <Icon name={option.icon} className="size-4" /> : null}
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
