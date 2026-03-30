// List of calorie entries

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Clock, Flame } from "lucide-react";
import type { CalorieEntry } from "../types";
import { formatTime } from "../utils";
import { MacroDisplay } from "./MacroDisplay";

interface EntryListProps {
  entries: CalorieEntry[];
  limit?: number;
  showMacros?: boolean;
  title?: string;
  emptyMessage?: string;
  className?: string;
}

export function EntryList({
  entries,
  limit,
  showMacros = false,
  title,
  emptyMessage = "No entries yet",
  className,
}: EntryListProps) {
  const displayEntries = limit
    ? entries.slice(-limit).reverse()
    : [...entries].reverse();

  return (
    <Card className={className}>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn(!title && "pt-4")}>
        {displayEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {emptyMessage}
          </p>
        ) : (
          <div className="space-y-3">
            {displayEntries.map((entry) => (
              <EntryItem key={entry.id} entry={entry} showMacros={showMacros} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface EntryItemProps {
  entry: CalorieEntry;
  showMacros?: boolean;
}

function EntryItem({ entry, showMacros }: EntryItemProps) {
  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{entry.name}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <Clock className="size-3" />
            <span>{formatTime(entry.time)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium shrink-0">
          <Flame className="size-4 text-orange-500" />
          <span>{entry.calories}</span>
        </div>
      </div>

      {showMacros && (
        <div className="flex items-center gap-4 mt-1 pt-2 border-t border-border/50">
          <MacroDisplay type="protein" value={entry.protein} size="sm" />
          <MacroDisplay type="carbs" value={entry.carbs} size="sm" />
          <MacroDisplay type="fat" value={entry.fat} size="sm" />
        </div>
      )}
    </div>
  );
}
