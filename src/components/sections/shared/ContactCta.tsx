import { contactCta } from "@/content/home";
import { image } from "@/lib/media";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/animations/Reveal";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { Button } from "@/components/ui/Button";

const background = image(
  "/images/cta/contact-bay-aerial.webp",
  "Aerial view of a Somabay beach with a boat carving circles in the bay",
);

// The title on two lines: its last two words ("Starts Here") under the rest.
const titleWords = contactCta.title.split(" ");
const titleLines = [titleWords.slice(0, -2).join(" "), titleWords.slice(-2).join(" ")];

/**
 * Contact CTA: a centred invitation over an aerial of the bay, under a deep sea-navy wash that
 * fades out from left to right. The photo card sits on the pale grey-blue ground inside the page
 * padding, and opens out from a narrower, rounder card to that padding as it scrolls into view.
 */
export function ContactCta() {
  return (
    <section
      aria-labelledby="cta-title"
      data-theme-surface="light"
      className="bg-sand-100 py-section"
    >
      <Container>
        <div
          data-theme-surface="dark"
          // `frame-grow` with no inset of its own: it opens out to the full width of the padding.
          className="frame-grow relative isolate overflow-hidden rounded-media bg-deep text-white [--frame-inset:0px]"
        >
          <ResponsiveImage
            asset={background}
            sizes="(min-width: 1512px) 1392px, 100vw"
            quality={85}
            fill
            className="-z-10 object-[50%_66%]"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgb(8_46_48/0.9),rgb(8_46_48/0))]"
          />
          <div className="flex min-h-[clamp(24rem,42vw,40rem)] flex-col items-center justify-center px-6 py-14 text-center sm:px-10 sm:py-20">
            <Reveal className="flex max-w-[56rem] flex-col items-center gap-6 sm:gap-8">
              <div className="flex flex-col items-center gap-4 sm:gap-6">
                {/* Two lines: the last two words ("Starts Here") under the rest. */}
                <h2 id="cta-title" className="text-heading-1">
                  <span className="block sm:whitespace-nowrap">{titleLines[0]}</span>{" "}
                  <span className="block">{titleLines[1]}</span>
                </h2>
                <p className="max-w-[43.75rem] text-body-md text-white/90 sm:text-body-lg">
                  {contactCta.description}
                </p>
              </div>
              <Button href={contactCta.cta.href} variant="turquoise" size="lg" icon="arrow-right">
                {contactCta.cta.label}
              </Button>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
