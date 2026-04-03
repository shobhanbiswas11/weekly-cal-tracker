import { Card, CardContent } from "@/components/ui/card";
import type { Toolkit } from "@/features/chat";
import { MealLogPreview } from "./components";
import { LogMealSchema } from "./schemas";

export const calorieTools: Toolkit = {
  preview_meal_log: {
    description: `Preview a meal with nutritional information for user confirmation. This tool displays the meal breakdown in a user-friendly card format with a "Log" button - the user performs the actual logging action.

IMPORTANT WORKFLOW:
1. When user describes what they ate, calculate the TOTAL nutrition for ALL items combined
2. Present your estimation to the user in chat FIRST (e.g., "Here's my estimate for your breakfast: ~450 cal, 25g protein, 40g carbs, 20g fat. Does this look right?")
3. Only call this tool AFTER the user confirms they're okay with the estimate
4. Preview everything as ONE meal entry, not separate entries for each food item

Estimation approach:
- Estimate on the MODERATELY higher side when uncertain
- Consider portion sizes and cooking methods
- Homemade food typically has fewer calories than restaurant/takeout

Date handling:
- Today's date is in the system context
- Calculate relative dates ("yesterday", "last Monday", etc.) from today
- Omit date field if no time reference (defaults to today)`,
    parameters: LogMealSchema,
    render: ({ args }) => {
      const parsedArgs = LogMealSchema.safeParse(args);

      if (parsedArgs.success) {
        return <MealLogPreview meal={parsedArgs.data.meal} />;
      }

      return (
        <Card size="sm">
          <CardContent className="text-muted-foreground">
            Calculating nutrition...
          </CardContent>
        </Card>
      );
    },
  },
};
