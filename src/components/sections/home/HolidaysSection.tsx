import { holidaysIntro } from "@/content/home";
import { hotelHref, hotelPrice, hotels, hotelThemes } from "@/content/hotels";
import { HotelsShowcase } from "./HotelsShowcase";

const themeLabel = new Map(hotelThemes.map((theme) => [theme.value, theme.label]));

/** Every stay, the hotels and Stayr (home rentals). */
const showcased = hotels;

/** Book Stay: a framed spotlight of one stay at a time, with a picker for every stay. */
export function HolidaysSection() {
  return (
    <section
      aria-labelledby="holidays-title"
      data-theme-surface="light"
      className="relative bg-white text-ink"
    >
      <HotelsShowcase
        hotels={showcased.map((hotel) => ({
          slug: hotel.slug,
          name: hotel.name,
          tagline: hotel.tagline,
          stars: hotel.stars,
          description: hotel.description,
          // The official photos exported from each hotel's own website (hotel-details.ts).
          image: hotel.gallery[0] ?? hotel.images[0],
          gallery: hotel.gallery.slice(0, 6),
          href: hotelHref(hotel),
          // "Starting from": the hotel's rate, or the placeholder until live rates are connected.
          price: hotelPrice(hotel),
          // The hotel's own amenities, as listed on its website.
          amenities: (hotel.amenities ?? []).slice(0, 6),
          tags: [hotel.tagline, ...hotel.themes.map((theme) => themeLabel.get(theme) ?? theme)]
            .filter((tag, index, all) => all.indexOf(tag) === index)
            .slice(0, 2),
        }))}
        ctaLabel={holidaysIntro.itemCtaLabel}
        titleId="holidays-title"
        eyebrow={holidaysIntro.eyebrow}
        title={holidaysIntro.title}
        description={holidaysIntro.description}
        cta={holidaysIntro.cta}
      />
    </section>
  );
}
