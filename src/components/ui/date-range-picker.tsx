"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DateRangePickerProps {
  startDate?: string
  endDate?: string
  onStartDateChange?: (date: string) => void
  onEndDateChange?: (date: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  placeholder = "Pick a date range",
  className,
  disabled,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const parseDate = (d?: string) => {
    if (!d) return undefined;
    const parts = d.split("-");
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2].split("T")[0]));
    }
    return undefined;
  };

  const [date, setDate] = React.useState<{ from: Date | undefined; to: Date | undefined }>({
    from: parseDate(startDate),
    to: parseDate(endDate),
  });

  // Sync internal state when opened
  React.useEffect(() => {
    if (open) {
      setDate({
        from: parseDate(startDate),
        to: parseDate(endDate),
      });
    }
  }, [open, startDate, endDate]);

  const handleApply = () => {
    if (date.from && onStartDateChange) {
      const f = date.from;
      onStartDateChange(`${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`);
    } else if (!date.from && onStartDateChange) {
      onStartDateChange("");
    }
    
    if (date.to && onEndDateChange) {
      const t = date.to;
      onEndDateChange(`${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`);
    } else if (!date.to && onEndDateChange) {
      onEndDateChange("");
    }
    setOpen(false);
  };

  const handleClear = () => {
    setDate({ from: undefined, to: undefined });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-[300px] justify-start text-left font-normal bg-background hover:bg-muted/30 focus:ring-primary/20 shadow-sm",
            !date.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
          {date.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 border-none shadow-2xl rounded-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=top]:slide-in-from-bottom-4 duration-200" 
        align="start" 
        side="top" 
        sideOffset={8}
      >
        <div className="bg-background rounded-xl p-0 border flex flex-col">
          <div className="flex">
            <Calendar
              mode="range"
              defaultMonth={date.from}
              selected={date}
              onSelect={(range) => {
                setDate({ from: range?.from, to: range?.to })
              }}
              numberOfMonths={1}
              captionLayout="dropdown"
              startMonth={new Date(1900, 0)}
              endMonth={new Date(2100, 11)}
            />
          </div>
          <div className="flex justify-between items-center px-4 py-3 border-t">
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="rounded-full px-4" onClick={handleClear}>
                <span className="translate-y-[2px]">Clear</span>
              </Button>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="rounded-full px-4" onClick={() => setOpen(false)}>
                <span className="translate-y-[2px]">Cancel</span>
              </Button>
              <Button size="sm" className="rounded-full w-20" onClick={handleApply}>
                <span className="translate-y-[2px]">Apply</span>
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
