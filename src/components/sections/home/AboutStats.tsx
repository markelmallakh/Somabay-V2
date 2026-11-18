import type { Cta, Stat } from "@/types/content";
import { cn } from "@/lib/utils";
import { CountUp } from "@/components/animations/CountUp";
import { RevealGroup, RevealItem } from "@/components/animations/Reveal";
import { Button } from "@/components/ui/Button";

type AboutStatsProps = {
  stats: Stat[];
  cta: Cta;
  className?: string;
};

/** Key figures set inline in white on the dune band (counting up on arrival), with the white story CTA beneath. */
export function AboutStats({ stats, cta, className }: AboutStatsProps) {
  return (
    <RevealGroup className={cn("flex flex-col gap-8 text-white sm:gap-12 lg:gap-16", className)}>
      {/* Phones: the three figures side by side, small and centred. */}
      <dl className="grid grid-cols-3 gap-3 text-center sm:gap-8 sm:text-left">
        {stats.map((stat) => (
          <RevealItem
            key={stat.value}
            as="div"
            className="flex flex-col-reverse justify-end gap-1.5 border-t border-white/40 pt-4 sm:gap-2 sm:pt-6"
          >
            <dt className="text-body-xs leading-snug text-white/80 sm:text-body-md">
              {stat.label}
            </dt>
            <dd className="font-serif text-heading-4 leading-none sm:text-heading-2">
              <CountUp value={stat.value} />
            </dd>
          </RevealItem>
        ))}
      </dl>
      <RevealItem className="flex justify-center">
        <Button href={cta.href} variant="light" icon="arrow-up-right">
          {cta.label}
        </Button>
      </RevealItem>
    </RevealGroup>
  );
}
