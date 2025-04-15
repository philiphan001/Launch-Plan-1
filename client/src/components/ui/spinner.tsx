import React from "react";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export const Spinner = ({
  className,
  size = "md",
  ...props
}: SpinnerProps) => {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-t-transparent",
        {
          "h-4 w-4 border-2": size === "sm",
          "h-8 w-8 border-4": size === "md",
          "h-12 w-12 border-4": size === "lg",
        },
        "border-primary",
        className
      )}
      {...props}
    />
  );
};