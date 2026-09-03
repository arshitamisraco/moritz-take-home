import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Five tiers, not one flat action style. Rest state carries no fill for any
 * of them; the only fill on the page is --accent (Moss) on hover, at a
 * 6px radius, over a 120ms background-color transition and nothing else —
 * no shadow, transform, scale, or hover border. Focus draws a 2px ring
 * offset from the button. Heights: h-8 for Primary/Secondary, h-7 for Ghost
 * and the text-only Destructive that sits inside rows and the Sheet.
 *
 *   default (Primary)     Slate Blue fill, Bone text — max one per screen
 *   outline (Secondary)   transparent, 1px --border, Charcoal text
 *   ghost                 text only at rest, --accent on hover, 4px 8px pad
 *   link                  Ink 2, 1px underline at 0.15em offset — reveals/navigates
 *   destructive           Terracotta text, NO fill, --breaking-hover on hover
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md text-sm font-medium whitespace-nowrap outline-none select-none transition-[background-color] duration-[120ms] ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "h-8 bg-primary text-primary-foreground hover:bg-[color-mix(in_oklab,var(--primary),#000_14%)]",
        outline:
          "h-8 border border-border bg-transparent text-foreground hover:bg-accent aria-expanded:bg-accent",
        secondary:
          "h-8 border border-border bg-transparent text-foreground hover:bg-accent aria-expanded:bg-accent",
        ghost:
          "h-7 bg-transparent hover:bg-accent aria-expanded:bg-accent",
        destructive:
          "h-7 bg-transparent text-destructive hover:bg-breaking-hover",
        link: "text-[color:var(--ink-2)] underline decoration-1 underline-offset-[0.15em] hover:text-foreground",
      },
      size: {
        default:
          "gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "gap-1 rounded-md px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "gap-1 rounded-md px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-md",
        "icon-lg": "size-9",
      },
    },
    compoundVariants: [
      // Ghost owns its own padding per the hover-inset rule (4px 8px, pulled
      // back with -mx-2 by the caller).
      { variant: "ghost", size: "default", class: "px-2 py-1" },
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
