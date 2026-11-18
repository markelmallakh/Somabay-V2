import { Suspense } from "react";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/animations/Reveal";
import { PhotoSlider } from "@/components/media/PhotoSlider";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { BookingPanel } from "@/components/sections/activity/BookingPanel";
import { HeadingRow } from "@/components/sections/live/HeadingRow";
import { PhoneEndCta } from "@/components/layout/HeadingRow";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { UnitCard } from "@/components/sections/live/UnitCard";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon, type IconName } from "@/components/ui/Icon";
import { routes } from "@/config/routes";
import { getUnit, units } from "@/content/resale";
import { image } from "@/lib/media";
import { formDefinitions } from "@/lib/forms";
import { pageMetadata } from "@/lib/metadata";

const amenityIcons: Record<string, IconName> = {
  "Beach Front": "umbrella-solid",
  "Wi-Fi": "wifi-solid",
  "Fully Finished": "key-solid",
  "Gym Access": "dumbbell-solid",
  "Medical Center": "medical-solid",
  "Golf Course": "flag-solid",
  "Tennis Court": "sparkle-solid",
  Bazar: "shop-solid",
};

/** The photo beside the reserve form: a sea-view suite. */
const reserveImage = image(
  "/images/resale/reserve-sea-view.webp",
  "A sea-view suite opening onto a terrace over the Red Sea",
);

export function generateStaticParams() {
  return units.map((unit) => ({ slug: unit.slug }));
}

export async function generateMetadata({ params }: PageProps<"/resale/[slug]">): Promise<Metadata> {
  const unit = getUnit((await params).slug);
  if (!unit) return {};
  return pageMetadata({
    title: `${unit.title} in ${unit.neighborhood}`,
    description: `${unit.title} for resale in ${unit.neighborhood}, Somabay — ${unit.bedrooms} bedrooms, ${unit.bathrooms} bathrooms.`,
    path: routes.unit(unit.slug),
    image: unit.images[0],
  });
}

async function UnitContent({ params }: { params: PageProps<"/resale/[slug]">["params"] }) {
  const unit = getUnit((await params).slug);
  if (!unit) notFound();
  const related = units.filter((other) => other.slug !== unit.slug).slice(0, 3);
  const facts: { icon: IconName; label: string }[] = [
    { icon: "bed-min", label: `${unit.bedrooms} ${unit.bedrooms === 1 ? "Bedroom" : "Bedrooms"}` },
    {
      icon: "bath-min",
      label: `${unit.bathrooms} ${unit.bathrooms === 1 ? "Bathroom" : "Bathrooms"}`,
    },
    ...(unit.size ? [{ icon: "area-min" as const, label: `${unit.size} sqm` }] : []),
    { icon: "pin-min", label: unit.neighborhood },
  ];
  // DRAFT COPY: a description built from the unit's details.
  const overview = `A ${unit.bedrooms}-bedroom ${unit.type.toLowerCase()} in ${unit.neighborhood}, Somabay, with ${unit.bathrooms} ${unit.bathrooms === 1 ? "bathroom" : "bathrooms"}${unit.size ? ` and ${unit.size} sqm of living space` : ""}. Bright, open rooms lead out to the light and air of the Red Sea, with the beach, the marina, golf and everyday services all close at hand, ready for holidays or for living at the bay year round.`;
  const specs: { icon: IconName; label: string; value: string }[] = [
    { icon: "bed", label: "Bedrooms", value: String(unit.bedrooms) },
    { icon: "bath", label: "Bathrooms", value: String(unit.bathrooms) },
    { icon: "home", label: "Type", value: unit.type },
    { icon: "pin", label: "Neighborhood", value: unit.neighborhood },
  ];

  const relatedCta = (
    <Button href={routes.resale} variant="outline" icon="arrow-up-right">
      Explore all units
    </Button>
  );
  return (
    <>
      <Section
        spacing="none"
        className="pt-[calc(var(--header-height)+1.25rem)] pb-section sm:pt-[calc(var(--header-height)+2.5rem)]"
        aria-labelledby="page-title"
      >
        <Container>
          <Breadcrumbs
            items={[
              { label: "Live in Somabay", href: routes.resale },
              { label: unit.title, href: routes.unit(unit.slug) },
            ]}
            className="mb-5 sm:mb-8"
          />
          {/* The gallery: a wide slider with thumbnails; a photo opens the full-screen viewer. */}
          <PhotoSlider images={unit.images} label={unit.title} />
          <div className="mt-8 grid gap-10 sm:mt-12 sm:gap-12 lg:mt-14 lg:grid-cols-12 lg:gap-6">
            <div className="flex flex-col gap-10 sm:gap-14 lg:col-span-7">
              <Reveal>
                <div className="flex flex-wrap gap-2">
                  <Chip accent="turquoise">{unit.type}</Chip>
                  <Chip accent="twilight">{unit.neighborhood}</Chip>
                </div>
                <h1 id="page-title" className="mt-3 text-heading-2 sm:mt-5">
                  {unit.title}
                </h1>
                {/* The key facts in one quiet row under the name. */}
                <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-line py-4 text-body-sm text-ink sm:mt-6 sm:flex sm:flex-wrap sm:items-center sm:gap-x-8 sm:py-5 sm:text-body-md">
                  {facts.map((fact) => (
                    <li key={fact.label} className="flex items-center gap-2.5">
                      <Icon name={fact.icon} strokeWidth={1.5} className="size-5 text-turquoise" />
                      {fact.label}
                    </li>
                  ))}
                </ul>
              </Reveal>

              {/* Overview. DRAFT COPY: written from the unit's details until each listing has its
                  own description. */}
              <Reveal className="flex flex-col">
                <div className="flex flex-col gap-2 lg:gap-3">
                  <Eyebrow>Overview</Eyebrow>
                  <h2 className="text-heading-4">{`Your ${unit.type.toLowerCase()} in ${unit.neighborhood}`}</h2>
                </div>
                <p className="mt-3 max-w-2xl text-body-md leading-relaxed text-slate sm:mt-4">
                  {overview}
                </p>
              </Reveal>

              {/* Amenities: a clean two-column list, each with its icon, between hairlines. */}
              <Reveal className="flex flex-col gap-5 sm:gap-6">
                <div className="flex flex-col gap-2 lg:gap-3">
                  <Eyebrow>Amenities</Eyebrow>
                  <h2 className="text-heading-4">What comes with it</h2>
                </div>
                <ul className="grid grid-cols-2 gap-x-4 border-t border-line sm:gap-x-10">
                  {unit.amenities.map((amenity) => (
                    <li
                      key={amenity}
                      className="flex items-center gap-3 border-b border-line py-3 text-body-sm text-ink sm:gap-4 sm:py-4 sm:text-body-md"
                    >
                      <Icon
                        name={amenityIcons[amenity] ?? "check-solid"}
                        className="size-5 shrink-0 text-turquoise sm:size-5.5"
                      />
                      {amenity}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <aside className="lg:col-span-4 lg:col-start-9">
              <div className="flex flex-col gap-5 rounded-md border border-ink/8 bg-white p-5 shadow-[0_18px_48px_-28px_rgb(15_30_53/0.2)] sm:p-6 md:p-8 lg:sticky lg:top-[calc(var(--header-height)+2rem)]">
                <div className="flex flex-col gap-1">
                  <p className="text-body-xs font-semibold tracking-label text-slate uppercase">
                    For resale
                  </p>
                  <p className="font-serif text-heading-5">{unit.title}</p>
                </div>
                <dl className="divide-y divide-line border-y border-line">
                  {specs.map((spec) => (
                    <div key={spec.label} className="flex items-center justify-between gap-4 py-3">
                      <dt className="flex items-center gap-2 text-body-sm text-slate">
                        <Icon name={spec.icon} className="size-4.5" />
                        {spec.label}
                      </dt>
                      <dd className="text-body-sm font-semibold">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
                <Button href="#booking" variant="primary" className="w-full">
                  Request a call
                </Button>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      {/* The enquiry, in the site's booking layout: the home's photo with the form beside it. */}
      <BookingPanel
        eyebrow="Request a call"
        title="Reserve Your Home"
        description="Connect with our team and take the next step towards living in Somabay."
        image={reserveImage}
        definition={formDefinitions.unit}
        context={`${unit.title} — ${unit.neighborhood}`}
      />

      <Section aria-labelledby="related-title" className="bg-sand-100">
        <Container>
          <HeadingRow
            id="related-title"
            title="You May Also Like"
            aside={<div className="flex lg:w-full lg:justify-end">{relatedCta}</div>}
          />
          {/* Phones: a swipe row, the card centred with its neighbours peeking. */}
          <RevealGroup
            as="ul"
            className="mt-6 max-md:swipe-row sm:mt-10 md:grid md:grid-cols-2 md:gap-5 lg:mt-12 lg:grid-cols-3"
          >
            {related.map((other) => (
              <RevealItem as="li" key={other.slug}>
                <UnitCard unit={other} href={routes.unit(other.slug)} />
              </RevealItem>
            ))}
          </RevealGroup>
          <PhoneEndCta>{relatedCta}</PhoneEndCta>
        </Container>
      </Section>
    </>
  );
}

export default function UnitPage({ params }: PageProps<"/resale/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <UnitContent params={params} />
    </Suspense>
  );
}
