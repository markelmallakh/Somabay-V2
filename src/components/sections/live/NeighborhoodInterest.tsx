import { image as imageAsset } from "@/lib/media";
import { type FormDefinition, formDefinitions, unitChoicesFor } from "@/lib/forms";
import { Container } from "@/components/layout/Container";
import { Parallax } from "@/components/animations/Parallax";
import { Reveal } from "@/components/animations/Reveal";
import { SplitHeading } from "@/components/animations/SplitHeading";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { Eyebrow } from "@/components/ui/Eyebrow";

/** A couple by a private pool: the life the form invites people into. */
const lifestyle = imageAsset(
  "/images/neighborhoods/interest-poolside.webp",
  "A couple relaxing by a private pool framed with bougainvillea",
);

type NeighborhoodInterestProps = {
  /** The neighborhood's name, as on its page and in the unit listings. */
  name: string;
};

/**
 * The close of a neighborhood page: register interest in this neighborhood. A deep-teal panel
 * over the neighborhood's photo invites the visitor in; beside it, a white form card asks for
 * contact details and the preferred unit, offering the unit types listed in this neighborhood.
 */
export function NeighborhoodInterest({ name }: NeighborhoodInterestProps) {
  const base = formDefinitions.neighborhoodInterest;
  // Same fields as the shared form; the unit list narrowed to this neighborhood.
  const definition: FormDefinition = {
    ...base,
    fields: base.fields.map((field) =>
      field.kind === "select" && field.name === "unit"
        ? { ...field, options: unitChoicesFor(name) }
        : field,
    ),
  };

  return (
    <section
      id="register-interest"
      aria-labelledby="interest-title"
      className="scroll-mt-(--header-bar) bg-sand-100 py-section text-ink"
    >
      <Container className="grid lg:grid-cols-12 lg:items-center">
        {/* A tall photo of life at home by the sea, drifting gently as the page scrolls. */}
        <Reveal className="lg:col-span-7 lg:col-start-1 lg:row-start-1">
          <Parallax
            amount={6}
            className="relative aspect-[16/10] overflow-hidden rounded-t-md md:aspect-[4/3] lg:aspect-auto lg:h-[min(50rem,86svh)] lg:min-h-[42rem] lg:rounded-md"
          >
            <div className="absolute inset-0">
              <ResponsiveImage asset={lifestyle} sizes="(min-width: 1024px) 56vw, 100vw" fill />
            </div>
          </Parallax>
        </Reveal>

        {/* The invitation and the form on one white panel, laid over the photo's right side. */}
        <Reveal delay={0.1} className="relative z-10 lg:col-span-6 lg:col-start-7 lg:row-start-1">
          <div className="flex flex-col rounded-b-md bg-white p-5 sm:p-10 lg:rounded-md lg:p-12 lg:shadow-[0_18px_48px_-28px_rgb(15_30_53/0.2)]">
            <Eyebrow>Register your interest</Eyebrow>
            {/* DRAFT COPY: the title and paragraph were written for this form, not from Figma. */}
            <SplitHeading id="interest-title" className="mt-2 text-heading-3">
              {`Make ${name} your home`}
            </SplitHeading>
            <p className="mt-2 max-w-lg text-body-md text-slate">
              Tell us which home you have in mind and our sales team will share availability, prices
              and a time to visit.
            </p>
            <EnquiryForm
              definition={definition}
              context={`Neighborhood: ${name}`}
              className="mt-5 sm:mt-6"
            />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
