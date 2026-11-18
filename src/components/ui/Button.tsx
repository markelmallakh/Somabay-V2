import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "./Icon";
import { SmartLink } from "./SmartLink";

/**
 * V2 call to action: a pill label paired with a round icon chip. On hover the pill and chip swap
 * colours together and the arrow slides out of the chip as a copy slides in from the other side.
 * The legacy variant names are kept so every page picks up the new look.
 */
export type ButtonVariant =
  | "primary"
  | "dark"
  | "outline"
  | "light"
  | "outline-light"
  | "glass"
  | "solid"
  | "solid-light"
  | "orange"
  | "turquoise";
export type ButtonSize = "lg" | "md" | "sm";

const base =
  "cta group/button relative inline-flex w-fit shrink-0 cursor-pointer items-center whitespace-nowrap rounded-full font-sans font-medium uppercase tracking-[0.06em] transition-[scale] duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

/** Shared timing for the pill and chip colour swap. */
const swap = "transition-[background-color,color,border-color] duration-500 ease-in-out";

type Tone = { root: string; pill: string; chip: string };

/**
 * Every CTA floods brand turquoise on hover or keyboard focus, pill and chip together. The label
 * and its arrow turn white on it.
 */
const hover =
  "group-hover/button:border-aqua group-hover/button:bg-aqua group-hover/button:text-white group-focus-visible/button:border-aqua group-focus-visible/button:bg-aqua group-focus-visible/button:text-white";
const chipHover =
  "group-hover/button:bg-aqua group-hover/button:text-white group-focus-visible/button:bg-aqua group-focus-visible/button:text-white";

const navy: Tone = {
  root: "",
  pill: `border-navy bg-navy text-white ${hover}`,
  chip: `bg-navy text-white ${chipHover}`,
};

const white: Tone = {
  root: "",
  pill: `border-white bg-white text-navy ${hover}`,
  chip: `bg-white text-navy ${chipHover}`,
};

const variants: Record<ButtonVariant, Tone> = {
  primary: navy,
  solid: navy,
  dark: {
    root: "",
    pill: `border-navy-950 bg-navy-950 text-white ${hover}`,
    chip: `bg-navy-950 text-white ${chipHover}`,
  },
  // Outline on light grounds; a caller's text colour also tints the pill's hairline.
  outline: {
    root: "text-navy",
    pill: `border-current/25 bg-transparent ${hover}`,
    chip: `bg-navy text-white ${chipHover}`,
  },
  light: white,
  "solid-light": white,
  "outline-light": {
    root: "text-white",
    pill: `border-white/40 bg-transparent ${hover}`,
    chip: `bg-white text-navy ${chipHover}`,
  },
  glass: {
    root: "text-white",
    pill: `glass border-white/25 ${hover}`,
    chip: `bg-white text-navy ${chipHover}`,
  },
  // Brand turquoise at rest; on hover it turns dark grey (reads on white and on photos alike).
  turquoise: {
    root: "",
    pill: "border-aqua bg-aqua text-white group-hover/button:border-navy group-hover/button:bg-navy group-focus-visible/button:border-navy group-focus-visible/button:bg-navy",
    chip: "bg-aqua text-white group-hover/button:bg-navy group-focus-visible/button:bg-navy",
  },
  // The light grey-blue accent, for dark surfaces.
  orange: {
    root: "",
    pill: `border-frost bg-frost text-navy ${hover}`,
    chip: `bg-frost text-navy ${chipHover}`,
  },
};

/** Pill height and padding; the chip is a circle of the same height. */
const sizes: Record<ButtonSize, { pill: string; chip: string; icon: string }> = {
  lg: {
    pill: "h-12 px-6 text-[0.8125rem] sm:h-14 sm:px-8 sm:text-cta-md",
    chip: "size-12 sm:size-14",
    icon: "size-5",
  },
  md: {
    pill: "h-11 px-5 text-[0.75rem] sm:h-12 sm:px-7 sm:text-[0.8125rem]",
    chip: "size-11 sm:size-12",
    icon: "size-[1.125rem]",
  },
  sm: {
    pill: "h-9 px-4 text-[0.6875rem] sm:h-10 sm:px-5 sm:text-xs",
    chip: "size-9 sm:size-10",
    icon: "size-4",
  },
};

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** The chip's icon (an up-right arrow by default); `null` leaves the pill on its own. */
  icon?: IconName | null;
  iconPosition?: "start" | "end";
  className?: string;
  children: ReactNode;
};

type ButtonAsLink = CommonProps & {
  href: string;
  external?: boolean;
} & Omit<ComponentPropsWithoutRef<"a">, "href" | "className" | "children">;

type ButtonAsButton = CommonProps & {
  href?: undefined;
} & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

export type ButtonProps = ButtonAsLink | ButtonAsButton;

/** Arrows slide out along their direction and a copy follows in; other icons do the same sideways. */
function slide(icon: IconName, position: "start" | "end") {
  if (icon === "arrow-up-right" || icon === "arrow-chip") {
    return {
      out: "group-hover/button:translate-x-[180%] group-hover/button:-translate-y-[180%] group-focus-visible/button:translate-x-[180%] group-focus-visible/button:-translate-y-[180%]",
      in: "-translate-x-[180%] translate-y-[180%] group-hover/button:translate-x-0 group-hover/button:translate-y-0 group-focus-visible/button:translate-x-0 group-focus-visible/button:translate-y-0",
    };
  }
  if (position === "start") {
    return {
      out: "group-hover/button:-translate-x-[180%] group-focus-visible/button:-translate-x-[180%]",
      in: "translate-x-[180%] group-hover/button:translate-x-0 group-focus-visible/button:translate-x-0",
    };
  }
  return {
    out: "group-hover/button:translate-x-[180%] group-focus-visible/button:translate-x-[180%]",
    in: "-translate-x-[180%] group-hover/button:translate-x-0 group-focus-visible/button:translate-x-0",
  };
}

function Content({
  icon = "arrow-up-right",
  iconPosition = "end",
  variant = "outline",
  size = "md",
  children,
}: Omit<CommonProps, "className">) {
  const tone = variants[variant];
  const dims = sizes[size];
  const motion = icon ? slide(icon, iconPosition) : null;
  const glyph =
    "absolute transition-transform duration-500 ease-in-out motion-reduce:transition-none";
  const chip =
    icon && motion ? (
      <span
        aria-hidden
        className={cn(
          "relative grid shrink-0 place-items-center overflow-hidden rounded-full",
          swap,
          dims.chip,
          tone.chip,
        )}
      >
        <Icon name={icon} className={cn(glyph, dims.icon, motion.out)} />
        <Icon name={icon} className={cn(glyph, dims.icon, motion.in)} />
      </span>
    ) : null;

  return (
    <>
      {iconPosition === "start" ? chip : null}
      <span
        className={cn(
          "inline-flex flex-1 items-center justify-center rounded-full border",
          swap,
          dims.pill,
          tone.pill,
        )}
      >
        {/* Masked text roll: the label slides up out of a clipped line as a copy rolls in. */}
        <span className="relative block overflow-hidden">
          <span className="block transition-transform duration-500 ease-out-expo group-hover/button:-translate-y-full group-focus-visible/button:-translate-y-full motion-reduce:transition-none">
            {children}
            <span aria-hidden className="absolute top-full left-0 block w-full">
              {children}
            </span>
          </span>
        </span>
      </span>
      {iconPosition === "end" ? chip : null}
    </>
  );
}

export function Button(props: ButtonProps) {
  const { variant = "outline", size = "md", className, icon, iconPosition, children } = props;
  const classes = cn(base, variants[variant].root, className);
  const content = (
    <Content icon={icon} iconPosition={iconPosition} variant={variant} size={size}>
      {children}
    </Content>
  );

  if (props.href !== undefined) {
    const {
      href,
      external,
      variant: _v,
      size: _s,
      icon: _i,
      iconPosition: _ip,
      className: _c,
      children: _ch,
      ...anchorProps
    } = props;
    return (
      <SmartLink href={href} external={external} className={classes} {...anchorProps}>
        {content}
      </SmartLink>
    );
  }

  const {
    variant: _v,
    size: _s,
    icon: _i,
    iconPosition: _ip,
    className: _c,
    children: _ch,
    type = "button",
    ...buttonProps
  } = props;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {content}
    </button>
  );
}
