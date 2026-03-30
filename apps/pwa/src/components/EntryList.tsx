import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/useApi";
import type { CalorieEntry } from "@/types";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

interface EntryListProps {
  entries: CalorieEntry[];
  onEntryDeleted: (entryId: string) => void;
}

export function EntryList({ entries, onEntryDeleted }: EntryListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const api = useApi();

  const handleDelete = async (entry: CalorieEntry) => {
    setDeletingId(entry.id);
    try {
      const response = await api.deleteEntry(entry.date, entry.id);
      if (response.success) {
        onEntryDeleted(entry.id);
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-zinc-800 p-4 mb-4">
          <svg
            className="h-8 w-8 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
        <p className="text-zinc-400 text-sm">No entries yet</p>
        <p className="text-zinc-500 text-xs mt-1">Add your first meal above</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center justify-between rounded-xl bg-zinc-900 border border-zinc-800 p-4 transition-colors hover:border-zinc-700"
        >
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-zinc-50 truncate">{entry.name}</h3>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
              <span className="text-lime-400 font-semibold">
                {entry.calories} cal
              </span>
              <span className="text-zinc-500">P: {entry.protein}g</span>
              <span className="text-zinc-500">C: {entry.carbs}g</span>
              <span className="text-zinc-500">F: {entry.fat}g</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleDelete(entry)}
            disabled={deletingId === entry.id}
            className="ml-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 shrink-0"
          >
            {deletingId === entry.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}
