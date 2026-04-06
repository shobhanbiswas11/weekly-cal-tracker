// Suggestions component based on daily summary

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import type { DailySummary, UserGoals } from "../types";

interface SuggestionsProps {
  summary: DailySummary;
  goals: UserGoals;
  className?: string;
}

interface Suggestion {
  type: "protein" | "fiber" | "hydration" | "balance" | "goal";
  message: string;
  foods?: string[];
}

function generateSuggestions(
  summary: DailySummary,
  goals: UserGoals,
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const { totals, caloriesRemaining } = summary;

  // Check protein
  const proteinRemaining = goals.proteinGoal - totals.protein;
  if (proteinRemaining > 30) {
    suggestions.push({
      type: "protein",
      message: `You're ${Math.round(proteinRemaining)}g short on protein today.`,
      foods: [
        "Greek yogurt",
        "cottage cheese",
        "tofu scramble",
        "lentil soup",
        "edamame",
      ],
    });
  }

  // Check fiber
  const fiberGoal = 25; // Standard daily fiber goal
  const fiberConsumed = totals.fiber || 0;
  if (fiberConsumed < fiberGoal * 0.5) {
    suggestions.push({
      type: "fiber",
      message: "Consider adding more fiber to your diet.",
      foods: ["black beans", "chia seeds", "broccoli", "oats", "berries"],
    });
  }

  // Balanced meal reminder
  if (totals.carbs > 0 && totals.protein > 0) {
    const carbToProteinRatio = totals.carbs / totals.protein;
    if (carbToProteinRatio > 4) {
      suggestions.push({
        type: "balance",
        message:
          "Your carbs are high relative to protein. Try balancing your next meal.",
        foods: ["eggs", "Greek yogurt", "paneer", "tempeh"],
      });
    }
  }

  // Goal progress
  if (
    caloriesRemaining > 0 &&
    caloriesRemaining < 500 &&
    summary.entries.length > 0
  ) {
    suggestions.push({
      type: "goal",
      message: `Only ${caloriesRemaining} calories left for the day. You're doing great!`,
    });
  }

  // If close to or over goal
  if (caloriesRemaining <= 0) {
    suggestions.push({
      type: "goal",
      message: "You've reached your calorie goal for today!",
    });
  }

  // Default suggestion if none generated
  if (suggestions.length === 0 && summary.entries.length > 0) {
    suggestions.push({
      type: "balance",
      message: "You're on track! Keep up the good work.",
    });
  }

  return suggestions.slice(0, 2); // Max 2 suggestions
}

export function Suggestions({ summary, goals, className }: SuggestionsProps) {
  const suggestions = generateSuggestions(summary, goals);

  if (summary.entries.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Lightbulb className="size-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Start logging your meals to get personalized suggestions!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="size-4 text-amber-500" />
          Tips
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="space-y-1">
            <p className="text-sm">{suggestion.message}</p>
            {suggestion.foods && (
              <p className="text-xs text-muted-foreground">
                Try: {suggestion.foods.slice(0, 3).join(", ")}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
