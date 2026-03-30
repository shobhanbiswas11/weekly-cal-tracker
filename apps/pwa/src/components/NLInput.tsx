import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/useApi";
import type { CalorieEntry } from "@/types";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";

interface NLInputProps {
  date: string;
  onEntriesAdded: (entries: CalorieEntry[]) => void;
}

export function NLInput({ date, onEntriesAdded }: NLInputProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.parseEntry(input.trim(), date);
      if (response.success && response.data) {
        onEntriesAdded(response.data.entries);
        setInput("");
      } else {
        setError(response.error || "Failed to parse entry");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe what you ate... e.g., '2 eggs with toast and a glass of orange juice for breakfast'"
          className="min-h-[100px] w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-base text-zinc-50 placeholder:text-zinc-500 focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500/20 disabled:opacity-50"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="absolute bottom-3 right-3 bg-lime-500 text-zinc-900 hover:bg-lime-600 disabled:bg-zinc-700 disabled:text-zinc-500"
          size="icon"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
    </form>
  );
}
