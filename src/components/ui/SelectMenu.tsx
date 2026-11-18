"use client";

import { AnimatePresence, m } from "framer-motion";
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "@/components/animations/easing";
import { Icon } from "./Icon";

type SelectMenuProps = {
  id: string;
  name: string;
  /** Shown as the menu's small title row, like the language menu's "Language". */
  title: string;
  options: string[];
  required?: boolean;
  invalid?: boolean;
  describedBy?: string;
  /** Classes for the trigger box (shared with the text fields). */
  className?: string;
  /** Called with the chosen option (forms that change with the answer). */
  onChange?: (value: string) => void;
};

/**
 * A form dropdown drawn like the header language menu: a small white panel with a hairline border
 * and soft shadow that eases down from the field, its rows rising in one after another and a
 * turquoise check on the chosen one. The value is submitted through a hidden input. The trigger
 * carries `data-filled` while open or chosen, so the floating label can rise (peer-data).
 */
export function SelectMenu({
  id,
  name,
  title,
  options,
  required,
  invalid,
  describedBy,
  className,
  onChange,
}: SelectMenuProps) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const listId = useId();

  // Close on an outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!trigger.current?.contains(target) && !list.current?.contains(target)) setOpen(false);
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (option: string) => {
    setValue(option);
    onChange?.(option);
    setOpen(false);
    trigger.current?.focus();
  };

  const onTriggerKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    setOpen(true);
  };

  // Arrow keys move between rows.
  const onListKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const position = items.current.findIndex((item) => item === document.activeElement);
    const step = event.key === "ArrowDown" ? 1 : -1;
    const next = (position + step + options.length) % options.length;
    items.current[next]?.focus();
  };

  return (
    // No wrapper: the trigger must stay a direct sibling of the field's label (peer).
    <>
      <input type="hidden" name={name} value={value} />
      <button
        ref={trigger}
        id={id}
        type="button"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={onTriggerKey}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        data-invalid={invalid || undefined}
        aria-describedby={describedBy}
        data-filled={open || value !== "" || undefined}
        className={cn(
          className,
          "h-14 pr-11 text-left data-invalid:border-alert",
          open && "border-deep",
        )}
      >
        {/* Keeps the line height even before a value is chosen. */}
        <span className="block truncate">{value || " "}</span>
      </button>
      <Icon
        name="chevron-down"
        data-field-icon
        className={cn(
          "pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-slate transition-transform duration-500 ease-out-expo",
          open && "rotate-180",
        )}
      />

      <AnimatePresence>
        {open ? (
          <m.div
            ref={list}
            id={listId}
            role="listbox"
            aria-label={title}
            onKeyDown={onListKey}
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.18 } }}
            transition={{ duration: 0.45, ease: easeOutExpo }}
            style={{ transformOrigin: "50% 0%" }}
            className="popover-sheet absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-md border border-line bg-white text-ink shadow-[0_18px_50px_rgb(15_30_53/0.18)]"
          >
            <p className="px-4 pt-3 pb-2.5 text-body-xs font-medium text-slate">
              {title}
              {required ? <span aria-hidden> *</span> : null}
            </p>
            <div data-lenis-prevent className="max-h-72 overflow-y-auto border-t border-line p-1.5">
              {options.map((option, position) => {
                const selected = option === value;
                return (
                  <m.button
                    key={option}
                    ref={(node) => {
                      items.current[position] = node;
                    }}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    autoFocus={selected || (value === "" && position === 0)}
                    onClick={() => choose(option)}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: easeOutExpo, delay: 0.04 + position * 0.04 }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-body-sm transition-colors duration-200 outline-none hover:bg-turquoise-5 focus-visible:bg-turquoise-5",
                      selected && "font-medium",
                    )}
                  >
                    <span className="flex-1">{option}</span>
                    {selected ? <Icon name="check" className="size-4 text-turquoise" /> : null}
                  </m.button>
                );
              })}
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
