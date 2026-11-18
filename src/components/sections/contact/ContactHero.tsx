import { contactHero, contactIntro } from "@/content/contact";
import { formDefinitions } from "@/lib/forms";
import { Container } from "@/components/layout/Container";
import { Parallax } from "@/components/animations/Parallax";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { Reveal } from "@/components/animations/Reveal";
import { SplitHeading } from "@/components/animations/SplitHeading";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * The contact page's opening: a full-bleed evening photo (slow parallax) under a soft dark wash, and one
 * compact centred card, sized to fit the screen with every follow-up question showing, holding a compact heading, the direct ways to reach us, and the enquiry form
 * (its questions following the chosen purpose).
 */
export function ContactHero() {
  return (
    <section
      aria-labelledby="page-title"
      data-theme-surface="dark"
      className="relative isolate overflow-hidden bg-abyss pt-[calc(var(--header-height)+1rem)] pb-8 text-ink sm:pt-[calc(var(--header-height)+1.5rem)] sm:pb-12"
    >
      <Parallax mode="hero" amount={6} className="absolute inset-0 -z-20">
        <div className="absolute inset-0">
          <ResponsiveImage asset={contactHero.image} sizes="100vw" fill priority />
        </div>
      </Parallax>
      <div aria-hidden className="absolute inset-0 -z-10 bg-[rgb(8_46_48/0.5)]" />
      <Container className="flex justify-center">
        <Reveal distance={32} className="w-full max-w-[52rem]">
          {/* The compact heading. */}
          <div className="rounded-md bg-white px-4 py-6 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.4)] sm:px-10 sm:py-8">
            <div className="flex flex-col items-center gap-2 text-center">
              <Eyebrow tone="light">{contactHero.eyebrow}</Eyebrow>
              <SplitHeading
                as="h1"
                id="page-title"
                trigger="load"
                delay={0.2}
                className="text-heading-3"
              >
                {contactHero.title}
              </SplitHeading>
              <p className="max-w-xl text-body-sm text-slate">{contactIntro}</p>
            </div>

            <EnquiryForm definition={formDefinitions.contact} compact className="mt-6" />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
