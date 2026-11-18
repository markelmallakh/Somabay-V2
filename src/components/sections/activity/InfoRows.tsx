import type { ReactNode } from "react";
import type { ImageAsset } from "@/types/media";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { PhoneEndCta } from "@/components/layout/HeadingRow";
import { Reveal, RevealGroup, RevealItem } from "@/components/animations/Reveal";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

type InfoRowsProps = {
  id: string;
  eyebrow: string;
  title: string;
  items: {
    title: string;
    description: string;
    image: ImageAsset;
    /** An outside page for the item (opens in a new tab), shown as a turquoise arrow circle. */
    href?: string;
  }[];
  /** Beside the heading on the right (e.g. a brochure button). */
  aside?: ReactNode;
};

/**
 * Information rows on a white panel (first built for the Spa treatments): the heading, then one
 * row per item with a small photo, its number, and the name with a short description. A row with
 * an `href` links to that page in a new tab, with a turquoise arrow circle at its end.
 */
export function InfoRows({ id, eyebrow, title, items, aside }: InfoRowsProps) {
  // When any row links out, every row keeps room for the arrow so the columns stay aligned.
  const linked = items.some((item) => item.href);
  return (
    <Section tone="white" aria-labelledby={id} className="bg-sand-100">
      <Container>
        <div className="rounded-md bg-white px-5 py-8 sm:px-6 sm:py-10 md:px-10 lg:px-12 lg:py-14">
          <div className="flex flex-col gap-5 sm:gap-6 md:flex-row md:items-end md:justify-between">
            <Reveal className="flex flex-col gap-2 lg:gap-3">
              <Eyebrow>{eyebrow}</Eyebrow>
              <h2 id={id} className="text-heading-2">
                {title}
              </h2>
            </Reveal>
            {/* Phones: the call to action moves under the rows. */}
            {aside ? (
              <Reveal delay={0.1} className="hidden sm:block">
                {aside}
              </Reveal>
            ) : null}
          </div>

          <RevealGroup as="ul" className="mt-6 border-t border-line sm:mt-10 lg:mt-14">
            {items.map((item, index) => (
              <RevealItem as="li" key={item.title} className="border-b border-line">
                {/* Phones: a square thumbnail beside the copy; from `sm` the wide photo strip. */}
                {(() => {
                  const row = (
                    <div
                      className={cn(
                        "grid grid-cols-[4.5rem_1fr] items-start gap-4 py-4 sm:grid-cols-[13rem_1fr] sm:gap-5 sm:py-6 md:py-8 lg:grid-cols-12 lg:gap-6",
                        linked && "pr-12 sm:pr-16",
                      )}
                    >
                      <span className="relative block size-18 overflow-hidden rounded-md bg-sand-200 sm:h-24 sm:w-52 lg:col-span-4">
                        <ResponsiveImage
                          asset={item.image}
                          sizes="(min-width: 640px) 13rem, 4.5rem"
                          fill
                        />
                      </span>
                      <span className="flex flex-col gap-1 sm:col-start-2 sm:flex-row sm:gap-6 lg:col-span-7 lg:col-start-6 lg:gap-10">
                        <span className="shrink-0 text-body-xs text-slate tabular-nums sm:w-8 sm:pt-1 sm:text-heading-6 lg:w-12">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="flex flex-col gap-2">
                          <span className="font-serif text-heading-5 leading-[1.2]">
                            {item.title}
                          </span>
                          <span className="max-w-md text-body-sm text-slate">
                            {item.description}
                          </span>
                        </span>
                      </span>
                    </div>
                  );
                  return item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${item.title} on the Somabay Golf website (opens in a new tab)`}
                      className="group relative block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquoise"
                    >
                      {row}
                      <span
                        aria-hidden
                        className="absolute top-1/2 right-0 grid size-9 -translate-y-1/2 place-items-center overflow-hidden rounded-full bg-deep text-white transition-colors duration-500 group-hover:bg-turquoise-160 sm:size-11"
                      >
                        <Icon
                          name="arrow-up-right"
                          className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:size-5"
                        />
                      </span>
                    </a>
                  ) : (
                    row
                  );
                })()}
              </RevealItem>
            ))}
          </RevealGroup>
          {aside ? <PhoneEndCta className="mt-6">{aside}</PhoneEndCta> : null}
        </div>
      </Container>
    </Section>
  );
}
