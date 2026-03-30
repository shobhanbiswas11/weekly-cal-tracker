import { X, Lightbulb, FileText } from 'lucide-react';
import type { ContextItem } from '@/types';

interface ContextChipProps {
  item: ContextItem;
  onRemove: (id: string) => void;
}

export function ContextChip({ item, onRemove }: ContextChipProps) {
  const isIdea = item.type === 'idea';

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        isIdea ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
      }`}
    >
      {isIdea ? (
        <Lightbulb className="w-3 h-3" />
      ) : (
        <FileText className="w-3 h-3" />
      )}
      <span className="max-w-[150px] truncate">
        @{isIdea ? 'Idea' : 'Section'}: {isIdea ? item.title : item.name}
      </span>
      <button
        onClick={() => onRemove(item.id)}
        className={`p-0.5 rounded-full transition-colors ${
          isIdea ? 'hover:bg-amber-200' : 'hover:bg-purple-200'
        }`}
        aria-label={`Remove ${isIdea ? item.title : item.name}`}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
