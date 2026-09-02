"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border-2 border-transparent transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
        "data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-600 data-[checked]:bg-emerald-500 data-[unchecked]:bg-slate-300 dark:data-[unchecked]:bg-slate-600",
        size === "default" ? "h-6 w-11" : "h-5 w-9",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-sm ring-0 transition-transform duration-300",
          size === "default" 
            ? "size-5 group-data-[state=checked]/switch:translate-x-5 group-data-[state=unchecked]/switch:translate-x-0 group-data-[checked]/switch:translate-x-5 group-data-[unchecked]/switch:translate-x-0" 
            : "size-4 group-data-[state=checked]/switch:translate-x-4 group-data-[state=unchecked]/switch:translate-x-0 group-data-[checked]/switch:translate-x-4 group-data-[unchecked]/switch:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
