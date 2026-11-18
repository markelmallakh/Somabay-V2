import { academy, coursesIntro, golfLeisure, teeBooking } from "@/content/golf";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { ImageReveal } from "@/components/animations/ImageReveal";
import { Reveal } from "@/components/animations/Reveal";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { LeadershipGrid } from "@/components/sections/about/LeadershipGrid";
import { BookingPanel } from "@/components/sections/activity/BookingPanel";
import { InfoRows } from "@/components/sections/activity/InfoRows";
import { LocationExplorer } from "@/components/sections/live/LocationExplorer";
import { HeadingRow } from "@/components/sections/things-to-do/HeadingRow";
import { CoursesStack } from "./CoursesStack";

export { GolfOverview } from "./GolfOverview";

export function CoursesSection() {
  return (
    <Section
      id="courses"
      tone="white"
      aria-labelledby="courses-title"
      className="scroll-mt-(--header-height) bg-sand-100"
    >
      <Container>
        <HeadingRow
          id="courses-title"
          title={coursesIntro.title}
          description={coursesIntro.description}
        />
        <div className="mt-6 sm:mt-12 lg:mt-16">
          <CoursesStack />
        </div>
      </Container>
    </Section>
  );
}

/** Golf leisure, in the Spa treatments layout; tee times are booked on the golf club's site. */
export function GolfLeisureSection() {
  return (
    <InfoRows
      id="golf-leisure-title"
      eyebrow={golfLeisure.eyebrow}
      title={golfLeisure.title}
      items={golfLeisure.items}
      aside={
        <Button
          href={golfLeisure.aside.href}
          external
          variant="outline"
          icon="arrow-up-right"
          className="border-deep text-turquoise"
        >
          {golfLeisure.aside.label}
        </Button>
      }
    />
  );
}

export function AcademySection() {
  return (
    <Section
      id="academy"
      tone="white"
      aria-labelledby="academy-title"
      className="scroll-mt-(--header-height)"
    >
      <Container>
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-6">
          <ImageReveal from="left" className="relative aspect-[4/3] rounded-md lg:col-span-6">
            <div className="absolute inset-0">
              <ResponsiveImage asset={academy.image} sizes="(min-width: 1024px) 46vw, 100vw" fill />
            </div>
          </ImageReveal>
          <div className="lg:col-span-6 lg:col-start-7 lg:pl-8 xl:pl-12">
            <Reveal>
              <Eyebrow>Learn &amp; Improve</Eyebrow>
              <h2 id="academy-title" className="mt-2 text-heading-2 lg:mt-3">
                {academy.intro.title}
              </h2>
              <p className="mt-3 text-body-md text-slate sm:mt-5">{academy.intro.description}</p>
            </Reveal>
            <Reveal delay={0.1} className="max-sm:text-center">
              <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-5 sm:mt-8 sm:gap-6 sm:pt-6">
                {academy.facts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="text-body-xs tracking-label text-slate uppercase">
                      {fact.label}
                    </dt>
                    <dd className="mt-1 text-body-sm font-semibold">{fact.value}</dd>
                  </div>
                ))}
              </dl>
              {/* The academy's own page on the Somabay Golf website, in a new tab. */}
              <Button
                href="https://somabaygolf.com/en/Golf-Academy"
                external
                variant="outline"
                size="sm"
                icon="arrow-up-right"
                className="mt-8 border-deep text-turquoise"
                aria-label="Know more about the Golf Academy on the Somabay Golf website"
              >
                Know more
              </Button>
            </Reveal>
          </div>
        </div>

        {/* Phones: a divider and more room between the academy and its pros. */}
        {/* Its own section, so the bar's "Pros" tab lands on this heading. */}
        <section
          aria-labelledby="pros-title"
          className="mt-section max-sm:mt-12 max-sm:border-t max-sm:border-line max-sm:pt-12"
        >
          <HeadingRow
            id="pros-title"
            eyebrow="Our professionals"
            title="Golf Academy Pros"
            description={academy.prosIntro}
            as="h3"
          />
        </section>
      </Container>
      {/* Full width so the carousel aligns itself to the site grid, as on the About page. */}
      <Reveal className="mt-6 sm:mt-10 lg:mt-12">
        <LeadershipGrid leaders={academy.pros} fit label="Golf Academy pros" />
      </Reveal>
    </Section>
  );
}

/** Where the academy is, with distances to the hotels and landmarks around it. */
export function AcademyLocationSection() {
  return (
    <Section
      id="academy-location"
      tone="white"
      aria-labelledby="academy-location-title"
      className="scroll-mt-(--header-height) pt-0"
    >
      <Container>
        <HeadingRow
          id="academy-location-title"
          eyebrow="Location"
          title="Finding the Academy"
          description="The academy sits by the clubhouse of the Gary Player course, a short drive from every hotel on the peninsula."
        />
        <Reveal className="mt-6 sm:mt-10 lg:mt-12">
          <LocationExplorer origin={academy.origin} destinations={academy.destinations} fitTight />
        </Reveal>
      </Container>
    </Section>
  );
}

/** Booking: rates, contacts and a Book now link to the golf club's booking page. */
export function TeeBookingSection() {
  return (
    <BookingPanel
      eyebrow={teeBooking.eyebrow}
      title={teeBooking.title}
      description={teeBooking.description}
      image={teeBooking.image}
    >
      {/* Left-aligned rows (the heading above centres on phones), value under its label. */}
      <dl className="mt-6 border-t border-line text-left sm:mt-8">
        {teeBooking.contacts.map((contact) => (
          <div
            key={contact.label}
            // Phones: label over value, so long emails never push the card wider.
            className="flex flex-col gap-1 border-b border-line py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-4"
          >
            <dt className="flex items-center gap-3 text-body-md text-slate">
              <Icon name={contact.icon} className="size-4.5 shrink-0 text-turquoise" />
              {contact.label}
            </dt>
            <dd className="min-w-0 pl-7.5 text-body-md font-semibold break-words text-ink sm:pl-0 sm:text-right">
              {"href" in contact && contact.href ? (
                <a
                  href={contact.href}
                  {...(contact.href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="link-underline"
                >
                  {contact.value}
                </a>
              ) : (
                contact.value
              )}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 sm:mt-8">
        <Button href={teeBooking.cta.href} external variant="primary" icon="arrow-up-right">
          {teeBooking.cta.label}
        </Button>
      </div>
    </BookingPanel>
  );
}
