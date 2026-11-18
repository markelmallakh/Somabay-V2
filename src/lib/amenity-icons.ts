import type { IconName } from "@/components/ui/Icon";

/** An icon for each amenity, picked from its name; a check mark when nothing matches. */
const AMENITY_ICONS: [RegExp, IconName][] = [
  [/beach/i, "umbrella"],
  [/jacuzzi|hot tub|whirlpool/i, "bubbles"],
  [/pool/i, "waves"],
  [/spa|wellness|thalasso/i, "sparkle"],
  [/bar|lounge/i, "cocktail"],
  [/restaurant|dining/i, "utensils"],
  [/gym|fitness/i, "dumbbell"],
  [/golf/i, "flag"],
  [/wifi|wi-fi/i, "wifi"],
  [/kids|family|club/i, "family"],
  [/tennis|sport|padel/i, "dumbbell"],
  [/div|kite|water|aqua/i, "waves"],
  [/yoga/i, "sparkle"],
  [/room service|butler/i, "key"],
  [/parking|shuttle|transfer/i, "car"],
];

export const amenityIcon = (name: string): IconName =>
  AMENITY_ICONS.find(([pattern]) => pattern.test(name))?.[1] ?? "check";
