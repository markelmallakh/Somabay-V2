import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

/**
 * The one star-rating badge (homepage hotels, hotel list, hotel page, map drawers): a small
 * sun-yellow pill, "5 ★", set beside the hotel's name.
 */
export function StarChip({ count, className }: { count: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full bg-star px-3 py-1.5 font-sans text-body-sm leading-none font-semibold text-ink tabular-nums",
        className,
      )}
      aria-label={`${count}-star hotel`}
    >
      {count}
      <Icon name="star" className="size-3.5" />
    </span>
  );
}
