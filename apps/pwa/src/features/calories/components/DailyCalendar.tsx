// Calendar navigation for daily view

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addDays, isToday as dateFnsIsToday } from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatDateDisplay, formatDateToISO, parseLocalDate } from "../utils";

interface DailyCalendarProps {
  date: string; // YYYY-MM-DD
  onDateChange: (date: string) => void;
}

export function DailyCalendar({ date, onDateChange }: DailyCalendarProps) {
  const currentDate = parseLocalDate(date);

  const handlePrev = () => {
    const newDate = addDays(currentDate, -1);
    onDateChange(formatDateToISO(newDate));
  };

  const handleNext = () => {
    const newDate = addDays(currentDate, 1);
    onDateChange(formatDateToISO(newDate));
  };

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onDateChange(formatDateToISO(selectedDate));
    }
  };

  const isTodaySelected = dateFnsIsToday(currentDate);

  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3 bg-card rounded-xl ring-1 ring-foreground/10">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handlePrev}
        aria-label="Previous day"
      >
        <ChevronLeft className="size-5" />
      </Button>

      <Popover>
        <PopoverTrigger className="inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium hover:bg-muted transition-colors">
          <span className="text-base">
            {isTodaySelected ? "Today" : formatDateDisplay(currentDate)}
          </span>
          <CalendarIcon className="size-4 text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={currentDate}
            onSelect={handleSelect}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleNext}
        disabled={isTodaySelected}
        aria-label="Next day"
      >
        <ChevronRight className="size-5" />
      </Button>
    </div>
  );
}
