import { facilitiesIntro } from "@/content/home";
import { image } from "@/lib/media";
import { FeaturePanel } from "@/components/sections/shared/FeaturePanel";

// The supplied Winter Campaign photo (067A0335).
const photo = image(
  "/images/facilities/facilities-winter-067a0335.webp",
  "A guest in a bathrobe with a morning coffee on a bright, sea-view hotel bed",
  { position: "50% 60%" },
);

// DRAFT statement: to be confirmed by the client.
const statement =
  "Everything daily life asks for, from schools and clinics to home care and getting around, is only a few minutes from your door.";

/** Facilities & Services as one calm pale panel, the photo on the right (see `FeaturePanel`). */
export function FacilitiesSection() {
  return (
    <FeaturePanel
      id="facilities-title"
      label={facilitiesIntro.title}
      statement={statement}
      description={facilitiesIntro.description ?? ""}
      cta={facilitiesIntro.cta}
      image={photo}
    />
  );
}
