"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type CalendarProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> & {
  mode?: "single" | "range" | "multiple";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  initialFocus?: boolean;
  className?: string;
  classNames?: {
    months?: string;
    month?: string;
    caption?: string;
    caption_label?: string;
    nav?: string;
    nav_button?: string;
    nav_button_previous?: string;
    nav_button_next?: string;
    table?: string;
    head_row?: string;
    head_cell?: string;
    row?: string;
    cell?: string;
    day?: string;
    day_selected?: string;
    day_today?: string;
    day_outside?: string;
    day_disabled?: string;
    day_range_middle?: string;
    day_hidden?: string;
  };
  showOutsideDays?: boolean;
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isToday(date: Date) {
  const today = new Date();
  return isSameDay(date, today);
}

function Calendar({
  className,
  classNames,
  selected,
  onSelect,
  disabled,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  // Initialize to selected date if available, otherwise current date
  const initialDate = selected || new Date();
  const [currentMonth, setCurrentMonth] = React.useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = React.useState(initialDate.getFullYear());

  // Update calendar view when selected date changes
  React.useEffect(() => {
    if (selected) {
      setCurrentMonth(selected.getMonth());
      setCurrentYear(selected.getFullYear());
    }
  }, [selected]);

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDayClick = (day: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const date = new Date(currentYear, currentMonth, day);
    if (disabled && disabled(date)) return;
    onSelect?.(date);
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const isSelected = (day: number) => {
    if (!selected) return false;
    const date = new Date(currentYear, currentMonth, day);
    return isSameDay(date, selected);
  };

  const isDisabled = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    return disabled ? disabled(date) : false;
  };

  const renderDays = () => {
    const days = [];
    const totalCells = 42; // 6 weeks * 7 days

    // Previous month days
    const prevMonthDays = getDaysInMonth(
      currentMonth === 0 ? currentYear - 1 : currentYear,
      currentMonth === 0 ? 11 : currentMonth - 1
    );

    for (let i = 0; i < firstDayOfMonth; i++) {
      const day = prevMonthDays - firstDayOfMonth + i + 1;
      days.push(
        <div
          key={`prev-${i}`}
          className={cn(
            "h-9 w-9 rounded-md text-sm flex items-center justify-center text-muted-foreground/40 pointer-events-none select-none",
            !showOutsideDays && "invisible",
            classNames?.day_outside
          )}
        >
          {showOutsideDays ? day : ""}
        </div>
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const selected = isSelected(day);
      const today = isToday(date);
      const disabled = isDisabled(day);

      days.push(
        <button
          key={day}
          type="button"
          onClick={(e) => handleDayClick(day, e)}
          disabled={disabled}
          className={cn(
            "h-9 w-9 rounded-md text-sm flex items-center justify-center transition-colors font-normal",
            !disabled && "hover:bg-accent hover:text-accent-foreground cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            selected && "bg-primary text-primary-foreground hover:bg-primary/90 font-semibold",
            today && !selected && "bg-accent text-accent-foreground font-medium",
            disabled && "opacity-30 cursor-not-allowed hover:bg-transparent",
            classNames?.day,
            selected && classNames?.day_selected,
            today && classNames?.day_today,
            disabled && classNames?.day_disabled
          )}
        >
          {day}
        </button>
      );
    }

    // Next month days
    const daysSoFar = firstDayOfMonth + daysInMonth;
    const nextMonthDays = totalCells - daysSoFar;
    
    for (let i = 1; i <= nextMonthDays; i++) {
      days.push(
        <div
          key={`next-${i}`}
          className={cn(
            "h-9 w-9 rounded-md text-sm flex items-center justify-center text-muted-foreground/40 pointer-events-none select-none",
            !showOutsideDays && "invisible",
            classNames?.day_outside
          )}
        >
          {showOutsideDays ? i : ""}
        </div>
      );
    }

    return days;
  };

  return (
    <div className={cn("p-3", className)} {...props}>
      <div className={cn("flex justify-between items-center mb-4 gap-2", classNames?.nav)}>
        <Button
          variant="outline"
          size="icon"
          className={cn("h-7 w-7 flex-shrink-0", classNames?.nav_button, classNames?.nav_button_previous)}
          onClick={goToPreviousMonth}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous month</span>
        </Button>

        <div className={cn("flex items-center gap-1 flex-1 justify-center", classNames?.caption_label)}>
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
            className="text-sm font-medium bg-transparent border border-input rounded px-2 py-1 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {monthNames.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>

          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
            className="text-sm font-medium bg-transparent border border-input rounded px-2 py-1 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {Array.from({ length: 150 }, (_, i) => new Date().getFullYear() - i + 10).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <Button
          variant="outline"
          size="icon"
          className={cn("h-7 w-7 flex-shrink-0", classNames?.nav_button, classNames?.nav_button_next)}
          onClick={goToNextMonth}
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next month</span>
        </Button>
      </div>

      <div className={cn("grid grid-cols-7 gap-1 mb-2", classNames?.head_row)}>
        {dayNames.map((day) => (
          <div
            key={day}
            className={cn(
              "h-9 w-9 rounded-md text-sm flex items-center justify-center font-medium text-muted-foreground",
              classNames?.head_cell
            )}
          >
            {day}
          </div>
        ))}
      </div>

      <div className={cn("grid grid-cols-7 gap-1", classNames?.row)}>
        {renderDays()}
      </div>

      <div className="mt-3 pt-3 border-t flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => {
            const today = new Date();
            setCurrentMonth(today.getMonth());
            setCurrentYear(today.getFullYear());
            onSelect?.(today);
          }}
          type="button"
        >
          Today
        </Button>
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };