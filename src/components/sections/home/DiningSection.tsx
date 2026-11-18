import { routes } from "@/config/routes";
import { venues } from "@/content/dining";
import { image, video } from "@/lib/media";
import { FeaturePanel } from "@/components/sections/shared/FeaturePanel";
import type { KitIconName } from "@/components/ui/KitIcon";
import { MarinaPanel } from "./MarinaPanel";

/** Dining as a white panel on the pale grey-blue (the Facilities layout, mirrored: photo left), then
 * The Marina on the same ground. */
const dining = {
  label: "Dining Experience",
  // DRAFT statement: to be confirmed by the client.
  statement:
    "From long lunches by the sea to rooftop drinks at sunset, every table at Somabay comes with a view.",
  description:
    "From casual bites to memorable evenings, discover flavours from Egypt, Italy, Asia and beyond — all by the Red Sea.",
  cta: { label: "Explore dining", href: routes.dining },
  image: image("/images/dining/dining-table-by-sea.webp", "A long table set by the sea"),
};

const marina = {
  eyebrow: "The Marina",
  title: "Life by the Water",
  description:
    "A lively waterfront destination where shopping, leisure, and everyday essentials come together.",
  cta: { label: "Explore the Marina", href: routes.marina },
  film: video({
    sources: [
      { src: "/videos/marina-04-scrub.webm", type: "video/webm" },
      { src: "/videos/marina-04-scrub.mp4", type: "video/mp4" },
    ],
    poster: image(
      "/images/video/marina-04-scrub-poster.webp",
      "Yachts moored along The Marina waterfront",
    ),
    label: "The Marina waterfront from the air",
  }),
  categories: [
    { label: "Fashion", icon: "handbag" },
    { label: "Groceries", icon: "cart" },
    { label: "Beauty", icon: "sparkles" },
    { label: "Pharmacy", icon: "medicine" },
    { label: "Dining", icon: "restaurant" },
    { label: "Banking", icon: "bank" },
    { label: "Transport", icon: "bus" },
  ] satisfies { label: string; icon: KitIconName }[],
};

export function DiningSection() {
  return (
    <>
      <FeaturePanel
        id="dining-title"
        label={dining.label}
        statement={dining.statement}
        description={dining.description}
        cta={dining.cta}
        image={dining.image}
        imageSide="left"
        tone="white"
        // How many places there are to eat and drink, from the dining directory.
        stat={{ value: `+${venues.length}`, label: "Places to eat & drink" }}
      />
      {/* The Marina: "Somabay / Marina" parted by the film, full width, then its content. */}
      <MarinaPanel {...marina} />
    </>
  );
}
