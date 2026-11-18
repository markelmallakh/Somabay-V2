"use client";

import { useEffect } from "react";

const basePath = process.env.NEXT_PUBLIC_PAGES_BASE_PATH ?? "";

/** True for a link that stays on the homepage: the home URL itself or an in-page #anchor. */
function staysHome(anchor: HTMLAnchorElement) {
  const raw = anchor.getAttribute("href") ?? "";
  if (raw.startsWith("#")) return true;
  let url: URL;
  try {
    url = new URL(anchor.href, window.location.href);
  } catch {
    return false;
  }
  if (url.origin !== window.location.origin) return false;
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const home = basePath.replace(/\/+$/, "") || "/";
  return path === home;
}

/**
 * Homepage-only demo (see `siteConfig.homepageOnly`). One page-wide guard cancels every click on a
 * link that would leave the homepage, before the router or the browser can follow it. The click
 * still reaches the page, so menus close and the dropdowns behave as usual; Next's links skip
 * navigation for a cancelled click.
 */
export function HomepageOnly() {
  useEffect(() => {
    const block = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || staysHome(anchor)) return;
      event.preventDefault();
    };
    // Capture: runs before the router's own click handling. `auxclick` covers middle-clicks.
    document.addEventListener("click", block, true);
    document.addEventListener("auxclick", block, true);
    return () => {
      document.removeEventListener("click", block, true);
      document.removeEventListener("auxclick", block, true);
    };
  }, []);
  return null;
}
