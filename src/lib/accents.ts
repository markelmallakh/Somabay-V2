/**
 * Somabay secondary palette (Figma brand colours) used as quiet accents: tags in a pale tint of
 * the colour with its text in a deep shade of the same colour, a soft wash behind a section. Never
 * as large fills, so turquoise stays the lead colour.
 */
export type Accent =
  | "turquoise"
  | "dune"
  | "sun"
  | "twilight"
  | "deep-orange"
  | "dusk-purple"
  | "french-red"
  | "warm-grey";

/** Literal class names so Tailwind can see them. */
export const accentClasses: Record<
  Accent,
  { dot: string; rule: string; wash: string; tint: string; ink: string }
> = {
  turquoise: {
    dot: "bg-deep",
    rule: "bg-deep",
    wash: "bg-deep/8",
    tint: "bg-turquoise-10",
    ink: "text-turquoise-160",
  },
  dune: {
    dot: "bg-dune",
    rule: "bg-dune",
    wash: "bg-dune/10",
    tint: "bg-[color-mix(in_srgb,var(--color-dune)_16%,white)]",
    ink: "text-[color-mix(in_srgb,var(--color-dune)_50%,black)]",
  },
  sun: {
    dot: "bg-sun",
    rule: "bg-sun",
    wash: "bg-sun/10",
    tint: "bg-[color-mix(in_srgb,var(--color-sun)_18%,white)]",
    ink: "text-[color-mix(in_srgb,var(--color-sun)_45%,black)]",
  },
  twilight: {
    dot: "bg-twilight",
    rule: "bg-twilight",
    wash: "bg-twilight/8",
    tint: "bg-[color-mix(in_srgb,var(--color-twilight)_10%,white)]",
    ink: "text-[color-mix(in_srgb,var(--color-twilight)_85%,black)]",
  },
  "deep-orange": {
    dot: "bg-deep-orange",
    rule: "bg-deep-orange",
    wash: "bg-deep-orange/8",
    tint: "bg-[color-mix(in_srgb,var(--color-deep-orange)_12%,white)]",
    ink: "text-[color-mix(in_srgb,var(--color-deep-orange)_55%,black)]",
  },
  "dusk-purple": {
    dot: "bg-dusk-purple",
    rule: "bg-dusk-purple",
    wash: "bg-dusk-purple/6",
    tint: "bg-[color-mix(in_srgb,var(--color-dusk-purple)_8%,white)]",
    ink: "text-dusk-purple",
  },
  "french-red": {
    dot: "bg-french-red",
    rule: "bg-french-red",
    wash: "bg-french-red/6",
    tint: "bg-[color-mix(in_srgb,var(--color-french-red)_9%,white)]",
    ink: "text-[color-mix(in_srgb,var(--color-french-red)_70%,black)]",
  },
  "warm-grey": {
    dot: "bg-warm-grey",
    rule: "bg-warm-grey",
    wash: "bg-warm-grey/25",
    tint: "bg-[color-mix(in_srgb,var(--color-warm-grey)_40%,white)]",
    ink: "text-[color-mix(in_srgb,var(--color-warm-grey)_30%,black)]",
  },
};

/** Keyword → accent, checked in order against a category or tag label. */
const rules: [RegExp, Accent][] = [
  [/hotel|stay|resort|holiday|luxury|beach/i, "dune"],
  [/golf|sport|tennis|arena|fitness|padel|active/i, "sun"],
  [/div|snorkel|water|sea|marina|boat|kite|surf|sail|aqua/i, "twilight"],
  [/dining|restaurant|food|cafe|café|bar|pizza|bakery|cuisine|egyptian/i, "deep-orange"],
  [/event|culture|music|festival|art|night|entertain/i, "dusk-purple"],
  [/kid|family|play|school|famil/i, "french-red"],
  [/spa|wellness|thalasso|yoga|relax|health|medical/i, "warm-grey"],
];

/** Accent for a free-text category (falls back to turquoise). */
export function accentFor(label: string | undefined): Accent {
  if (!label) return "turquoise";
  return rules.find(([pattern]) => pattern.test(label))?.[1] ?? "turquoise";
}
