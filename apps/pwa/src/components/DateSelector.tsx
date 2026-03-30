import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateSelectorProps {
  date: string;
  onDateChange: (date: string) => void;
  onViewWeekly: () => void;
}

export function DateSelector({
  date,
  onDateChange,
  onViewWeekly,
}: DateSelectorProps) {
  const currentDate = new Date(date + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = currentDate.toDateString() === today.toDateString();

  const formatDate = (d: Date) => {
    if (d.toDateString() === today.toDateString()) {
      return "Today";
    }
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const changeDate = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + delta);
    onDateChange(newDate.toISOString().split("T")[0]);
  };

  const goToToday = () => {
    onDateChange(today.toISOString().split("T")[0]);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={() => changeDate(-1)}
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50 transition-colors"
          aria-label="Previous day"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          onClick={isToday ? onViewWeekly : goToToday}
          className="min-w-35 text-center"
        >
          <span className="font-semibold text-zinc-50">
            {formatDate(currentDate)}
          </span>
          <p className="text-xs text-lime-400 hover:text-lime-300 transition-colors">
            {isToday ? "View Week" : "Go to Today"}
          </p>
        </button>

        <button
          onClick={() => changeDate(1)}
          disabled={isToday}
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next day"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
