import Link from "next/link";
import type { ReactNode } from "react";
import type { ImageAsset } from "@/types/media";
import { cn } from "@/lib/utils";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { Icon } from "./Icon";

type CardActionBarProps = {
  label: ReactNode;
  /** `dark` over photos (white text), `light` on white cards (ink text). */
  tone?: "dark" | "light";
  className?: string;
};

/**
 * The site's card hover: a footer bar under a hairline that floods turquoise from the bottom
 * (a pixel past the card's edge, so no dark seam shows at its rounded corners) when its `group`
 * card is hovered or focused, while the arrow turns to point right. Sits flush with the card's
 * bottom and sides, so put it last in a card with `overflow-hidden`.
 */
export function CardActionBar({ label, tone = "dark", className }: CardActionBarProps) {
  return (
    <span
      className={cn(
        "relative isolate flex items-center justify-between border-t px-6 py-5 text-body-xs font-semibold tracking-label uppercase transition-colors duration-500",
        tone === "dark"
          ? "border-white/30 text-white"
          : "border-line text-ink group-hover:text-white group-focus-visible:text-white",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute -inset-px -z-10 origin-bottom scale-y-0 bg-aqua transition-transform duration-700 ease-out-expo group-hover:scale-y-100 group-focus-visible:scale-y-100"
      />
      {label}
      <Icon
        name="arrow-up-right"
        className="size-4.5 transition-transform duration-700 ease-out-expo group-hover:rotate-45 group-focus-visible:rotate-45"
      />
    </span>
  );
}

type PhotoCardProps = {
  /** Where the card links to; or pass `onClick` instead to open something on the page. */
  href?: string;
  onClick?: () => void;
  image: ImageAsset;
  sizes: string;
  title: ReactNode;
  /** Small label in a frosted tag at the top left. */
  tag?: ReactNode;
  /** Short line above the title. */
  kicker?: ReactNode;
  summary?: ReactNode;
  /** Footer bar label ("Discover"). */
  action: ReactNode;
  /** Sizing, usually an aspect ratio. */
  className?: string;
  draggable?: boolean;
  tabIndex?: number;
  priority?: boolean;
  /**
   * `lg` for the big feature cards (larger title and roomier padding); `compact` is `md` on
   * tablets and up but small on phones (tight padding, small title, no action bar), for narrow
   * cards two to a row.
   */
  size?: "md" | "lg" | "compact";
};

/**
 * Photo card (the homepage neighborhood widget): 12px corners, copy over a deep bottom shade, the
 * photo easing in on hover and the turquoise action bar flooding up from the bottom.
 */
export function PhotoCard({
  href,
  onClick,
  image,
  sizes,
  title,
  tag,
  kicker,
  summary,
  action,
  className,
  draggable,
  tabIndex,
  priority,
  size = "md",
}: PhotoCardProps) {
  return (
    <CardShell
      href={href}
      onClick={onClick}
      label={typeof title === "string" ? `${title}: details` : undefined}
      draggable={draggable}
      tabIndex={tabIndex}
      className={cn(
        // A dark base under the photo, so no light edge shows round it as it zooms on hover.
        "group relative isolate flex flex-col justify-between overflow-hidden rounded-md bg-black text-left text-white",
        className,
      )}
    >
      <ResponsiveImage
        asset={image}
        sizes={sizes}
        fill
        priority={priority}
        className="-z-10 transition-transform duration-[1600ms] ease-out-expo group-hover:scale-[1.05]"
      />
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(0_0_0/0.35)_0%,rgb(0_0_0/0)_20%,rgb(0_0_0/0.15)_45%,rgb(0_0_0/0.65)_68%,rgb(0_0_0/0.9)_100%)]"
      />
      <span
        className={cn(
          "flex items-start pb-0",
          size === "lg" ? "p-5 sm:p-8" : size === "compact" ? "p-3 sm:p-6" : "p-6",
        )}
      >
        {tag ? (
          <span className="eyebrow rounded-md bg-black/30 px-1.5 py-1 text-[0.5625rem] leading-none font-medium tracking-[0.14em] backdrop-blur-lg sm:px-2 sm:text-[0.6875rem] sm:tracking-[0.16em]">
            {tag}
          </span>
        ) : null}
      </span>
      <span className={cn("flex flex-col", size === "compact" ? "gap-2.5 sm:gap-4" : "gap-4")}>
        {/* data-card-copy: lines a parent can animate in one by one. */}
        <span
          data-card-copy
          className={cn(
            "flex flex-col gap-4",
            size === "lg"
              ? "px-5 sm:px-8"
              : size === "compact"
                ? "px-3 max-sm:pb-3 sm:px-6"
                : "px-6",
          )}
        >
          <span className="flex flex-col gap-2">
            {kicker ? <span className="text-body-sm text-white/80">{kicker}</span> : null}
            <span
              className={cn(
                "font-serif",
                size === "lg"
                  ? "text-heading-3"
                  : size === "compact"
                    ? "text-body-md leading-tight sm:text-heading-5"
                    : "text-heading-5",
              )}
            >
              {title}
            </span>
          </span>
          {summary ? (
            <span
              className={cn(
                "text-white/80",
                size === "lg" ? "max-w-md text-body-md" : "text-body-sm",
              )}
            >
              {summary}
            </span>
          ) : null}
        </span>
        <CardActionBar
          label={action}
          className={
            size === "lg"
              ? "px-5 py-4 sm:px-8 sm:py-6"
              : size === "compact"
                ? // Phones: no bar at all, just the photo, tag and name.
                  "max-sm:hidden"
                : undefined
          }
        />
      </span>
    </CardShell>
  );
}

/** The card's outer element: a link when it has an `href`, otherwise a button. */
function CardShell({
  href,
  onClick,
  label,
  draggable,
  tabIndex,
  className,
  children,
}: {
  href?: string;
  onClick?: () => void;
  label?: string;
  draggable?: boolean;
  tabIndex?: number;
  className: string;
  children: ReactNode;
}) {
  if (href !== undefined) {
    return (
      <Link href={href} draggable={draggable} tabIndex={tabIndex} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      tabIndex={tabIndex}
      className={cn(className, "w-full")}
    >
      {children}
    </button>
  );
}
