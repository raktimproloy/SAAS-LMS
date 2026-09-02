"use client"

import * as React from "react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type Locale,
} from "react-day-picker"
import "react-day-picker/style.css"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar overflow-hidden bg-background rounded-xl border [--rdp-day-height:1.75rem] [--rdp-day-width:1.75rem] [--rdp-day_button-height:1.75rem] [--rdp-day_button-width:1.75rem] [--rdp-accent-color:transparent] [--rdp-accent-background-color:transparent] [--rdp-today-color:hsl(var(--foreground))] [--rdp-selected-border:none]",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-1 flex w-full items-center justify-between px-1 gap-1 z-10 pointer-events-none",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-7 w-7 p-0 select-none aria-disabled:opacity-50 pointer-events-auto",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-7 w-7 p-0 select-none aria-disabled:opacity-50 pointer-events-auto",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-9 w-full items-center justify-center bg-muted/40 dark:bg-muted/20 rounded-md",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-7 w-full items-center justify-center gap-2 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "flex h-7 items-center rounded-md px-2 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "font-medium select-none text-sm",
          captionLayout !== "label" && "hidden",
          defaultClassNames.caption_label
        ),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("", defaultClassNames.weekdays),
        weekday: cn(
          "text-[0.8rem] font-normal text-muted-foreground select-none py-2 text-center",
          defaultClassNames.weekday
        ),
        week: cn("mt-2", defaultClassNames.week),
        week_number_header: cn(
          "w-8 select-none text-center",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] text-muted-foreground select-none text-center",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative h-8 w-8 p-0 text-center select-none",
          defaultClassNames.day
        ),
        range_start: "bg-transparent border-none outline-none",
        range_middle: "bg-transparent border-none outline-none",
        range_end: "bg-transparent border-none outline-none",
        selected: "bg-transparent border-none outline-none",
        today: "bg-transparent",
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground opacity-50",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon className={cn("size-4", className)} {...props} />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: ({ ...props }) => (
          <CalendarDayButton locale={locale} {...props} />
        ),
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex h-7 w-7 items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        Dropdown: ({ value, onChange, options, ...props }) => {
          if (!options) return <></>
          
          const selectedOption = options.find((o) => o.value.toString() === value?.toString())
          
          return (
            <Select
              value={value?.toString()}
              onValueChange={(val) => {
                const event = {
                  target: { value: val },
                } as React.ChangeEvent<HTMLSelectElement>
                onChange?.(event)
              }}
            >
              <SelectTrigger className="h-7 w-fit min-w-[70px] border-none px-2 py-1 hover:bg-muted focus:ring-0">
                <SelectValue>{selectedOption?.label}</SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false} className="max-h-[250px] overflow-y-auto [&_[data-slot=select-scroll-up-button]]:hidden [&_[data-slot=select-scroll-down-button]]:hidden">
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()} disabled={option.disabled}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      data-today={modifiers.today}
      className={cn(
        "relative isolate z-10 flex h-full w-full items-center justify-center border-0 font-normal text-foreground transition-colors",
        "group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50",
        "data-[range-end=true]:rounded-r-full data-[range-end=true]:rounded-l-none data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-end=true]:font-medium data-[range-end=true]:hover:!bg-primary data-[range-end=true]:hover:!text-primary-foreground",
        "data-[today=true]:bg-primary/10 data-[today=true]:text-primary data-[today=true]:font-bold data-[today=true]:rounded-full",
        "data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-primary/15 data-[range-middle=true]:text-foreground data-[range-middle=true]:hover:!bg-primary/15 data-[range-middle=true]:hover:!text-foreground",
        "data-[range-start=true]:rounded-l-full data-[range-start=true]:rounded-r-none data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-start=true]:font-medium data-[range-start=true]:hover:!bg-primary data-[range-start=true]:hover:!text-primary-foreground",
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[selected-single=true]:rounded-full data-[selected-single=true]:font-medium data-[selected-single=true]:hover:!bg-primary data-[selected-single=true]:hover:!text-primary-foreground",
        "hover:text-primary [&>span]:text-xs [&>span]:opacity-70 hover:bg-primary/10 transition-colors",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
