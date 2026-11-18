"use client";

import type { CSSProperties } from "react";
import type { DirectoryItem } from "@/types/content";
import { MediaSlider } from "@/components/media/MediaSlider";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Dialog } from "@/components/ui/Dialog";
import { DrawerSteppers } from "@/components/ui/DrawerSteppers";
import { Icon } from "@/components/ui/Icon";
import { SmartLink } from "@/components/ui/SmartLink";
import { PriceFrom } from "@/components/ui/PriceFrom";
import { StarChip } from "@/components/sections/holidays/StarChip";

type DetailDrawerProps = {
  items: DirectoryItem[];
  /** Index of the open item, or null when closed. */
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

const stagger = (index: number) => ({ "--i": index }) as CSSProperties;

/** Side drawer with an image slider and details; steps through the items it was opened from. */
export function DetailDrawer({ items, index, onClose, onNavigate }: DetailDrawerProps) {
  const item = index === null ? null : items[index];
  const position = index ?? 0;
  const count = items.length;
  // On a page with a booking form (#booking), every drawer offers Book now, gliding down to it.
  // The drawer only opens in the browser, so the page can be checked while it renders.
  const hasBooking =
    item !== null && typeof document !== "undefined" && Boolean(document.getElementById("booking"));
  const action =
    item?.action ?? (hasBooking ? { label: "Book now", href: "#booking", external: false } : null);

  return (
    <>
      <Dialog
        open={item !== null}
        onClose={onClose}
        label={item?.title ?? "Details"}
        variant="drawer"
        // Wide enough for the hours, phones and directions to sit on one line.
        drawerWidth="max-w-[52rem]"
        // Previous / next stacked outside the drawer's edge, clear of the content.
        outside={<DrawerSteppers position={position} count={count} onNavigate={onNavigate} />}
      >
        {item ? (
          <article key={item.id} className="flex min-h-full flex-col">
            <div className="relative">
              <MediaSlider
                key={item.id}
                images={item.images}
                sizes="(min-width: 832px) 832px, 100vw"
                label={`${item.title} photos`}
                // Shorter on wide screens, and never more than about a third of the screen, so the details
                // below fit without scrolling where possible.
                className="aspect-[16/10] md:aspect-auto md:h-[min(34svh,24rem)]"
              />
              <button
                type="button"
                onClick={onClose}
                className="wave absolute top-5 left-5 z-20 grid size-12 place-items-center rounded-md bg-white text-ink shadow-float transition-colors duration-500 hover:text-white md:hidden"
                aria-label="Close"
              >
                <Icon name="close" className="size-5" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-5 p-6 md:p-10">
              {/* The name (with a hotel's star rating beside it), then its tags under it. */}
              <div data-drawer-item style={stagger(0)} className="flex flex-col gap-2">
                <h2 className="text-heading-2">
                  {item.title}
                  {item.badges?.stars ? (
                    <StarChip
                      count={item.badges.stars}
                      className="relative -top-[0.2em] ml-3 align-middle"
                    />
                  ) : null}
                </h2>
                {item.kicker ? <p className="text-body-md text-slate">{item.kicker}</p> : null}
              </div>
              {item.badges?.tags.length ? (
                <ul data-drawer-item style={stagger(1)} className="flex flex-wrap gap-2">
                  {item.badges.tags.map((tag) => (
                    <li key={tag}>
                      <Chip>{tag}</Chip>
                    </li>
                  ))}
                </ul>
              ) : item.chip ? (
                <p data-drawer-item style={stagger(1)}>
                  <Chip>{item.chip}</Chip>
                </p>
              ) : null}
              {item.location ? (
                <p
                  data-drawer-item
                  style={stagger(2)}
                  className="flex items-center gap-2 text-body-sm text-slate"
                >
                  <Icon name="pin-solid" className="size-4 text-turquoise" />
                  {item.location}
                </p>
              ) : null}
              {item.description ? (
                <p
                  data-drawer-item
                  style={stagger(3)}
                  className="max-w-2xl text-body-md leading-relaxed whitespace-pre-line text-slate"
                >
                  {item.description}
                </p>
              ) : null}
              {item.price ? (
                <div data-drawer-item style={stagger(4)} className="border-t border-line pt-5">
                  <PriceFrom amount={item.price} />
                </div>
              ) : null}
              {action || item.secondaryAction || item.menuUrl ? (
                <div data-drawer-item style={stagger(4)} className="flex flex-wrap gap-3">
                  {action ? (
                    <Button
                      href={action.href}
                      external={action.external}
                      variant="primary"
                      icon="chevron-right"
                      // A link to a section of this page closes the drawer as the page glides there.
                      onClick={action.href.includes("#") ? onClose : undefined}
                    >
                      {action.label}
                    </Button>
                  ) : null}
                  {item.secondaryAction ? (
                    <Button
                      href={item.secondaryAction.href}
                      external={item.secondaryAction.external}
                      variant="outline"
                      icon={item.secondaryAction.external ? "arrow-up-right" : "chevron-right"}
                      className="border-deep text-turquoise-160"
                    >
                      {item.secondaryAction.label}
                    </Button>
                  ) : null}
                  {item.menuUrl ? (
                    // The venue's menu, opened in a new tab.
                    <Button
                      href={item.menuUrl}
                      external
                      variant="outline"
                      icon="arrow-up-right"
                      className="border-deep text-turquoise-160"
                    >
                      View menu
                    </Button>
                  ) : null}
                </div>
              ) : null}

              <div
                data-drawer-item
                style={stagger(5)}
                className="mt-auto flex flex-col gap-6 border-t border-line pt-6 md:flex-row md:items-center md:justify-between"
              >
                <ul className="flex flex-wrap items-center gap-x-8 gap-y-3 text-body-sm text-slate">
                  {item.hours ? (
                    <li className="flex items-center gap-2">
                      <Icon name="clock-solid" className="size-4.5 text-turquoise" />
                      {item.hours}
                    </li>
                  ) : null}
                  {item.phones?.map((phone) => (
                    <li key={phone}>
                      <a
                        href={`tel:${phone.replace(/\s/g, "")}`}
                        className="flex items-center gap-2 hover:text-ink"
                      >
                        <Icon name="phone-solid" className="size-4.5 text-turquoise" />
                        {phone}
                      </a>
                    </li>
                  ))}
                  {item.infoLink ? (
                    <li>
                      <SmartLink
                        href={item.infoLink.href}
                        external={item.infoLink.external}
                        className="flex items-center gap-2 font-semibold tracking-label text-ink uppercase hover:text-lagoon"
                      >
                        <Icon name="directions-solid" className="size-4.5 text-turquoise" />
                        {item.infoLink.label}
                      </SmartLink>
                    </li>
                  ) : null}
                </ul>
              </div>
            </div>
          </article>
        ) : null}
      </Dialog>
    </>
  );
}
