import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SelectMenu } from "./SelectMenu";

/**
 * Boxed controls with the label inside: at rest it sits where the value goes; on focus, or once
 * there is a value, it shrinks and floats to the top of the box.
 */
export const control = cn(
  "peer block w-full rounded-md border border-ink/15 bg-white px-4 pt-6 pb-2 text-body text-ink outline-none",
  "transition-[border-color,box-shadow,background-color] duration-500 ease-out-expo hover:border-ink/35",
  // Focus: a quiet deep-teal edge and a soft, low shadow that settles under the box (no glow).
  "focus:border-turquoise-160/55 focus:shadow-[0_6px_16px_-12px_rgb(27_49_80/0.18)]",
  "aria-expanded:border-turquoise-160/55 aria-expanded:shadow-[0_6px_16px_-12px_rgb(27_49_80/0.18)]",
  "aria-invalid:border-alert",
);

/** The label floats when the control is focused or filled (`filled` is a CSS condition). */
const label = (filled: string) =>
  cn(
    "pointer-events-none absolute top-4 left-4 origin-top-left text-body text-slate",
    "transition-[translate,scale,color] duration-300 ease-out-expo",
    "peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-turquoise-160",
    filled,
  );

/** Inputs and textareas: filled once the (blank) placeholder is no longer shown. */
const floatsWhenTyped = label(
  "peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:scale-75",
);
/** Dropdowns: filled while open or once an option is chosen (the trigger's `data-filled`). */
const floatsWhenChosen = label("peer-data-filled:-translate-y-2.5 peer-data-filled:scale-75");

type FieldShellProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  labelClassName: string;
  children: ReactNode;
  className?: string;
};

function FieldShell({
  id,
  label: text,
  required,
  error,
  hint,
  labelClassName,
  children,
  className,
}: FieldShellProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {/* The control comes first so the label can react to it (peer). */}
      <div className="relative">
        {children}
        <label htmlFor={id} data-field-label className={labelClassName}>
          {text}
          {required ? <span aria-hidden> *</span> : null}
        </label>
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-body-sm text-alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-body-sm text-slate">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type BaseProps = { id: string; label: string; error?: string; hint?: string; className?: string };

function describedBy(id: string, error?: string, hint?: string) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

export function TextField({
  id,
  label,
  error,
  hint,
  className,
  required,
  // The label is the prompt; a placeholder would sit under it.
  placeholder: _placeholder,
  ...props
}: BaseProps & Omit<ComponentPropsWithoutRef<"input">, "id" | "className">) {
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      error={error}
      hint={hint}
      labelClassName={floatsWhenTyped}
      className={className}
    >
      <input
        id={id}
        name={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={control}
        {...props}
        placeholder=" "
      />
    </FieldShell>
  );
}

export function TextAreaField({
  id,
  label,
  error,
  hint,
  className,
  required,
  placeholder: _placeholder,
  ...props
}: BaseProps & Omit<ComponentPropsWithoutRef<"textarea">, "id" | "className">) {
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      error={error}
      hint={hint}
      labelClassName={floatsWhenTyped}
      className={className}
    >
      <textarea
        id={id}
        name={id}
        rows={3}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(control, "resize-y")}
        {...props}
        placeholder=" "
      />
    </FieldShell>
  );
}

export function SelectField({
  id,
  name,
  label,
  error,
  hint,
  className,
  required,
  options,
  onChange,
}: BaseProps & {
  name?: string;
  options: string[];
  required?: boolean;
  onChange?: (value: string) => void;
  /** Kept for the form definitions; the label inside the box is the prompt. */
  placeholder?: string;
}) {
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      error={error}
      hint={hint}
      labelClassName={floatsWhenChosen}
      className={className}
    >
      <SelectMenu
        id={id}
        name={name ?? id}
        title={label}
        options={options}
        required={required}
        invalid={Boolean(error)}
        describedBy={describedBy(id, error, hint)}
        className={control}
        onChange={onChange}
      />
    </FieldShell>
  );
}
