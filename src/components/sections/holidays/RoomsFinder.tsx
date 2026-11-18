"use client";

import { useState } from "react";
import type { HotelRoom } from "@/types/content";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { PriceFrom } from "@/components/ui/PriceFrom";
import { PRICE_PLACEHOLDER } from "@/lib/price";
import { type FilterState, matchesFilters } from "@/components/ui/FilterPanel";
import { MobileFilters } from "./MobileFilters";
import { Icon, type IconName } from "@/components/ui/Icon";
import { AmenityIcon } from "@/components/ui/AmenityIcon";

const viewLabel: Record<HotelRoom["view"], string> = {
  sea: "Sea View",
  pool: "Pool View",
  garden: "Garden View",
  golf: "Golf View",
  marina: "Marina View",
};

const typeLabel: Record<HotelRoom["type"], string> = {
  room: "Room",
  suite: "Suite",
  apartment: "Apartment",
  townhouse: "Townhouse",
  cabana: "Cabana",
};

const viewOptions = [
  { value: "marina", label: "Marina view" },
  { value: "sea", label: "Sea view" },
  { value: "pool", label: "Pool view" },
  { value: "garden", label: "Garden view" },
  { value: "golf", label: "Golf view" },
];

/** Filters offer only the types and views this hotel (or rental) actually has. */
const filterGroups = (rooms: HotelRoom[]) => [
  {
    id: "type",
    label: "Type",
    options: (Object.keys(typeLabel) as HotelRoom["type"][])
      .filter((type) => rooms.some((room) => room.type === type))
      .map((type) => ({ value: type, label: typeLabel[type] })),
  },
  {
    id: "view",
    label: "View",
    options: viewOptions.filter((option) => rooms.some((room) => room.view === option.value)),
  },
];

/** Rentals: "1 Bedroom" / "Studio", and the floor area. */
const bedroomsLabel = (bedrooms: number) =>
  bedrooms === 0 ? "Studio" : `${bedrooms} ${bedrooms === 1 ? "Bedroom" : "Bedrooms"}`;

/** Guest label and icon: one guest is Single, two are 2 Persons, three or more are Family. */
const occupancy = (guests: number): { label: string; icon: IconName } =>
  guests <= 1
    ? { label: "Single", icon: "user" }
    : guests === 2
      ? { label: "2 Persons", icon: "users" }
      : { label: "Family", icon: "family" };

export function RoomsFinder({
  rooms,
  bookingHref,
  rental = false,
}: {
  rooms: HotelRoom[];
  bookingHref?: string;
  /** Home rentals: guest count as "Up to N guests", with bedrooms and floor area. */
  rental?: boolean;
}) {
  const [filters, setFilters] = useState<FilterState>({});
  const groups = filterGroups(rooms);
  const visible = rooms.filter((room) =>
    matchesFilters({ type: [room.type], view: [room.view] }, filters),
  );

  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-[20rem_1fr] lg:gap-8">
      <div className="max-md:hidden lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:self-start">
        {/* Phones: no filters here (the rooms swipe, and the booking bar holds the foot). */}
        <MobileFilters groups={groups} value={filters} onChange={setFilters} phoneChip={false} />
      </div>
      {/* Phones: compact room cards in a swipe row, about one and a half to a screen, instead of a
          long stack. */}
      <ul className="flex max-sm:swipe-row-half sm:flex-col sm:gap-4 md:gap-5" aria-live="polite">
        {visible.map((room) => (
          <li key={room.name}>
            <article className="group grid h-full grid-rows-[auto_1fr] overflow-hidden rounded-md bg-white sm:grid-cols-[1fr_17rem] sm:grid-rows-none">
              <div className="flex flex-col gap-3 p-3.5 sm:gap-5 sm:p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h3 className="font-serif text-body-lg leading-tight sm:text-heading-5">
                    {room.name}
                  </h3>
                  <Chip accent="twilight">
                    <Icon name={occupancy(room.guests).icon} className="size-3.5" />
                    {rental ? `Up to ${room.guests} guests` : occupancy(room.guests).label}
                  </Chip>
                </div>
                {rental && (room.bedrooms !== undefined || room.size) ? (
                  <p className="-mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-body-xs text-slate sm:-mt-2 sm:text-body-sm">
                    {room.bedrooms !== undefined ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="bed-min" strokeWidth={1.5} className="size-4 text-ink" />
                        {bedroomsLabel(room.bedrooms)}
                      </span>
                    ) : null}
                    {room.size ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="area-min" strokeWidth={1.5} className="size-4 text-ink" />
                        {room.size} m²
                      </span>
                    ) : null}
                  </p>
                ) : null}
                {/* The room's view first, then what's in the room (phones: the first four, as
                    small icons in a row). */}
                <ul className="grid grid-cols-4 gap-1 sm:flex sm:flex-wrap sm:gap-x-6 sm:gap-y-4">
                  {[viewLabel[room.view], ...room.amenities].map((amenity, index) => (
                    <li
                      key={amenity}
                      className={cn(
                        "flex flex-col items-center gap-0.5 text-center text-[0.5625rem] leading-tight text-slate sm:gap-1.5 sm:text-body-xs",
                        index > 3 && "max-sm:hidden",
                      )}
                    >
                      <AmenityIcon amenity={amenity} className="size-3.5 text-ink sm:size-4.5" />
                      {amenity}
                    </li>
                  ))}
                </ul>
                {bookingHref ? (
                  // Phones: the price, then Book now on the right; larger screens: Book now first.
                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3 sm:flex-wrap sm:justify-start sm:gap-x-5 sm:gap-y-3 sm:border-0 sm:pt-0">
                    <PriceFrom
                      amount={room.priceFrom ?? PRICE_PLACEHOLDER}
                      size="compact"
                      className="sm:order-last"
                    />
                    <Button
                      href={bookingHref}
                      external
                      variant="outline"
                      size="sm"
                      aria-label={`Book the ${room.name}`}
                      className="self-auto text-turquoise-160"
                    >
                      Book now
                    </Button>
                  </div>
                ) : null}
              </div>
              <div className="relative order-first aspect-[4/3] overflow-hidden sm:order-none sm:aspect-auto sm:min-h-56">
                <ResponsiveImage
                  asset={room.image}
                  sizes="(min-width: 640px) 17rem, 62vw"
                  fill
                  className="transition-transform duration-[1600ms] ease-out-expo group-hover:scale-[1.05]"
                />
              </div>
            </article>
          </li>
        ))}
        {visible.length === 0 ? (
          <li className="w-full shrink-0 rounded-md bg-white p-6 text-center text-slate sm:p-10">
            {rental ? "No homes match these filters." : "No rooms match these filters."}
          </li>
        ) : null}
      </ul>
    </div>
  );
}
