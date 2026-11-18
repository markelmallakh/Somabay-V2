import { cn } from "@/lib/utils";
import type { Cta } from "@/types/content";
import type { ImageAsset } from "@/types/media";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/animations/Reveal";
import { ImageReveal } from "@/components/animations/ImageReveal";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { Button } from "@/components/ui/Button";

type FeaturePanelProps = {
  /** The section's heading id (the small label is the section title). */
  id: string;
  label: string;
  /** The large statement in the headline face. */
  statement: string;
  description: string;
  cta: Cta;
  image: ImageAsset;
  /** Which side the photo sits on from `lg` (phones always put it after the copy). */
  imageSide?: "left" | "right";
  /** `pale`: a pale grey-blue panel on white; `white`: a white panel on the pale grey-blue. */
  tone?: "pale" | "white";
  /** A figure set in a white badge on the photo, e.g. { value: "+9", label: "Places to eat" }. */
  stat?: { value: string; label: string };
};

/**
 * One calm panel (pale on white, or white on the pale grey-blue): a small turquoise label and a
 * large statement, then, under a hairline, the short brief with its call to action; the photo sits
 * beside it, with an optional figure badge. Used for Facilities & Services and Dining, mirrored so
 * the two read as a pair.
 */
export function FeaturePanel({
  id,
  label,
  statement,
  description,
  cta,
  image,
  imageSide = "right",
  tone = "pale",
  stat,
}: FeaturePanelProps) {
  const left = imageSide === "left";
  return (
    <section
      aria-labelledby={id}
      className={cn("py-section text-ink", tone === "white" ? "bg-sand-100" : "bg-white")}
    >
      <Container>
        <div
          className={cn(
            "grid gap-8 rounded-md p-6 sm:p-8 lg:grid-cols-12 lg:gap-0 lg:p-10",
            tone === "white" ? "bg-white" : "bg-sand-100",
          )}
        >
          <Reveal
            className={cn(
              "flex flex-col gap-10 lg:col-span-7 lg:justify-between",
              left ? "lg:order-2 lg:pl-10" : "lg:pr-10",
            )}
          >
            <div className="flex flex-col gap-4 lg:gap-5">
              <h2 id={id} className="font-sans text-body-xs font-semibold text-turquoise">
                {label}
              </h2>
              <p className="font-serif text-heading-3 text-balance">{statement}</p>
            </div>

            <div className="flex flex-col gap-5 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
              <p className="max-w-[22rem] text-body-sm text-slate">{description}</p>
              <Button href={cta.href} variant="primary" icon="arrow-up-right" className="shrink-0">
                {cta.label}
              </Button>
            </div>
          </Reveal>

          <div className={cn("lg:col-span-5", left ? "lg:order-1 lg:pr-10" : "lg:pl-10")}>
            <ImageReveal className="relative aspect-[4/5] overflow-hidden rounded-md sm:aspect-[4/3] lg:aspect-auto lg:h-[min(28rem,54svh)]">
              <div className="absolute inset-0">
                <ResponsiveImage
                  asset={image}
                  sizes="(min-width: 1024px) 34vw, 100vw"
                  fill
                  className="object-cover"
                />
              </div>
              {stat ? (
                <p className="absolute bottom-3 left-3 flex items-center gap-3 rounded-card bg-white py-2.5 pr-4 pl-3 text-ink shadow-float sm:bottom-4 sm:left-4">
                  <span className="font-serif text-heading-3 leading-none tabular-nums">
                    {stat.value}
                  </span>
                  <span className="max-w-[7.5rem] text-body-xs leading-snug font-semibold tracking-[0.06em] text-slate uppercase">
                    {stat.label}
                  </span>
                </p>
              ) : null}
            </ImageReveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
