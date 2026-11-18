import { Icon } from "./Icon";

const stepper =
  "grid size-12 place-items-center rounded-full bg-white text-ink shadow-[0_8px_24px_rgb(0_0_0/0.18)] transition-colors duration-500 hover:text-white";

/**
 * Previous / next for a drawer that steps through a list, stacked just outside the drawer's
 * edge (pass it as the Dialog's `outside`), so the controls stay clear of the content. Loops
 * past either end. Renders nothing for a single item.
 */
export function DrawerSteppers({
  position,
  count,
  onNavigate,
  noun = "item",
}: {
  position: number;
  count: number;
  onNavigate: (index: number) => void;
  /** Names the step for screen readers, e.g. "team member". */
  noun?: string;
}) {
  if (count < 2) return null;
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => onNavigate((position - 1 + count) % count)}
        className={stepper}
        aria-label={`Previous ${noun}`}
      >
        <Icon name="arrow-right" className="size-5 -rotate-90" />
      </button>
      <button
        type="button"
        onClick={() => onNavigate((position + 1) % count)}
        className={stepper}
        aria-label={`Next ${noun}`}
      >
        <Icon name="arrow-right" className="size-5 rotate-90" />
      </button>
    </div>
  );
}
