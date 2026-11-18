import type { EventItem } from "@/types/content";

export const eventCategories = [
  { value: "sports", label: "Sports Event" },
  { value: "corporate", label: "Corporate Event" },
  { value: "mega", label: "Mega Event" },
] as const;

export const categoryLabel = (value: EventItem["category"]) =>
  eventCategories.find((category) => category.value === value)?.label ?? value;

/**
 * Each category's brand colour: sports deep orange, corporate dusk purple, mega twilight blue.
 * `dot` fills a marker; `tag` tints a category chip (pale wash, hairline and text in the colour).
 */
export const categoryColor: Record<string, { dot: string; tag: string }> = {
  sports: {
    dot: "bg-deep-orange",
    tag: "border-deep-orange/35 bg-deep-orange/10 text-deep-orange",
  },
  corporate: {
    dot: "bg-dusk-purple",
    tag: "border-dusk-purple/30 bg-dusk-purple/8 text-dusk-purple",
  },
  mega: { dot: "bg-twilight", tag: "border-twilight/30 bg-twilight/8 text-twilight" },
};

const fallbackColor = {
  dot: "bg-deep",
  tag: "border-deep/30 bg-deep/8 text-turquoise-160",
};
export const colorOf = (value: string) => categoryColor[value] ?? fallbackColor;
