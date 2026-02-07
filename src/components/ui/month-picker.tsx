"use client";

import * as React from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface MonthPickerProps {
  value?: string; // Format: "YYYY-MM"
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  fromYear?: number;
  toYear?: number;
}

export function MonthPicker({
  value,
  onChange,
  placeholder = "Select month",
  disabled = false,
  className,
  fromYear = 2000,
  toYear = new Date().getFullYear(),
}: MonthPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleMonthSelect = (monthIndex: number) => {
    const month = String(monthIndex + 1).padStart(2, '0');
    onChange?.(`${currentYear}-${month}`);
    setOpen(false);
  };

  const goToPreviousYear = () => {
    setCurrentYear(prev => Math.max(fromYear, prev - 1));
  };

  const goToNextYear = () => {
    setCurrentYear(prev => Math.min(toYear, prev + 1));
  };

  const formatDisplayValue = (value: string | undefined) => {
    if (!value) return "";
    const [year, month] = value.split("-");
    const monthIndex = parseInt(month, 10) - 1;
    return `${monthNames[monthIndex]} ${year}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? formatDisplayValue(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={goToPreviousYear}
              disabled={currentYear <= fromYear}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous year</span>
            </Button>
            <div className="text-sm font-medium">{currentYear}</div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={goToNextYear}
              disabled={currentYear >= toYear}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next year</span>
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {monthNames.map((month, index) => {
              const isSelected = value === `${currentYear}-${String(index + 1).padStart(2, '0')}`;
              const isCurrentMonth = 
                currentYear === new Date().getFullYear() && 
                index === new Date().getMonth();
              
              return (
                <Button
                  key={month}
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-9",
                    isCurrentMonth && !isSelected && "bg-accent text-accent-foreground"
                  )}
                  onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMonthSelect(index);
                }}
                >
                  {month.substring(0, 3)}
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}