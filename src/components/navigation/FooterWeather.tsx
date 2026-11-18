"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { WeatherForecast } from "@/lib/weather";
import { Icon } from "@/components/ui/Icon";

const WeatherDialog = dynamic(() =>
  import("./WeatherDialog").then((module) => module.WeatherDialog),
);

/** The footer's weather pill: opens the same forecast popup as the header, above the pill. */
export function FooterWeather({
  forecast,
  tone = "light",
  short = false,
  bare = false,
}: {
  forecast: WeatherForecast;
  /** `dark`: white pill on the deep turquoise menu. */
  tone?: "light" | "dark";
  /** Just the temperature (no "Somabay now"), for a tight row. */
  short?: boolean;
  /** No border, filling its cell (the phone menu's divided row). */
  bare?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [anchor, setAnchor] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={(event) => {
          const box = event.currentTarget.getBoundingClientRect();
          setAnchor({ left: box.left, top: box.top, width: box.width, height: box.height });
          setLoaded(true);
          setOpen(true);
        }}
        className={
          bare
            ? `flex min-h-11 w-full items-center justify-center gap-2 text-body-xs transition-opacity hover:opacity-75 ${tone === "dark" ? "text-white" : "text-ink"}`
            : tone === "dark"
              ? "inline-flex min-h-10 items-center gap-2 rounded-md border border-white/25 px-3 py-1.5 text-body-xs text-white transition-colors hover:border-white/60"
              : "inline-flex min-h-10 items-center gap-2 rounded-md border border-line px-3 py-1.5 text-body-xs text-ink transition-colors hover:border-deep/60"
        }
      >
        <Icon
          name={forecast.current.isDay ? "cloud-sun" : "moon"}
          className={tone === "dark" ? "size-4.5 text-sun" : "size-4.5 text-turquoise"}
        />
        <span>
          <span className="sr-only">Weather forecast. Current temperature: </span>
          <span className="font-semibold">{forecast.current.temperature}°C</span>
          {short ? (
            <span className="sr-only"> in Somabay now</span>
          ) : (
            <span className={tone === "dark" ? "text-white/70" : "text-slate"}> · Somabay now</span>
          )}
        </span>
      </button>
      {loaded ? (
        <WeatherDialog
          open={open}
          onClose={() => setOpen(false)}
          forecast={forecast}
          anchor={anchor}
        />
      ) : null}
    </>
  );
}
