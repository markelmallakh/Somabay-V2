import Link from "next/link";
import { routes } from "@/config/routes";
import { homeEvents } from "@/content/events";
import { eventsIntro as defaultIntro } from "@/content/home";
import type { Cta, EventItem, SectionIntro } from "@/types/content";
import type { ImageAsset } from "@/types/media";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { RevealGroup, RevealItem } from "@/components/animations/Reveal";
import { ImageReveal } from "@/components/animations/ImageReveal";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { TextLink } from "@/components/ui/TextLink";

const day = new Intl.DateTimeFormat("en-US", { day: "2-digit", timeZone: "UTC" });
const monthYear = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function EventDate({ event }: { event: EventItem }) {
  const start = new Date(event.start);
  const end = event.end ? new Date(event.end) : null;
  return (
    <p className="flex w-26 shrink-0 flex-col items-center text-center md:w-36">
      <span className="font-serif text-heading-6 leading-none whitespace-nowrap md:text-heading-5">
        <time dateTime={event.start}>{day.format(start)}</time>
        {end ? (
          <>
            {" – "}
            <time dateTime={event.end}>{day.format(end)}</time>
          </>
        ) : null}
      </span>
      <span className="mt-2 text-body-sm text-slate">{monthYear.format(start)}</span>
    </p>
  );
}

/** "25 – 27 Sep 2026" on one line, for the compact rows. */
function EventDateLine({ event }: { event: EventItem }) {
  const start = new Date(event.start);
  const end = event.end ? new Date(event.end) : null;
  return (
    <>
      <time dateTime={event.start}>{day.format(start)}</time>
      {end ? (
        <>
          {" – "}
          <time dateTime={event.end}>{day.format(end)}</time>
        </>
      ) : null}{" "}
      {monthYear.format(start)}
    </>
  );
}

type EventsSectionProps = {
  intro?: SectionIntro & { cta: Cta; itemCtaLabel: string; image: ImageAsset };
  items?: EventItem[];
  id?: string;
  /** Show each event's photo as a thumbnail at the start of its row. */
  thumbnails?: boolean;
};

export function EventsSection({
  intro = defaultIntro,
  items = homeEvents,
  id,
  thumbnails = false,
}: EventsSectionProps) {
  const eventsIntro = intro;
  return (
    <Section
      id={id}
      aria-labelledby="events-title"
      className={id ? "scroll-mt-(--header-height)" : undefined}
    >
      <Container className="grid gap-4 lg:grid-cols-12">
        <ImageReveal className="relative min-h-[28rem] rounded-md text-white lg:col-span-5">
          <div className="absolute inset-0">
            <ResponsiveImage
              asset={eventsIntro.image}
              sizes="(min-width: 1024px) 40vw, 100vw"
              fill
            />
          </div>
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(0_0_0/0.55)_0%,rgb(0_0_0/0.2)_38%,rgb(0_0_0/0)_58%,rgb(0_0_0/0.4)_100%)]"
          />
          <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-10">
            <div>
              <Eyebrow tone="dark">{eventsIntro.eyebrow}</Eyebrow>
              <h2 id="events-title" className="mt-4 max-w-sm text-heading-2">
                {eventsIntro.title}
              </h2>
            </div>
            <div>
              <Button href={eventsIntro.cta.href} variant="solid-light">
                {eventsIntro.cta.label}
              </Button>
            </div>
          </div>
        </ImageReveal>

        <RevealGroup as="ul" className="flex flex-col gap-3 lg:col-span-7">
          {items.map((event) => (
            <RevealItem as="li" key={event.slug}>
              <article
                className={cn(
                  "group relative flex items-center gap-5 rounded-md border border-line bg-white transition-[border-color,box-shadow] duration-500 hover:border-transparent hover:shadow-card md:gap-8",
                  thumbnails
                    ? // Hover: the row lifts onto a turquoise wash, its title turns turquoise.
                      "p-3 pr-4 transition-[border-color,box-shadow,background-color,translate] hover:-translate-y-0.5 hover:bg-turquoise-5 md:p-4 md:pr-6"
                    : "px-4 py-6 md:px-6 md:py-8",
                )}
              >
                {thumbnails ? (
                  <>
                    <span className="relative hidden aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-md bg-sand-200 sm:block md:w-40">
                      <ResponsiveImage
                        asset={event.image}
                        sizes="10rem"
                        fill
                        className="transition-transform duration-[1600ms] ease-out-expo group-hover:scale-[1.06]"
                      />
                    </span>
                    {/* Compact: the date sits over the title, and a turquoise arrow opens the
                        event (the whole card is its hit area). */}
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <p className="text-body-xs font-semibold tracking-label text-turquoise uppercase">
                        <EventDateLine event={event} />
                      </p>
                      <h3 className="font-serif text-heading-6 leading-[1.2] transition-colors duration-500 group-hover:text-turquoise-160 md:text-heading-5">
                        {event.title}
                      </h3>
                    </div>
                    <Link
                      href={routes.event(event.slug)}
                      aria-label={`${eventsIntro.itemCtaLabel}: ${event.title}`}
                      className="grid size-11 shrink-0 place-items-center rounded-full bg-deep text-white transition-[background-color,scale] duration-500 ease-out-expo group-hover:scale-110 group-hover:bg-turquoise-160 after:absolute after:inset-0 after:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquoise"
                    >
                      <Icon
                        name="arrow-right"
                        className="size-4.5 transition-transform duration-700 ease-out-expo group-hover:translate-x-1"
                      />
                    </Link>
                  </>
                ) : (
                  <>
                    <EventDate event={event} />
                    <span aria-hidden className="h-16 w-px bg-line" />
                    <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                      <h3 className="font-serif text-heading-6 md:text-heading-5">{event.title}</h3>
                      <TextLink
                        href={routes.event(event.slug)}
                        srContext={event.title}
                        className="shrink-0"
                      >
                        {eventsIntro.itemCtaLabel}
                      </TextLink>
                    </div>
                  </>
                )}
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
