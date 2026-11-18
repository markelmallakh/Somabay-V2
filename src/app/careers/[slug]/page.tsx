import { Suspense } from "react";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/animations/Reveal";
import { JobMeta } from "@/components/sections/careers/JobMeta";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { routes } from "@/config/routes";
import { applicationEmail, applyHref, getJob, jobs } from "@/content/careers";
import { pageMetadata } from "@/lib/metadata";

export function generateStaticParams() {
  return jobs.map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/careers/[slug]">): Promise<Metadata> {
  const job = getJob((await params).slug);
  if (!job) return {};
  return pageMetadata({
    title: job.title,
    description: job.summary,
    path: routes.career(job.slug),
  });
}

/** One titled list on the job page (About the Role, Requirements, Benefits & Privileges). */
function JobSection({ title, items }: { title: string; items: string[] }) {
  return (
    <Reveal className="grid gap-3 border-t border-ink/10 py-5 sm:gap-4 sm:py-7 lg:grid-cols-12 lg:gap-6 lg:py-8">
      <h2 className="font-serif text-heading-5 lg:col-span-4">{title}</h2>
      <ul className="flex flex-col gap-2.5 lg:col-span-7 lg:col-start-6">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-body-sm text-ink/85">
            <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-deep" />
            {item}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

async function CareerContent({ params }: { params: PageProps<"/careers/[slug]">["params"] }) {
  const job = getJob((await params).slug);
  if (!job) notFound();

  return (
    <article className="bg-sand-100 pt-[calc(var(--header-height)+1.25rem)] pb-section sm:pt-[calc(var(--header-height)+2.5rem)]">
      <Container>
        <Link
          href={routes.careers}
          className="eyebrow inline-flex min-h-11 items-center gap-2 text-lagoon hover:text-ink"
        >
          <Icon name="chevron-left" className="size-4" />
          Back to careers
        </Link>

        {/* The cap: the role, its badges and Apply Now (an email to HR). */}
        <Reveal className="mt-3 flex flex-col gap-5 pb-2 sm:mt-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-3">
            <JobMeta job={job} tone="plain" />
            <h1 className="max-w-3xl text-heading-3">{job.title}</h1>
            <p className="max-w-2xl text-body-sm text-slate">{job.summary}</p>
          </div>
          <Button
            href={applyHref(job)}
            variant="primary"
            className="shrink-0 self-start md:self-end"
          >
            Apply now
          </Button>
        </Reveal>

        <div className="mt-4 border-b border-ink/10 lg:mt-6">
          <JobSection title="About the Role" items={job.about} />
          <JobSection title="Requirements" items={job.requirements} />
          <JobSection title="Benefits & Privileges" items={job.benefits} />
        </div>
      </Container>

      {/* The close: apply by email to HR, with the CV attached. */}
      <Container>
        <div id="apply" className="scroll-mt-(--header-height)" />
        {/* In the bullets' column, so the button lines up with the lists above. */}
        <Reveal className="mt-8 grid sm:mt-10 lg:grid-cols-12 lg:gap-6">
          <div className="flex flex-col items-start gap-4 lg:col-span-7 lg:col-start-6">
            <Button href={applyHref(job)} variant="primary" icon="arrow-up-right">
              Apply now
            </Button>
            <p className="text-body-sm text-slate">
              Send your CV to{" "}
              <a href={applyHref(job)} className="link-underline text-ink">
                {applicationEmail}
              </a>{" "}
              with the role in the subject line.
            </p>
          </div>
        </Reveal>
      </Container>
    </article>
  );
}

export default function CareerPage({ params }: PageProps<"/careers/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CareerContent params={params} />
    </Suspense>
  );
}
