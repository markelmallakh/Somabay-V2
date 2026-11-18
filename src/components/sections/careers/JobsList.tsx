import Link from "next/link";
import { routes } from "@/config/routes";
import { jobs } from "@/content/careers";
import { Container } from "@/components/layout/Container";
import { Reveal, RevealGroup, RevealItem } from "@/components/animations/Reveal";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * Open positions as ruled rows (the Spa treatments layout, without photos): the role on the left
 * with its department and location under it, a turquoise-bordered Apply Now on the right.
 */
export function JobsList() {
  return (
    <section aria-labelledby="jobs-title" className="bg-white py-section text-ink">
      <Container>
        <Reveal className="flex flex-col gap-2 lg:gap-3">
          <Eyebrow>Open positions</Eyebrow>
          <h2 id="jobs-title" className="text-heading-2">
            Find Your Next Opportunity
          </h2>
        </Reveal>
        <RevealGroup as="ul" className="mt-6 border-t border-line sm:mt-10 md:mt-12">
          {jobs.map((job) => (
            <RevealItem as="li" key={job.slug} className="border-b border-line">
              <article className="group relative flex flex-col gap-4 py-5 sm:gap-5 sm:py-7 md:flex-row md:items-center md:justify-between md:gap-10 md:py-8">
                <div className="flex flex-col gap-1.5 sm:gap-2">
                  <h3 className="font-serif text-heading-4">
                    <Link
                      href={routes.career(job.slug)}
                      className="transition-colors group-hover:text-turquoise-160 after:absolute after:inset-0"
                    >
                      {job.title}
                    </Link>
                  </h3>
                  <p className="text-body-md text-slate">
                    {job.department}, {job.location}
                  </p>
                </div>
                <Button
                  href={`${routes.career(job.slug)}#apply`}
                  variant="outline"
                  icon="arrow-up-right"
                  className="relative z-10 shrink-0 self-start border-deep text-turquoise md:self-center"
                  aria-label={`Apply now for ${job.title}`}
                >
                  Apply now
                </Button>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
