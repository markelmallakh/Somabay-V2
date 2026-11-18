import { routes } from "@/config/routes";
import { journalIntro } from "@/content/home";
import { articles } from "@/content/journal";
import { Container } from "@/components/layout/Container";
import { Reveal, RevealGroup, RevealItem } from "@/components/animations/Reveal";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { PostBadge } from "@/components/ui/PostBadge";
import { SmartLink } from "@/components/ui/SmartLink";

const date = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** Journal: a centred heading, the three latest stories in a row, and "Read more" under them. */
export function JournalSection() {
  return (
    <section
      aria-labelledby="journal-title"
      data-theme-surface="light"
      className="bg-sand-100 py-section text-ink"
    >
      <Container className="flex flex-col gap-8 sm:gap-12">
        {/* The eyebrow and title centred over the stories. */}
        <Reveal className="flex flex-col items-center gap-4 text-center">
          <Eyebrow className="mx-auto">{journalIntro.eyebrow}</Eyebrow>
          <h2 id="journal-title" className="text-heading-2">
            {journalIntro.title}
          </h2>
        </Reveal>

        {/* Phones: a swipe row with the next story peeking in, the button after it. */}
        <RevealGroup as="ul" className="max-md:swipe-row md:grid md:grid-cols-3 md:gap-6">
          {articles.slice(0, 3).map((article) => (
            <RevealItem as="li" key={article.slug}>
              <SmartLink
                href={routes.article(article.slug)}
                className="group flex flex-col gap-4 sm:gap-6"
              >
                <span className="relative block aspect-[448/300] overflow-hidden rounded-md">
                  <ResponsiveImage
                    asset={article.image}
                    sizes="(min-width: 768px) 30vw, 85vw"
                    fill
                    className="transition-transform duration-[1600ms] ease-out-expo group-hover:scale-[1.05]"
                  />
                  <PostBadge category={article.category} />
                </span>
                <span className="flex flex-col gap-3 sm:gap-4">
                  <span className="flex items-center gap-3 text-body-sm text-slate">
                    <span>{date.format(new Date(article.date))}</span>
                    <span aria-hidden>·</span>
                    <span>{article.readingMinutes} min read</span>
                  </span>
                  <span className="font-serif text-heading-6 leading-[1.25]">{article.title}</span>
                  <span className="inline-flex items-center gap-2 text-body-xs font-semibold tracking-label text-turquoise uppercase">
                    {journalIntro.itemCtaLabel}
                    <Icon
                      name="arrow-right"
                      className="size-4 transition-transform duration-700 ease-out-expo group-hover:translate-x-1"
                    />
                  </span>
                </span>
              </SmartLink>
            </RevealItem>
          ))}
        </RevealGroup>
        {/* A plain outlined pill under the stories, with no arrow chip. */}
        <Button href={journalIntro.cta.href} variant="outline" icon={null} className="self-center">
          {journalIntro.cta.label}
        </Button>
      </Container>
    </section>
  );
}
