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

export interface DatePickerProps {
  value?: string | Date
  onChange?: (date: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const parseDate = (d?: string | Date) => {
    if (!d) return undefined;
    if (d instanceof Date) return d;
    const parts = d.split("-");
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2].split("T")[0]));
    }
    return new Date(d);
  };

  const date = parseDate(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-[240px] justify-start text-left font-normal bg-background hover:bg-muted/30 focus:ring-primary/20 shadow-sm",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 border-none shadow-2xl rounded-xl overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-4 data-[side=top]:slide-in-from-bottom-4 duration-200" 
        align="start" 
        side="bottom" 
        sideOffset={8}
      >
        <div className="bg-background rounded-xl p-0 border flex flex-col">
          <div className="flex">
        <Calendar
          mode="single"
          required
          defaultMonth={date}
          selected={date}
          onSelect={(d) => {
            if (d && onChange) {
              // Ensure we return the date in YYYY-MM-DD format based on local time
              const year = d.getFullYear();
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const day = String(d.getDate()).padStart(2, '0');
              onChange(`${year}-${month}-${day}`);
            }
            setOpen(false); // Close the dialog after selection (whether they click the same or different date)
          }}
          initialFocus
          captionLayout="dropdown"
          fromYear={1900}
          toYear={2100}
        />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
