"use client";

import { useSyncExternalStore } from "react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

type Store = "ios" | "android" | null;

/** Which store this device installs from: iPhone/iPad → App Store, Android → Google Play. */
function detectStore(): Store {
  const agent = navigator.userAgent;
  if (/android/i.test(agent)) return "android";
  // iPadOS reports itself as a Mac; a touch screen gives it away.
  if (/iphone|ipad|ipod/i.test(agent) || (/macintosh/i.test(agent) && navigator.maxTouchPoints > 1))
    return "ios";
  return null;
}

const noop = () => () => {};

/**
 * One "Get the Somabay app" button for phones and tablets: it opens the App Store on an iPhone or
 * iPad and Google Play on Android; anywhere else (before hydration too) it links to the App Store.
 * Turquoise with a download icon.
 */
export function AppDownloadButton({ className }: { className?: string }) {
  const store = useSyncExternalStore(noop, detectStore, () => null);
  const href = store === "android" ? siteConfig.apps.android : siteConfig.apps.ios;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex min-h-11 items-center gap-2.5 rounded-full bg-navy px-5 text-white transition-colors duration-500 hover:bg-aqua active:bg-aqua",
        className,
      )}
    >
      <Icon name="download" className="size-4.5" />
      <span className="text-body-sm font-semibold">Get the Somabay app</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
