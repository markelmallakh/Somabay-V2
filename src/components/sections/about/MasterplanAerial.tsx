"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { siteConfig } from "@/config/site";
import { aerialMasterplan, type MasterplanCategory, type MasterplanHotspot } from "@/content/about";
import { cn } from "@/lib/utils";
import { MediaSlider } from "@/components/media/MediaSlider";
import { PanZoom } from "@/components/media/PanZoom";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { TextLink } from "@/components/ui/TextLink";
import { SmartLink } from "@/components/ui/SmartLink";
import { StarChip } from "@/components/sections/holidays/StarChip";
import { Dialog } from "@/components/ui/Dialog";
import { DrawerSteppers } from "@/components/ui/DrawerSteppers";
import { Icon } from "@/components/ui/Icon";
import { PriceFrom } from "@/components/ui/PriceFrom";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

type Filter = "all" | MasterplanCategory;

/** The badge over a place's name in the drawer, so it reads at a glance. */
const categoryLabel: Record<MasterplanCategory, string> = {
  hotels: "Hotel",
  marina: "Marina",
  communities: "Neighborhood",
  dining: "Restaurant",
};

/** Opens the 3DVista tour, optionally at a named scene. */
const tourUrl = (scene?: string) =>
  scene
    ? `${siteConfig.virtualTour}#media-name=${encodeURIComponent(scene)}`
    : siteConfig.virtualTour;

const stagger = (index: number) => ({ "--i": index }) as CSSProperties;

/**
 * The peninsula aerial with clickable places. The tabs filter pins by Hotels, Marina, Communities
 * and Dining; a pin opens the side drawer (photos, details, Explore, View 360 VR) and the drawer
 * steps through the places in the current filter. 360 buttons open the Somabay virtual tour.
 */
export function MasterplanAerial({ hotspots }: { hotspots: MasterplanHotspot[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [tour, setTour] = useState<{ url: string; title: string } | null>(null);
  // Phones: the aerial keeps its true proportions inside a taller frame and pans sideways, so the
  // pins stay on their places; it opens centred on the peninsula.

  const visible = (spot: MasterplanHotspot) => filter === "all" || spot.category === filter;
  const shown = hotspots.filter(visible);
  const openIndex = shown.findIndex((spot) => spot.id === openId);
  const open = openIndex >= 0 ? shown[openIndex] : null;
  const categories = aerialMasterplan.categories.filter(
    (option) => option.id === "all" || hotspots.some((spot) => spot.category === option.id),
  );
  const step = (by: number) => setOpenId(shown[(openIndex + by + shown.length) % shown.length].id);

  return (
    <>
      {/* No parallax: the pins sit on the photo by percentage and must stay on their places.
          Phones: drag, pinch and double-tap to explore the aerial (see PanZoom). */}
      {/* From sm up the aerial runs the full content width and, with its filter, fits the screen
          under the header: on shorter screens some open sea (top) and desert (bottom) is cropped,
          but never past the pins (at least 62% of the photo's height stays in view). */}
      <div className="relative w-full">
        <PanZoom
          aspect={6008 / 3368}
          label="masterplan"
          className="aspect-[4/5] w-full rounded-md sm:aspect-auto sm:h-[min(calc(100cqw*3368/6008),max(calc(100svh-var(--header-height)-2rem),calc(100cqw*3368/6008*0.62)))]"
        >
          {/* The photo and its pins keep the photo's proportions (pins sit by percentage); the
              frame crops 55% of any overflow from the top, 45% from the bottom. */}
          <div className="absolute inset-0 sm:inset-auto sm:top-[calc((100%-100cqw*3368/6008)*0.55)] sm:left-0 sm:aspect-[6008/3368] sm:w-full">
            <ResponsiveImage
              asset={aerialMasterplan.image}
              sizes="(min-width: 1512px) 1392px, (min-width: 640px) 100vw, 230vw"
              quality={85}
              fill
            />
            <div aria-hidden className="absolute inset-0 bg-[#0f1e35]/10" />
            <ul aria-label="Places on the masterplan">
              {hotspots.map((spot) => {
                const on = visible(spot);
                const selected = open?.id === spot.id;
                return (
                  <li
                    key={spot.id}
                    className="pz-counter absolute origin-[0.9375rem_50%] -translate-x-[0.9375rem] -translate-y-1/2 hover:z-10"
                    style={{ left: `${spot.x}%`, top: `${spot.y}%`, zIndex: selected ? 2 : 1 }}
                  >
                    <button
                      type="button"
                      aria-haspopup="dialog"
                      tabIndex={on ? 0 : -1}
                      aria-hidden={!on}
                      onClick={() => setOpenId(spot.id)}
                      className={cn(
                        "group/pin flex items-center rounded-full p-2 transition-[background-color,box-shadow,opacity,scale] duration-500 ease-out-expo",
                        on ? "opacity-100" : "pointer-events-none scale-75 opacity-0",
                        selected
                          ? "bg-deep shadow-float"
                          : "bg-deep/25 backdrop-blur-sm hover:bg-white hover:shadow-float focus-visible:bg-white",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "size-3.5 shrink-0 rounded-full outline-3 transition-colors duration-500",
                          selected ? "bg-white outline-white/35" : "bg-deep outline-white",
                        )}
                      />
                      <span
                        className={cn(
                          "grid transition-[grid-template-columns] duration-500 ease-out-expo",
                          selected
                            ? "grid-cols-[1fr]"
                            : "grid-cols-[0fr] group-hover/pin:grid-cols-[1fr] group-focus-visible/pin:grid-cols-[1fr]",
                        )}
                      >
                        <span
                          className={cn(
                            "overflow-hidden text-body-sm font-medium whitespace-nowrap",
                            selected ? "text-white" : "text-ink",
                          )}
                        >
                          <span className="block px-2 leading-3.5">{spot.name}</span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </PanZoom>

        <SegmentedControl
          label="Masterplan category"
          value={filter}
          onChange={(value) => {
            setFilter(value);
            setOpenId(null);
          }}
          options={categories}
          size="sm"
          className="absolute top-4 left-4 z-20 max-w-[calc(100%-2rem)] shadow-float lg:top-6 lg:left-6"
        />

        <Button
          variant="glass"
          icon="cube"
          iconPosition="start"
          onClick={() => setTour({ url: tourUrl(), title: "Somabay 360 virtual tour" })}
          className="absolute bottom-4 left-4 lg:bottom-6 lg:left-6"
        >
          View 360 VR
        </Button>
      </div>

      {/* Side drawer for the selected place. */}
      <Dialog
        open={open !== null}
        onClose={() => setOpenId(null)}
        label={open?.name ?? "Place details"}
        variant="drawer"
        outside={
          <DrawerSteppers
            position={openIndex}
            count={shown.length}
            onNavigate={(index) => setOpenId(shown[index].id)}
            noun="place"
          />
        }
      >
        {open ? (
          <article key={open.id} className="flex min-h-full flex-col">
            <div className="relative">
              {open.images.length > 1 ? (
                <MediaSlider
                  key={open.id}
                  images={open.images}
                  sizes="(min-width: 680px) 680px, 100vw"
                  label={`${open.name} photos`}
                  className="aspect-[4/3]"
                />
              ) : open.images[0] ? (
                <div className="relative aspect-[4/3]">
                  <ResponsiveImage
                    asset={open.images[0]}
                    sizes="(min-width: 680px) 680px, 100vw"
                    quality={85}
                    fill
                  />
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => setOpenId(null)}
                className="wave absolute top-5 left-5 z-20 grid size-12 place-items-center rounded-md bg-white text-ink shadow-float transition-colors hover:text-white md:hidden"
                aria-label="Close"
              >
                <Icon name="close" className="size-5" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-5 px-gutter py-6 md:p-10">
              {/* The name (with a hotel's star rating beside it), then its tags under it. */}
              <div
                data-drawer-item
                style={stagger(0)}
                className="flex flex-col items-start gap-1.5"
              >
                <span className="mb-2 inline-flex items-center rounded-md bg-turquoise-20 px-2.5 py-[0.3125rem] text-[0.6875rem] leading-none font-semibold tracking-[0.12em] text-turquoise-160 uppercase">
                  {categoryLabel[open.category]}
                </span>
                <h2 className="font-serif text-heading-3 leading-[1.2]">
                  {open.name}
                  {open.badges?.stars ? (
                    <StarChip
                      count={open.badges.stars}
                      className="relative -top-[0.2em] ml-3 align-middle"
                    />
                  ) : null}
                </h2>
                {open.kicker ? <p className="text-body-md text-slate">{open.kicker}</p> : null}
              </div>
              {open.badges?.tags?.length ? (
                <ul data-drawer-item style={stagger(1)} className="flex flex-wrap gap-2">
                  {open.badges.tags.map((tag) => (
                    <li key={tag}>
                      <Chip>{tag}</Chip>
                    </li>
                  ))}
                </ul>
              ) : null}
              {open.description ? (
                <p data-drawer-item style={stagger(2)} className="text-body-lg text-slate">
                  {open.description}
                </p>
              ) : null}
              {open.location ? (
                <p
                  data-drawer-item
                  style={stagger(2)}
                  className="flex items-center gap-2 text-body-sm text-slate"
                >
                  <Icon name="pin" className="size-4" />
                  {open.location}
                </p>
              ) : null}
              {open.price ? (
                <div data-drawer-item style={stagger(3)} className="border-t border-line pt-5">
                  <PriceFrom amount={open.price} />
                </div>
              ) : null}
              <div
                data-drawer-item
                style={stagger(3)}
                className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2"
              >
                {(open.actions ?? (open.href ? [{ label: "Explore", href: open.href }] : [])).map(
                  (action, index) =>
                    index === 0 ? (
                      <Button
                        key={action.label}
                        href={action.href}
                        external={action.external}
                        variant="primary"
                        icon={action.external ? "arrow-up-right" : "arrow-right"}
                      >
                        {action.label}
                      </Button>
                    ) : (
                      <TextLink key={action.label} href={action.href} external={action.external}>
                        {action.label}
                      </TextLink>
                    ),
                )}
                {open.menuUrl ? (
                  // The restaurant's menu, opened in a new tab.
                  <Button
                    href={open.menuUrl}
                    external
                    variant="outline"
                    icon="arrow-up-right"
                    className="border-deep text-turquoise-160"
                  >
                    View menu
                  </Button>
                ) : null}
                {open.infoLink ? (
                  <SmartLink
                    href={open.infoLink.href}
                    external={open.infoLink.external}
                    className="flex items-center gap-2 text-body-sm font-semibold tracking-label text-ink uppercase hover:text-lagoon"
                  >
                    <Icon name="directions-solid" className="size-4.5 text-turquoise" />
                    {open.infoLink.label}
                  </SmartLink>
                ) : null}
              </div>

              {/* Phones: previous / next in the sheet (larger screens use the steppers outside). */}
              {shown.length > 1 ? (
                <div
                  data-drawer-item
                  style={stagger(4)}
                  className="mt-auto flex items-center justify-between border-t border-line pt-6 md:hidden"
                >
                  <span className="text-body-sm text-slate" aria-live="polite">
                    {openIndex + 1} / {shown.length}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="grid size-11 place-items-center rounded-full border border-line transition-colors hover:border-aqua hover:bg-aqua hover:text-white"
                      onClick={() => step(-1)}
                      aria-label="Previous place"
                    >
                      <Icon name="chevron-left" className="size-4" />
                    </button>
                    <button
                      type="button"
                      className="grid size-11 place-items-center rounded-full border border-line transition-colors hover:border-aqua hover:bg-aqua hover:text-white"
                      onClick={() => step(1)}
                      aria-label="Next place"
                    >
                      <Icon name="chevron-right" className="size-4" />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </article>
        ) : null}
      </Dialog>

      <Dialog open={tour !== null} onClose={() => setTour(null)} label={tour?.title ?? "360 tour"}>
        <div className="relative size-full bg-abyss">
          {tour ? (
            <iframe
              src={tour.url}
              title={tour.title}
              allow="fullscreen; gyroscope; accelerometer; xr-spatial-tracking"
              allowFullScreen
              className="size-full border-0"
            />
          ) : null}
          <button
            type="button"
            data-autofocus
            onClick={() => setTour(null)}
            aria-label="Close the 360 tour"
            className="wave absolute top-4 right-4 grid size-12 place-items-center rounded-md border border-white/40 glass text-white transition-colors duration-500 [--wave:#fff] hover:text-ink"
          >
            <Icon name="close" className="size-5" />
          </button>
        </div>
      </Dialog>
    </>
  );
}
