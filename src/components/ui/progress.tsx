"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  const percentage = Math.min(Math.max(value || 0, 0), 100);
  const blue = 0;

  let red, green;

  if (percentage < 50) {
    red = 200 + (percentage * 50) / 50;
    green = 50 + (percentage * 75) / 50;
  } else {
    red = 250 - ((percentage - 50) * 200) / 50;
    green = 125 + ((percentage - 50) * 75) / 50;
  }

  const backgroundColor = `rgb(${red}, ${green}, ${blue})`;

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-1.5 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 transition-all"
        style={{
          transform: `translateX(-${100 - percentage}%)`,
          backgroundColor,
        }}
      />
    </ProgressPrimitive.Root>
  );
});

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
