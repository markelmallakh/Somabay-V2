"use client";

import { useActionState, useId, useState } from "react";
import { type EnquiryState, submitEnquiry } from "@/lib/actions/enquiry";
import type { FormDefinition, FormField } from "@/lib/forms";
import { cn } from "@/lib/utils";
import { DateField } from "@/components/ui/DateField";
import { FileField } from "@/components/ui/FileField";
import { PhoneField } from "@/components/ui/PhoneField";
import { Button } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { filterChipClass } from "@/components/ui/filterChip";

type EnquiryFormProps = {
  /** Passed from a Server Component so field data stays out of the client bundle. */
  definition: FormDefinition;
  /** Extra context sent with the request, e.g. the unit or event name. */
  context?: string;
  /** `teal`: on a deep-teal card (white fields, an orange submit, light small print). */
  tone?: "light" | "teal";
  className?: string;
  /** Tighter spacing between fields and a submit as wide as the form. */
  compact?: boolean;
};

const initialState: EnquiryState = { status: "idle", message: "" };

export function EnquiryForm({
  definition,
  context,
  tone = "light",
  className,
  compact = false,
}: EnquiryFormProps) {
  const [state, formAction, pending] = useActionState(submitEnquiry, initialState);
  const baseId = useId();
  const errors = state.fieldErrors ?? {};
  const fieldId = (name: string) => `${baseId}-${name}`;
  // Answers that other questions depend on (e.g. the contact purpose), so the form can show
  // only the follow-up questions that apply.
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const watched = new Set(
    definition.fields.flatMap((field) => (field.showWhen ? [field.showWhen.field] : [])),
  );
  const shown = (field: FormField) =>
    !field.showWhen || field.showWhen.values.includes(chosen[field.showWhen.field] ?? "");

  if (state.status === "success") {
    return (
      <div
        role="status"
        className={cn(
          "flex animate-rise flex-col items-start gap-5 rounded-md border border-line bg-white p-8 md:p-10",
          className,
        )}
      >
        <span className="grid size-14 place-items-center rounded-full bg-deep text-white">
          <Icon name="check" className="size-7" />
        </span>
        <p className="font-serif text-heading-4">Message sent</p>
        <p className="max-w-md text-body-lg text-slate">{state.message}</p>
      </div>
    );
  }

  const renderField = (field: FormField) => {
    const id = fieldId(field.name);
    const error = errors[field.name];
    switch (field.kind) {
      case "textarea":
        return (
          <TextAreaField
            key={field.name}
            id={id}
            name={field.name}
            label={field.label}
            required={field.required}
            placeholder={field.placeholder}
            error={error}
            className="sm:col-span-2"
          />
        );
      case "select":
        return (
          <SelectField
            key={field.name}
            id={id}
            name={field.name}
            label={field.label}
            required={field.required}
            placeholder={field.placeholder}
            options={field.options}
            error={error}
            onChange={
              watched.has(field.name)
                ? (value) => setChosen((current) => ({ ...current, [field.name]: value }))
                : undefined
            }
            className={cn(
              field.span === 2 && "sm:col-span-2",
              field.showWhen && "relative animate-rise focus-within:z-20",
            )}
          />
        );
      case "radio":
        return (
          <fieldset
            key={field.name}
            className="sm:col-span-2"
            aria-describedby={error ? `${id}-error` : undefined}
          >
            <legend className="eyebrow mb-4 text-label text-slate">
              {field.label}
              {field.required ? <span aria-hidden> *</span> : null}
            </legend>
            {field.display === "chips" ? (
              <div className="flex flex-wrap gap-2.5">
                {field.options.map((option, index) => {
                  const checked = chosen[field.name] === option;
                  return (
                    <label
                      key={option}
                      className={filterChipClass(
                        checked,
                        "cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-turquoise",
                      )}
                    >
                      <input
                        type="radio"
                        name={field.name}
                        value={option}
                        required={field.required && index === 0}
                        checked={checked}
                        onChange={() =>
                          setChosen((current) => ({ ...current, [field.name]: option }))
                        }
                        className="sr-only"
                      />
                      {option}
                    </label>
                  );
                })}
              </div>
            ) : (
              <div
                // The choices side by side, close together, wrapping on narrow screens.
                className="flex flex-wrap gap-x-8 gap-y-3"
              >
                {field.options.map((option, index) => (
                  <label
                    key={option}
                    className="group flex cursor-pointer items-center gap-3 text-[0.9375rem]"
                  >
                    <input
                      type="radio"
                      name={field.name}
                      value={option}
                      required={field.required && index === 0}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden
                      className="grid size-5 place-items-center rounded-full border border-ink/30 transition-colors group-hover:border-ink peer-checked:border-deep peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-turquoise peer-checked:[&>span]:scale-100"
                    >
                      <span className="size-2.5 scale-0 rounded-full bg-deep transition-transform duration-300" />
                    </span>
                    {option}
                  </label>
                ))}
              </div>
            )}
            {error ? (
              <p id={`${id}-error`} className="mt-2 text-body-sm text-alert">
                {error}
              </p>
            ) : null}
          </fieldset>
        );
      case "consent":
        return (
          <div key={field.name} className="sm:col-span-2">
            <label
              htmlFor={id}
              className="group flex cursor-pointer items-center gap-3 text-[0.9375rem]"
            >
              <input
                id={id}
                type="checkbox"
                name={field.name}
                required
                className="peer sr-only"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
              />
              <span
                aria-hidden
                className="grid size-5 place-items-center rounded-[0.375rem] border border-ink/30 text-white transition-colors group-hover:border-ink peer-checked:border-deep peer-checked:bg-deep peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-turquoise"
              >
                <Icon name="check" className="size-3.5" />
              </span>
              {field.label}
            </label>
            {error ? (
              <p id={`${id}-error`} className="mt-2 text-body-sm text-alert">
                {error}
              </p>
            ) : null}
          </div>
        );
      case "date":
        return (
          <DateField
            key={field.name}
            id={id}
            name={field.name}
            label={field.label}
            required={field.required}
            error={error}
            className={cn(
              field.span === 2 && "sm:col-span-2",
              field.showWhen && "relative animate-rise focus-within:z-20",
            )}
          />
        );
      case "file":
        return (
          <FileField
            key={field.name}
            id={id}
            name={field.name}
            label={field.label}
            accept={field.accept}
            required={field.required}
            hint={field.hint}
            error={error}
          />
        );
      case "tel":
        return (
          <PhoneField
            key={field.name}
            id={id}
            name={field.name}
            label={field.label}
            required={field.required}
            error={error}
            className={cn(field.span === 2 && "sm:col-span-2")}
          />
        );
      default:
        return (
          <TextField
            key={field.name}
            id={id}
            name={field.name}
            type={field.kind}
            label={field.label}
            required={field.required}
            placeholder={field.placeholder}
            autoComplete={field.autoComplete}
            error={error}
            className={cn(field.span === 2 && "sm:col-span-2")}
          />
        );
    }
  };

  return (
    <form
      action={formAction}
      noValidate
      data-form-tone={tone}
      className={cn("grid gap-x-5 sm:grid-cols-2", compact ? "gap-y-4" : "gap-y-6", className)}
    >
      <input type="hidden" name="formId" value={definition.id} />
      {context ? <input type="hidden" name="context" value={context} /> : null}
      {definition.fields.filter(shown).map(renderField)}
      <div className="flex flex-col gap-4 sm:col-span-2">
        {state.status === "error" ? (
          <p role="alert" className="text-body-sm text-alert">
            {state.message}
          </p>
        ) : null}
        {/* A large submit (two thirds of the form wide, or all of it when compact); its small print under it. */}
        <div className="flex flex-col items-start gap-3">
          <Button
            type="submit"
            variant={tone === "teal" ? "orange" : "solid"}
            size="lg"
            disabled={pending}
            className={cn("w-full", !compact && "sm:w-2/3")}
          >
            {pending ? "Sending…" : definition.submitLabel}
          </Button>
          {definition.note ? (
            <p className={cn("text-body-xs", tone === "teal" ? "text-white/70" : "text-slate")}>
              {definition.note}
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
