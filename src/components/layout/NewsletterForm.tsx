"use client";

import { useActionState, useId } from "react";
import { type NewsletterState, subscribeToNewsletter } from "@/lib/actions/newsletter";
import { cn } from "@/lib/utils";

const initialState: NewsletterState = { status: "idle", message: "" };

/** `dark` on dark grounds (a glass pill); `light` on white (a pale pill and a dark Join button). */
export function NewsletterForm({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const light = tone === "light";
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, initialState);
  const inputId = useId();
  const messageId = useId();

  return (
    <form action={formAction} className="mt-6" noValidate>
      <div
        className={cn(
          "flex items-center gap-2 rounded-full pr-2 pl-6 text-left ring-1 transition-shadow duration-500",
          light
            ? "bg-sand-100 ring-ink/10 focus-within:ring-turquoise/50"
            : "bg-white/[0.07] ring-white/12 focus-within:ring-frost/60",
        )}
      >
        {/* The label sits inside the box and floats up, shrinking, on focus or once typed in. */}
        <div className="relative min-w-0 flex-1">
          <input
            id={inputId}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder=" "
            aria-describedby={messageId}
            aria-invalid={state.status === "error" || undefined}
            className={cn(
              "peer min-h-14 w-full bg-transparent pt-5 pb-1.5 text-body-md outline-none",
              light ? "text-ink" : "text-white",
            )}
          />
          <label
            htmlFor={inputId}
            className={cn(
              "pointer-events-none absolute top-1/2 left-0 origin-top-left -translate-y-1/2 text-body-md whitespace-nowrap transition-[translate,scale,color] duration-300 ease-out-expo peer-focus:-translate-y-[1.4rem] peer-focus:scale-75 peer-[:not(:placeholder-shown)]:-translate-y-[1.4rem] peer-[:not(:placeholder-shown)]:scale-75",
              light
                ? "text-slate peer-focus:text-turquoise"
                : "text-white/55 peer-focus:text-frost",
            )}
          >
            Your email address
          </label>
        </div>
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "group inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-5 text-body-xs font-medium tracking-[0.06em] uppercase transition-colors duration-500 disabled:opacity-60",
            light ? "bg-navy text-white hover:bg-aqua" : "bg-frost text-navy hover:bg-white",
          )}
        >
          {pending ? "Joining…" : "Join"}
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            className="size-4 transition-transform duration-700 ease-out-expo group-hover:translate-x-1"
          >
            <path d="M4 12h15m-5-5 5 5-5 5" />
          </svg>
        </button>
      </div>
      <p
        id={messageId}
        aria-live="polite"
        className={cn(
          "mt-2 min-h-5 text-body-xs",
          state.status === "error" && (light ? "text-alert" : "text-alert-soft"),
          state.status === "success" && (light ? "text-turquoise" : "text-frost"),
          state.status === "idle" && "sr-only",
        )}
      >
        {state.status === "idle"
          ? "By subscribing you agree to our Privacy Policy."
          : state.message}
      </p>
    </form>
  );
}
