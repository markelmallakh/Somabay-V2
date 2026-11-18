import Link from "next/link";
import type { StartOption } from "@/types/content";
import { RevealGroup, RevealItem } from "@/components/animations/Reveal";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { MaskRoll } from "@/components/navigation/MaskRoll";
import { Icon } from "@/components/ui/Icon";

type StartCardsProps = {
  label: string;
  options: StartOption[];
};

/**
 * The hero's "Where do you want to start?" choices as three portrait photo cards side by side,
 * pinned to the hero's bottom-right opposite the Day/Night toggle. Each card carries its title on
 * a shaded foot; on hover the card lifts and widens (so the hint reads on one line), the photo
 * zooms, the title letters roll, the arrow circle pops in and the hint opens beneath the title. Touch screens show the hint from the start.
 */
export function StartCards({ label, options }: StartCardsProps) {
  return (
    <nav aria-labelledby="start-label" className="w-full lg:w-auto">
      <RevealGroup>
        <RevealItem>
          <p
            id="start-label"
            // Phones show the cards alone (the label stays for screen readers).
            className="sr-only text-label font-semibold tracking-label text-white/80 uppercase sm:not-sr-only"
          >
            {label}
          </p>
        </RevealItem>
        {/* Phones: three short landscape cards side by side, title only; desktop: the hover cards. */}
        <ul className="grid grid-cols-3 gap-2 sm:mt-3.5 sm:gap-2.5 lg:flex">
          {options.map((option) => (
            <RevealItem as="li" key={option.href}>
              <Link
                href={option.href}
                className="group relative block aspect-[16/10] overflow-hidden rounded-md bg-black/30 text-white shadow-[0_12px_40px_rgb(0_0_0/0.25)] transition-[width] duration-700 ease-out-expo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:aspect-[3/4] lg:aspect-auto lg:h-[10.6667rem] lg:w-32 lg:hover:w-56 lg:focus-visible:w-56 xl:h-48 xl:w-36 xl:hover:w-60 xl:focus-visible:w-60"
              >
                <ResponsiveImage
                  asset={option.image}
                  sizes="(min-width: 1280px) 240px, (min-width: 1024px) 224px, 33vw"
                  fill
                  className="transition-transform duration-[1600ms] ease-out-expo group-hover:scale-[1.05] group-focus-visible:scale-[1.05]"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(0_0_0/0.15)_0%,rgb(0_0_0/0)_35%,rgb(0_0_0/0.75)_100%)]"
                />
                {/* Hidden at rest; on hover a white circle pops in at the top-right with the
                    arrow sliding in from its bottom-left. */}
                <span
                  aria-hidden
                  className="absolute top-2 right-2 grid size-7 scale-50 place-items-center overflow-hidden rounded-full bg-white text-ink opacity-0 transition-[opacity,scale] duration-500 ease-out-expo group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
                >
                  <Icon
                    name="arrow-up-right"
                    className="size-3.5 -translate-x-2 translate-y-2 transition-transform delay-100 duration-500 ease-out-expo group-hover:translate-x-0 group-hover:translate-y-0 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0"
                  />
                </span>
                <span className="absolute inset-x-2 bottom-2 sm:inset-x-2.5 sm:bottom-2.5">
                  {/* Phones: a small title that may wrap; the letter roll from `sm`. */}
                  <span className="block font-serif text-[0.8125rem] leading-[1.15] sm:hidden">
                    {option.title}
                  </span>
                  <MaskRoll className="hidden font-serif text-[0.9375rem] leading-[1.2] sm:block">
                    {option.title}
                  </MaskRoll>
                  {/* The hint opens under the title on hover (always open on touch screens). */}
                  <span className="hidden grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-out-expo group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr] sm:grid [@media(hover:none)]:grid-rows-[1fr]">
                    <span className="overflow-hidden">
                      <span className="block pt-1 text-body-xs leading-[1.35] text-white/85 lg:w-[12rem] xl:w-[13rem]">
                        {option.description}
                      </span>
                    </span>
                  </span>
                </span>
              </Link>
            </RevealItem>
          ))}
        </ul>
      </RevealGroup>
    </nav>
  );
}
