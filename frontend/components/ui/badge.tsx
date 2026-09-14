import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 border px-2.5 py-0.5 text-xs font-medium tracking-wide",
  {
    variants: {
      variant: {
        neutral: "border-border bg-neutral text-text-muted",
        navy: "border-navy/20 bg-navy text-white",
        blue: "border-blue/20 bg-light-blue text-blue-dark",
        red: "border-risk-red/30 bg-risk-red-bg text-red-ink",
        green: "border-green/30 bg-green-bg text-green-ink",
        amber: "border-amber/30 bg-amber-bg text-amber-ink",
        outline: "border-border bg-white text-text",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
