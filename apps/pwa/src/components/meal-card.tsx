import { fmt } from "@/lib/utils";
import type { MealEntry } from "@weekly-cal/core";
import { Utensils } from "lucide-react";

export function MealCard({ entry }: { entry: MealEntry }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
        <Utensils className="h-4 w-4 text-secondary-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-foreground">
            {entry.name}
          </p>
          <span className="shrink-0 text-sm font-bold text-primary">
            {fmt(entry.calories)}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              kcal
            </span>
          </span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span>P: {fmt(entry.protein)}g</span>
          <span>C: {fmt(entry.carbs)}g</span>
          <span>F: {fmt(entry.fats)}g</span>
          {entry.note && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className="truncate italic">{entry.note}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
