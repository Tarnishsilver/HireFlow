import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-200 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default: "bg-foreground text-background hover:bg-foreground/90 press-effect",
                destructive: "bg-destructive text-white hover:bg-destructive/90 press-effect",
                outline: "border border-border/50 bg-transparent hover:bg-muted/40 hover:border-border press-effect",
                secondary: "bg-muted/50 text-foreground hover:bg-muted press-effect",
                ghost: "hover:bg-muted/40 hover:text-foreground",
                link: "text-primary underline-offset-4 hover:underline",
                premium: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-premium-sm hover:shadow-premium press-effect",
                glass: "glass hover:bg-white/[0.06] text-foreground press-effect",
            },
            size: {
                default: "h-10 px-5 py-2 rounded-xl",
                sm: "h-8 px-3.5 text-xs rounded-lg",
                lg: "h-11 px-8 rounded-xl",
                icon: "h-10 w-10 rounded-xl",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    },
)
Button.displayName = "Button"

export { Button, buttonVariants }
