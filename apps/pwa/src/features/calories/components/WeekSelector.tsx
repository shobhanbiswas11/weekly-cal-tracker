// Week selector for weekly view

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  formatDateShort,
  getAdjacentWeek,
  getCurrentWeek,
  getWeekRange,
} from "../utils";

interface WeekSelectorProps {
  weekId: string; // 2026-W13
  onWeekChange: (weekId: string) => void;
}

export function WeekSelector({ weekId, onWeekChange }: WeekSelectorProps) {
  const { start, end } = getWeekRange(weekId);
  const weekNumber = parseInt(weekId.split("-W")[1], 10);
  const isCurrentWeek = weekId === getCurrentWeek();

  const handlePrev = () => {
    onWeekChange(getAdjacentWeek(weekId, "prev"));
  };

  const handleNext = () => {
    onWeekChange(getAdjacentWeek(weekId, "next"));
  };

  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3 bg-card rounded-xl ring-1 ring-foreground/10">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handlePrev}
        aria-label="Previous week"
      >
        <ChevronLeft className="size-5" />
      </Button>

      <div className="flex flex-col items-center">
        <span className="text-base font-medium">
          {isCurrentWeek ? "This Week" : `Week ${weekNumber}`}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatDateShort(start)} – {formatDateShort(end)}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleNext}
        disabled={isCurrentWeek}
        aria-label="Next week"
      >
        <ChevronRight className="size-5" />
      </Button>
    </div>
  );
}
