import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Five visual tiers over one shared geometry. Every tier is the same box —
 * height and padding come from `size` alone (h-8 at default), never from the
 * variant. Rest state carries no fill for the quiet tiers; hover warms them
 * by a single flat step of neutral wash (--accent), at a 2px radius, over a
 * 120ms background-color transition and nothing else — no hue, shadow,
 * transform, scale, or hover border. Focus draws a 2px near-black ring offset
 * from the button.
 *
 *   default (Primary)     near-black ink fill, paper text — max one per screen
 *   outline (Secondary)   transparent, 1px --border, ink text
 *   ghost                 text only at rest, neutral wash on hover
 *   link                  Ink 2, 1px underline at 0.15em offset — reveals/navigates
 *   destructive           Terracotta text, NO fill, neutral wash on hover
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md text-sm font-medium whitespace-nowrap outline-none select-none transition-wash focus-ring disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-accent aria-expanded:bg-accent",
        secondary:
          "border border-border bg-transparent text-foreground hover:bg-accent aria-expanded:bg-accent",
        ghost:
          "bg-transparent hover:bg-accent aria-expanded:bg-accent",
        destructive:
          "bg-transparent text-destructive hover:bg-surface-active",
        link: "text-ink-2 underline decoration-1 underline-offset-[0.15em] hover:text-foreground",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-7 gap-1 rounded-md px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-md px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-md",
        "icon-lg": "size-9",
      },
    },
    compoundVariants: [
      // Link is pure text — no box padding.
      { variant: "link", size: "default", class: "px-0" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
