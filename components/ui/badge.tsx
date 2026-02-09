import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-all",
    {
        variants: {
            variant: {
                default:
                    "bg-primary/12 text-primary border border-primary/20",
                secondary:
                    "bg-muted/50 text-muted-foreground border border-border/50",
                destructive:
                    "bg-destructive/12 text-destructive border border-destructive/20",
                outline:
                    "text-foreground border border-border/50 bg-transparent",
                success:
                    "badge-success",
                warning:
                    "badge-warning",
                info:
                    "badge-info",
                neutral:
                    "badge-neutral",
                error:
                    "badge-error",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
