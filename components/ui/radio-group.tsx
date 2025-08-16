"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";

const RadioGroup = RadioGroupPrimitive.Root;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      "aspect-square h-5 w-5 rounded-full border border-gray-400 text-green-500 " +
        "ring-offset-background focus:outline-none focus-visible:ring-2 " +
        "focus-visible:ring-green-500 focus-visible:ring-offset-2 " +
        "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {/* This is the actual dot */}
    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
      <span className="h-2.5 w-2.5 rounded-full bg-current" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
