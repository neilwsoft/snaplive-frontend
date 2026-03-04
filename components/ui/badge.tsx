import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        new:
          "border-transparent bg-[#1c398e] text-white font-medium text-[12px] leading-[20px] px-[6px] py-[3px] rounded-[4px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]",
        bestseller:
          "border-transparent bg-[#e7000b] text-white font-medium text-[12px] leading-[20px] px-[6px] py-[3px] rounded-[4px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]",
        statusNew:
          "border-transparent bg-transparent text-[#27272a] font-normal text-[14px] leading-[24px] px-0 py-0 rounded-none",
        statusReady:
          "border-transparent bg-transparent text-[#27272a] font-normal text-[14px] leading-[24px] px-0 py-0 rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
