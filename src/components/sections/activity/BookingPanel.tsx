import type { ReactNode } from "react";
import type { FormDefinition } from "@/lib/forms";
import { cn } from "@/lib/utils";
import type { ImageAsset } from "@/types/media";
import { Container } from "@/components/layout/Container";
import { Parallax } from "@/components/animations/Parallax";
import { Reveal } from "@/components/animations/Reveal";
import { SplitHeading } from "@/components/animations/SplitHeading";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";

type BookingPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  image: ImageAsset;
  /** General contacts for the page; venue contacts live in each venue's own card instead. */
  contacts?: readonly { icon: "mail" | "phone" | "pin"; label: string; href?: string }[];
  /** The enquiry form; leave it out and pass `children` for other content (e.g. rates and a link). */
  definition?: FormDefinition;
  /** Sent with the request so the team knows the page it came from. */
  context?: string;
  /** Shown in place of the form. */
  children?: ReactNode;
  /** `teal`: the card in deep turquoise with orange touches (eyebrow, icons, submit). */
  tone?: "light" | "teal";
};

/**
 * The booking section of every Things To Do page, laid out like the neighborhood interest form:
 * a tall photo on the left, drifting gently, and a white card laid a little over its right side
 * with the eyebrow, a short title, a line of copy, any general contacts and the enquiry form.
 * Anchored at #booking, which the page's call to action glides to.
 */
export function BookingPanel({
  eyebrow,
  title,
  description,
  image,
  contacts = [],
  definition,
  context,
  tone = "light",
  children,
}: BookingPanelProps) {
  const teal = tone === "teal";
  return (
    <section
      id="booking"
      aria-labelledby="booking-title"
      className="scroll-mt-(--header-bar) bg-sand-100 py-section text-ink"
    >
      <Container className="grid grid-cols-1 lg:grid-cols-12 lg:items-center">
        <Reveal className="lg:col-span-7 lg:col-start-1 lg:row-start-1">
          <Parallax
            amount={6}
            className="relative aspect-[4/3] overflow-hidden rounded-t-md sm:aspect-[4/5] lg:aspect-auto lg:h-[min(68rem,96svh)] lg:min-h-[48rem] lg:rounded-md"
          >
            <div className="absolute inset-0">
              <ResponsiveImage asset={image} sizes="(min-width: 1024px) 56vw, 100vw" fill />
            </div>
          </Parallax>
        </Reveal>

        {/* The invitation and the form on one white card, laid a little over the photo. */}
        <Reveal delay={0.1} className="relative z-10 lg:col-span-6 lg:col-start-7 lg:row-start-1">
          <div
            className={cn(
              "flex flex-col rounded-b-md p-5 sm:p-8 lg:rounded-md lg:px-10 lg:py-9 lg:shadow-[0_18px_48px_-28px_rgb(15_30_53/0.2)]",
              teal ? "bg-turquoise-160 text-white" : "bg-white",
            )}
          >
            <Eyebrow className={teal ? "[--eyebrow-ink:var(--color-deep-orange)]" : undefined}>
              {eyebrow}
            </Eyebrow>
            <SplitHeading id="booking-title" className="mt-2 text-heading-3">
              {title}
            </SplitHeading>
            <p
              className={cn("mt-1.5 max-w-lg text-body-sm", teal ? "text-white/75" : "text-slate")}
            >
              {description}
            </p>
            {contacts.length ? (
              <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-body-xs">
                {contacts.map((contact) => (
                  <li
                    key={contact.label}
                    className={cn("flex items-center gap-2", teal ? "text-white/80" : "text-slate")}
                  >
                    <Icon
                      name={`${contact.icon}-solid`}
                      className={cn(
                        "size-4 shrink-0",
                        teal ? "text-deep-orange" : "text-turquoise",
                      )}
                    />
                    {contact.href ? (
                      <a href={contact.href} className="link-underline hover:text-ink">
                        {contact.label}
                      </a>
                    ) : (
                      contact.label
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
            {definition ? (
              <EnquiryForm
                definition={definition}
                context={context ?? title}
                tone={tone}
                compact
                className="mt-5"
              />
            ) : (
              children
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
