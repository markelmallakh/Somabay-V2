import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

const tones = {
  /** On imagery: a frosted disc that floods turquoise. */
  dark: "border-white/30 bg-white/10 text-white backdrop-blur-md group-hover:border-aqua group-hover:bg-aqua group-hover:text-white group-focus-visible:border-aqua group-focus-visible:bg-aqua group-focus-visible:text-white",
  /** On light rows: a hairline disc that floods turquoise. */
  light:
    "border-ink/15 text-ink group-hover:border-aqua group-hover:bg-aqua group-hover:text-white group-focus-visible:border-aqua group-focus-visible:bg-aqua group-focus-visible:text-white",
} as const;

const glyph =
  "absolute size-5 transition-transform duration-500 ease-in-out motion-reduce:transition-none";

/**
 * Round ↗ chip for cards and list rows. Place it inside a `group` link: on hover the chip fills
 * and the arrow slips out to the top right as a copy slides in from the bottom left (the same
 * motion as the site's CTAs).
 */
export function ArrowChip({
  tone = "dark",
  className,
}: {
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border transition-[background-color,border-color,color] duration-500 ease-in-out",
        tones[tone],
        className,
      )}
    >
      <Icon
        name="arrow-chip"
        strokeWidth={1.5}
        className={cn(
          glyph,
          "group-hover:translate-x-[160%] group-hover:-translate-y-[160%] group-focus-visible:translate-x-[160%] group-focus-visible:-translate-y-[160%]",
        )}
      />
      <Icon
        name="arrow-chip"
        strokeWidth={1.5}
        className={cn(
          glyph,
          "-translate-x-[160%] translate-y-[160%] group-hover:translate-x-0 group-hover:translate-y-0 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0",
        )}
      />
    </span>
  );
}
