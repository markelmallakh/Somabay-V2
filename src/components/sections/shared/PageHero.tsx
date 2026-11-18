import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { MediaAsset, VideoPlayback } from "@/types/media";
import type { NavLink } from "@/types/navigation";
import { Container } from "@/components/layout/Container";
import { Parallax } from "@/components/animations/Parallax";
import { Reveal } from "@/components/animations/Reveal";
import { SplitHeading } from "@/components/animations/SplitHeading";
import { Media } from "@/components/media/Media";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Eyebrow } from "@/components/ui/Eyebrow";

type BaseProps = {
  eyebrow?: string;
  /** One string, or several lines that each start on a new line. */
  title: string | readonly string[];
  description?: ReactNode;
  /** Extra content under the description (usually a button). */
  actions?: ReactNode;
  breadcrumbs?: NavLink[];
  id?: string;
};

type MediaHeroProps = BaseProps & {
  /**
   * Both variants share one layout: title bottom-left, copy bottom-right (site-wide left
   * alignment). `centered` is kept as an alias so existing pages don't change.
   */
  variant: "split" | "centered";
  media: MediaAsset;
  playback?: VideoPlayback;
  /** `screen` fills the viewport; `band` is a shorter banner. */
  height?: "screen" | "band";
  /** Phones: where the copy sits in the photo; `end` lowers it to the photo's foot. */
  phonePlacement?: "center" | "end";
};

type TitleHeroProps = BaseProps & {
  /** No media: left-aligned title block on the page background (listings, FAQ). */
  variant: "title";
  /** `tint` sits on the pale grey-blue ground, for pages that continue on it. */
  tone?: "white" | "tint";
  /** `center` sets the eyebrow and title in the middle of the page. */
  align?: "start" | "center";
};

export type PageHeroProps = MediaHeroProps | TitleHeroProps;

function Heading({
  title,
  id,
  className,
}: {
  title: string | readonly string[];
  id: string;
  className?: string;
}) {
  return (
    <SplitHeading as="h1" id={id} trigger="load" delay={0.3} className={className}>
      {typeof title === "string"
        ? title
        : title.map((line, index) => (
            <span key={line} className="block lg:whitespace-nowrap">
              {index > 0 ? " " : null}
              {line}
            </span>
          ))}
    </SplitHeading>
  );
}

export function PageHero(props: PageHeroProps) {
  const { eyebrow, title, description, actions, breadcrumbs, id = "page-title" } = props;

  if (props.variant === "title") {
    return (
      <section
        aria-labelledby={id}
        className={cn(
          props.tone === "white"
            ? // White like the header, so the two read as one band; a little taller.
              "border-b border-line bg-white pt-[calc(var(--header-height)+3rem)] pb-12 sm:pt-[calc(var(--header-height)+6rem)] sm:pb-20 md:pb-28"
            : props.align === "center"
              ? // Centred title pages (journal, FAQ): the content follows closely.
                "pt-[calc(var(--header-height)+2.5rem)] pb-8 sm:pt-[calc(var(--header-height)+4rem)] sm:pb-10 md:pb-12"
              : "pt-[calc(var(--header-height)+2.5rem)] pb-10 sm:pt-[calc(var(--header-height)+4rem)] sm:pb-14 md:pb-20",
          props.tone === "tint" ? "bg-sand-100" : props.tone !== "white" && "bg-sand-50",
        )}
      >
        <Container
          className={cn(
            "flex flex-col gap-5 sm:gap-8",
            props.align === "center"
              ? "items-center text-center"
              : // Phones centre the title block like the rest of the layout.
                "items-center text-center sm:items-start sm:text-left lg:flex-row lg:items-end lg:justify-between",
          )}
        >
          <div className={props.align === "center" ? "max-w-5xl" : "max-w-3xl"}>
            {breadcrumbs ? <Breadcrumbs items={breadcrumbs} className="mb-6 sm:mb-10" /> : null}
            {eyebrow ? (
              <Reveal distance={12}>
                <Eyebrow className={props.align === "center" ? "mx-auto" : undefined}>
                  {eyebrow}
                </Eyebrow>
              </Reveal>
            ) : null}
            <Heading
              title={title}
              id={id}
              // The split lines carry their own inline alignment; centre them with the block.
              className={cn(
                // Centred titles sit on one line, a step smaller than the usual page title.
                props.align === "center"
                  ? "mt-2.5 text-[clamp(1.875rem,1.4rem+2.1vw,3.5rem)] leading-[1.08] lg:mt-3 [&_.split-line]:text-center!"
                  : "mt-2.5 text-heading-1 lg:mt-3",
              )}
            />
          </div>
          {description || actions ? (
            <Reveal delay={0.25} className="max-w-md lg:pb-2">
              {description ? <p className="text-lead text-slate">{description}</p> : null}
              {actions ? <div className="mt-5 sm:mt-7">{actions}</div> : null}
            </Reveal>
          ) : null}
        </Container>
      </section>
    );
  }

  const { media, playback = "autoplay", height = "screen", phonePlacement = "center" } = props;

  return (
    <section
      aria-labelledby={id}
      data-theme-surface="dark"
      // Holds in place while the page's content scrolls up over it (see SiteMotion).
      data-sticky-hero=""
      className={cn(
        "frame-panel relative isolate flex overflow-hidden bg-abyss text-white",
        height === "screen" ? "h-svh min-h-[40rem]" : "h-[60svh] max-h-[42rem] min-h-[30rem]",
      )}
    >
      <Parallax mode="hero" amount={10} className="absolute inset-0 -z-20">
        <Media
          asset={media}
          playback={playback}
          sizes="100vw"
          priority
          className="absolute inset-0"
        />
      </Parallax>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(0_0_0/0.55)_0%,rgb(0_0_0/0.18)_16%,rgb(0_0_0/0)_32%,rgb(0_0_0/0)_48%,rgb(0_0_0/0.35)_68%,rgb(0_0_0/0.82)_100%)]"
      />
      {/* Phones: the copy sits mid-photo, where the shade above is clear, so a black veil keeps
          the eyebrow and title readable on bright photos. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-black/35 sm:hidden"
      />

      {/* Phones: the copy centred in the photo, both ways (or lowered to its foot); larger
          screens: along its foot. */}
      <Container
        className={cn(
          "flex flex-col items-center gap-5 pt-(--header-height) pb-10 text-center sm:items-start sm:justify-end sm:gap-8 sm:pb-14 sm:text-left md:pb-20 lg:flex-row lg:items-end lg:justify-between",
          phonePlacement === "end" ? "justify-end" : "justify-center",
        )}
      >
        <div className={typeof title === "string" ? "max-w-3xl" : "max-w-5xl"}>
          {breadcrumbs ? (
            <Breadcrumbs items={breadcrumbs} tone="light" className="mb-5 sm:mb-8" />
          ) : null}
          {eyebrow ? (
            <Reveal distance={12} delay={0.15}>
              <Eyebrow>{eyebrow}</Eyebrow>
            </Reveal>
          ) : null}
          <Heading title={title} id={id} className="mt-2.5 text-heading-1 lg:mt-3" />
        </div>
        {description || actions ? (
          <Reveal delay={0.45} className="max-w-md lg:pb-3">
            {description ? <p className="text-lead text-white/80">{description}</p> : null}
            {actions ? <div className="mt-5 sm:mt-7">{actions}</div> : null}
          </Reveal>
        ) : null}
      </Container>
    </section>
  );
}
