"use client";

import { animate, m, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import type { ForecastDay, WeatherForecast } from "@/lib/weather";
import { describeWeather } from "@/lib/weather-codes";
import { easeOutExpo } from "@/components/animations/easing";
import { Dialog } from "@/components/ui/Dialog";
import { Icon, type IconName } from "@/components/ui/Icon";

type WeatherDialogProps = {
  open: boolean;
  onClose: () => void;
  forecast: WeatherForecast;
  /** Viewport box of the header temperature it opens from. */
  anchor: { left: number; top: number; width: number; height: number } | null;
};

/** Panel width, px. */
const WIDTH = 416;
/** Circle reveal: an even in-out curve, as the menu uses. */
const easeCircle = [0.65, 0, 0.35, 1] as const;

const dayLabel = (date: string, index: number) =>
  index === 0
    ? "Today"
    : new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" }).format(
        new Date(`${date}T00:00:00Z`),
      );

const dateLabel = (date: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );

/**
 * Compact weather panel that opens from the header temperature: it grows as a circle out of the
 * weather icon, the temperature counts up, and the forecast rows rise in one by one with their
 * low-to-high bars drawing across (all days share one scale so they compare).
 */
export function WeatherDialog({ open, onClose, forecast, anchor }: WeatherDialogProps) {
  const { current, sea, days } = forecast;
  const now = describeWeather(current.code, current.isDay);
  const low = Math.min(...days.map((day) => day.min));
  const high = Math.max(...days.map((day) => day.max));
  const span = Math.max(high - low, 1);

  // Place the panel next to the temperature it opened from: below it from the header, above it
  // from the footer (whenever the trigger sits in the lower half of the screen). It grows from
  // the weather icon.
  const viewport = typeof window === "undefined" ? 1440 : window.innerWidth;
  const viewportHeight = typeof window === "undefined" ? 900 : window.innerHeight;
  const upward = anchor ? anchor.top > viewportHeight / 2 : false;
  const position = upward
    ? { bottom: viewportHeight - (anchor?.top ?? 0) + 14 }
    : { top: anchor ? anchor.top + anchor.height + 14 : 96 };
  const left = anchor
    ? upward
      ? Math.min(Math.max(anchor.left - 8, 16), viewport - WIDTH - 16)
      : Math.min(Math.max(anchor.left + anchor.width - WIDTH + 24, 16), viewport - WIDTH - 16)
    : viewport - WIDTH - 16;
  const originX = anchor ? anchor.left + (upward ? 20 : 11) - left : WIDTH - 40;
  const at = upward ? `${originX}px calc(100% + 14px)` : `${originX}px -14px`;
  // Big enough to reach the panel's farthest corner (its tallest is 36rem = 576px).
  const cover = Math.ceil(Math.hypot(Math.max(originX, WIDTH - originX), 576 + 14)) + 24;
  const panel = useRef<HTMLElement>(null);

  const counter = useMotionValue(current.temperature - 8);
  const shownTemperature = useTransform(counter, (value) => `${Math.round(value)}°`);
  useEffect(() => {
    if (!open) return;
    counter.set(current.temperature - 8);
    const controls = animate(counter, current.temperature, {
      duration: 1.2,
      delay: 0.25,
      ease: easeOutExpo,
    });
    return () => controls.stop();
  }, [open, counter, current.temperature]);

  const stats: { icon: IconName; label: string; value: string }[] = [
    current.humidity !== null
      ? { icon: "droplet", label: "Humidity", value: `${current.humidity}%` }
      : null,
    current.wind !== null ? { icon: "wind", label: "Wind", value: `${current.wind} km/h` } : null,
    sea !== null ? { icon: "waves", label: "Sea", value: `${sea}°` } : null,
    days[0]?.uv !== null && days[0]?.uv !== undefined
      ? { icon: "sun", label: "UV", value: String(days[0].uv) }
      : null,
  ].filter((stat): stat is { icon: IconName; label: string; value: string } => stat !== null);

  return (
    <Dialog open={open} onClose={onClose} label="Weather at Somabay" variant="fade">
      <div className="relative size-full">
        <button
          type="button"
          aria-label="Close weather"
          tabIndex={-1}
          onClick={onClose}
          className="absolute inset-0 size-full cursor-default bg-abyss/25"
        />
        <m.section
          initial={{ clipPath: `circle(0px at ${at})` }}
          animate={{
            clipPath: `circle(${cover}px at ${at})`,
            transition: { duration: 0.75, ease: easeCircle },
          }}
          ref={panel}
          // Once open, drop the clip so nothing can ever be cut off (the panel remounts per open).
          onAnimationComplete={() => {
            if (panel.current) panel.current.style.clipPath = "none";
          }}
          style={{ ...position, left, width: WIDTH }}
          className="absolute flex max-h-[min(36rem,calc(100svh-7rem))] flex-col overflow-hidden rounded-md bg-white shadow-[0_24px_70px_rgb(15_30_53/0.25)]"
        >
          {/* Now, on a turquoise band. */}
          <header
            data-theme-surface="dark"
            className="relative shrink-0 bg-[linear-gradient(135deg,var(--color-turquoise)_0%,var(--color-turquoise-160)_100%)] px-5 pt-3 pb-3 text-white"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-label font-semibold tracking-[0.14em] text-white uppercase">
                Somabay now
              </p>
              <button
                type="button"
                onClick={onClose}
                data-autofocus
                aria-label="Close"
                className="-mt-1.5 -mr-1.5 grid size-7 place-items-center rounded-md text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              >
                <Icon name="close" className="size-4" />
              </button>
            </div>
            <div className="mt-0.5 flex items-center gap-3">
              <m.span
                initial={{ rotate: -40, scale: 0.6, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: easeOutExpo, delay: 0.2 }}
              >
                <Icon name={now.icon} className="size-8 text-sun" />
              </m.span>
              <m.span className="font-serif text-[2.25rem] leading-none tabular-nums">
                {shownTemperature}
              </m.span>
              <span className="flex flex-col text-body-xs leading-tight text-white/80">
                <span className="font-medium text-white">{now.label}</span>
                {current.feelsLike !== null ? <span>Feels like {current.feelsLike}°</span> : null}
              </span>
            </div>
            {stats.length ? (
              <dl className="mt-2.5 grid grid-cols-4 gap-1.5">
                {stats.map((stat, position) => (
                  <m.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.35 + position * 0.05 }}
                    className="flex flex-col items-center rounded-md bg-white/12 py-1"
                  >
                    <dt className="flex items-center gap-1 text-body-2xs tracking-label text-white/70 uppercase">
                      <Icon name={stat.icon} className="size-3" />
                      {stat.label}
                    </dt>
                    <dd className="text-body-xs font-medium tabular-nums">{stat.value}</dd>
                  </m.div>
                ))}
              </dl>
            ) : null}
          </header>

          {/* Every forecast day. */}
          <div
            data-lenis-prevent
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-3 pb-2"
          >
            <p className="text-label font-medium tracking-label text-slate uppercase">
              {days.length}-day forecast
            </p>
            <ol className="mt-1">
              {days.map((day, position) => (
                <ForecastRow
                  key={day.date}
                  day={day}
                  position={position}
                  low={low}
                  span={span}
                  current={position === 0 ? current.temperature : null}
                />
              ))}
            </ol>
          </div>

          <footer className="shrink-0 border-t border-line/60 px-5 py-1.5 text-body-2xs text-mist">
            Forecast by{" "}
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-ink"
            >
              Open-Meteo
            </a>
            , updated hourly.
          </footer>
        </m.section>
      </div>
    </Dialog>
  );
}

function ForecastRow({
  day,
  position,
  low,
  span,
  current,
}: {
  day: ForecastDay;
  position: number;
  low: number;
  span: number;
  current: number | null;
}) {
  const weather = describeWeather(day.code);
  const from = ((day.min - low) / span) * 100;
  const to = ((day.max - low) / span) * 100;
  const marker = current !== null ? ((current - low) / span) * 100 : null;
  // Rows past the first screenful appear together rather than trailing for seconds.
  const delay = 0.4 + Math.min(position, 9) * 0.04;

  return (
    <m.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: easeOutExpo, delay }}
      className="grid grid-cols-[3.25rem_1.75rem_2.25rem_minmax(0,1fr)] items-center gap-2 border-b border-line py-2 last:border-b-0"
    >
      <span className="flex flex-col leading-tight">
        <span className="text-body-sm font-medium text-ink">{dayLabel(day.date, position)}</span>
        <span className="text-label text-slate">{dateLabel(day.date)}</span>
      </span>
      <span title={weather.label}>
        <Icon name={weather.icon} className="size-5 text-turquoise" />
        <span className="sr-only">{weather.label}</span>
      </span>
      <span className="text-label text-turquoise-160 tabular-nums">
        {day.rain !== null && day.rain >= 10 ? (
          <span className="flex items-center gap-0.5" title="Chance of rain">
            <Icon name="droplet" className="size-3" />
            {day.rain}%
          </span>
        ) : null}
      </span>
      <span className="flex items-center gap-2 tabular-nums">
        <span className="w-6 text-right text-body-xs text-slate">{day.min}°</span>
        <span aria-hidden className="relative h-1 flex-1 rounded-full bg-turquoise-10">
          <m.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, ease: easeOutExpo, delay: delay + 0.1 }}
            className="absolute inset-y-0 origin-left rounded-full bg-[linear-gradient(to_right,var(--color-turquoise),var(--color-sun))]"
            style={{ left: `${from}%`, right: `${100 - to}%` }}
          />
          {marker !== null ? (
            <span
              className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-white bg-ink"
              style={{ left: `${marker}%` }}
            />
          ) : null}
        </span>
        <span className="w-6 text-body-xs font-medium text-ink">{day.max}°</span>
        <span className="sr-only">
          Low {day.min}°, high {day.max}°{day.rain !== null ? `, ${day.rain}% chance of rain` : ""}
        </span>
      </span>
    </m.li>
  );
}
