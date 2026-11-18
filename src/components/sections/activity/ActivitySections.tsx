import type { ActivityDetail } from "@/content/things-to-do";
import type { ActivitySections as Sections } from "@/content/activity-sections";
import { routes } from "@/config/routes";
import { formDefinitions } from "@/lib/forms";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/animations/Reveal";
import { ScrollRevealText } from "@/components/animations/ScrollRevealText";
import { GalleryCarousel } from "@/components/media/GalleryCarousel";
import { ScrollExpandVideo } from "@/components/media/ScrollExpandVideo";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { HeadingRow } from "@/components/sections/things-to-do/HeadingRow";
import { BookingPanel } from "./BookingPanel";
import { InfoRows } from "./InfoRows";
import { PackagesGrid } from "./PackagesGrid";
import { VenueSlider } from "./VenueSlider";

/**
 * The body of every Things To Do activity page, one template for all of them (first built for
 * Spa & Thalasso), in this order:
 *
 * 1. the overview statement with the page's call to action,
 * 2. information rows (the treatments layout),
 * 3. the venue slider with side drawers,
 * 4. a film that grows to fill the screen,
 * 5. packages on deep turquoise,
 * 6. the gallery,
 * 7. the booking section and its form.
 *
 * A page skips any section it has no content for.
 */
export function ActivitySections({
  activity,
  sections,
}: {
  activity: ActivityDetail;
  sections: Sections;
}) {
  const { cta, rows, venues, film, packages, booking } = sections;

  return (
    <>
      <Section tone="white" aria-label={`${activity.title} overview`}>
        <Container>
          <Eyebrow>{sections.overviewEyebrow ?? "Overview"}</Eyebrow>
          <ScrollRevealText
            text={sections.overview ?? activity.summary}
            leadWords={12}
            className="mt-2 max-w-3xl font-sans text-[clamp(1.125rem,1rem+0.45vw,1.375rem)] leading-[1.55] lg:mt-3"
          />
          {/* The page's call to action sits under the overview (the hero carries only the title). */}
          <Reveal className="mt-6 sm:mt-10">
            <Button href={cta?.href ?? routes.contact} variant="primary">
              {cta?.label ?? "Let’s talk"}
            </Button>
          </Reveal>
        </Container>
      </Section>

      {rows ? (
        <InfoRows
          id="rows-title"
          eyebrow={rows.eyebrow}
          title={rows.title}
          items={rows.items}
          aside={
            rows.aside ? (
              <Button
                href={rows.aside.href}
                variant="outline"
                icon="download"
                className="border-deep text-turquoise"
                // Downloads only once a real PDF is linked (a "#" placeholder would save the page).
                download={rows.aside.href.endsWith(".pdf") || undefined}
              >
                {rows.aside.label}
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {venues ? (
        <VenueSlider
          id="venues-title"
          eyebrow={venues.eyebrow}
          title={venues.title}
          description={venues.description}
          items={venues.items}
        />
      ) : null}

      {film ? (
        <ScrollExpandVideo
          id="film-title"
          video={film.video}
          eyebrow={film.eyebrow}
          title={film.title}
          description={film.description}
          action={
            film.cta ? (
              <Button href={film.cta.href} variant="primary">
                {film.cta.label}
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {/* Packages on deep turquoise: cards with a framed photo, rising in one after another.
          No prices (confirmed at booking). */}
      {packages ? (
        <Section
          tone="abyss"
          aria-labelledby="packages-title"
          className="overflow-hidden bg-turquoise-160"
        >
          <Container>
            <HeadingRow
              id="packages-title"
              tone="light"
              title={packages.title}
              description={packages.description}
            />
          </Container>
          <PackagesGrid packages={packages.items} label={packages.title} />
        </Section>
      ) : null}

      {/* The gallery always comes last, right before the booking form. */}
      <Section tone="white" aria-labelledby="gallery-title" className="overflow-hidden">
        <Container>
          <HeadingRow
            id="gallery-title"
            eyebrow="Gallery"
            title={sections.galleryTitle ?? `${activity.title} in Pictures`}
          />
        </Container>
        <GalleryCarousel
          images={activity.gallery}
          label={`${activity.title} gallery`}
          className="mt-6 sm:mt-12"
        />
      </Section>

      {booking ? (
        <BookingPanel
          eyebrow={booking.eyebrow}
          title={booking.title}
          description={booking.description}
          image={booking.image}
          contacts={booking.contacts}
          definition={formDefinitions[booking.formId]}
          context={activity.title}
          tone={booking.tone}
        />
      ) : null}
    </>
  );
}
