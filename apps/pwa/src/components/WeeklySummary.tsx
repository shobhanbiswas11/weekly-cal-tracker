import { useApi } from "@/hooks/useApi";
import type { WeeklySummary as WeeklySummaryType } from "@/types";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface WeeklySummaryProps {
  onBack: () => void;
  onSelectDate: (date: string) => void;
}

export function WeeklySummary({ onBack, onSelectDate }: WeeklySummaryProps) {
  const [summary, setSummary] = useState<WeeklySummaryType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.getWeeklySummary();
        if (response.success && response.data) {
          setSummary(response.data);
        } else {
          setError(response.error || "Failed to load summary");
        }
      } catch {
        setError("Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [api]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={onBack}
          className="text-lime-400 hover:text-lime-300 transition-colors"
        >
          Go back
        </button>
      </div>
    );
  }

  if (!summary) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-zinc-400 hover:text-zinc-50 transition-colors -ml-1"
      >
        <ChevronLeft className="h-5 w-5" />
        <span>Back to today</span>
      </button>

      {/* Week range */}
      <div className="text-center">
        <h2 className="text-lg font-semibold text-zinc-50">Weekly Summary</h2>
        <p className="text-sm text-zinc-500">
          {formatDate(summary.startDate)} - {formatDate(summary.endDate)}
        </p>
      </div>

      {/* Weekly totals */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-zinc-500 mb-1">Total Calories</p>
            <p className="text-2xl font-bold text-zinc-50">
              {summary.weeklyTotalCalories.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Daily Average</p>
            <p className="text-2xl font-bold text-lime-400">
              {Math.round(summary.averageDailyCalories).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-blue-500/10 p-2">
            <p className="text-xs text-zinc-400">Protein</p>
            <p className="font-semibold text-blue-400">
              {summary.weeklyTotalProtein}g
            </p>
          </div>
          <div className="rounded-lg bg-amber-500/10 p-2">
            <p className="text-xs text-zinc-400">Carbs</p>
            <p className="font-semibold text-amber-400">
              {summary.weeklyTotalCarbs}g
            </p>
          </div>
          <div className="rounded-lg bg-purple-500/10 p-2">
            <p className="text-xs text-zinc-400">Fat</p>
            <p className="font-semibold text-purple-400">
              {summary.weeklyTotalFat}g
            </p>
          </div>
        </div>
      </div>

      {/* Daily breakdown */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-zinc-400 px-1">
          Daily Breakdown
        </h3>
        {summary.days.map((day) => {
          const isToday = day.date === new Date().toISOString().split("T")[0];
          return (
            <button
              key={day.date}
              onClick={() => onSelectDate(day.date)}
              className={`w-full flex items-center justify-between rounded-xl border p-4 transition-colors ${
                isToday
                  ? "bg-lime-500/10 border-lime-500/30 hover:border-lime-500/50"
                  : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="text-left">
                <p
                  className={`font-medium ${isToday ? "text-lime-400" : "text-zinc-50"}`}
                >
                  {formatShortDate(day.date)}
                  {isToday && <span className="ml-2 text-xs">Today</span>}
                </p>
                <p className="text-xs text-zinc-500">
                  {day.entries.length}{" "}
                  {day.entries.length === 1 ? "entry" : "entries"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-zinc-50">
                  {day.totalCalories.toLocaleString()}
                </p>
                <p className="text-xs text-zinc-500">cal</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
