import { Card, CardContent } from "@/components/ui/card";
import type { Toolkit } from "@/features/chat";
import { MealLogPreview } from "./components";
import { LogMealSchema } from "./schemas";

export const calorieTools: Toolkit = {
  preview_meal_log: {
    description: `Preview a meal with nutritional information for user confirmation. This tool displays the meal breakdown in a user-friendly card format with a "Log" button - the user performs the actual logging action.

IMPORTANT WORKFLOW:
1. When user describes what they ate, immediately call this tool with your estimation
2. Group identical food items together with a quantity field - do NOT list the same item multiple times (e.g., "6 eggs" becomes one item with name="Egg" and quantity=6)
3. Each item's nutrition values should be the TOTAL for that quantity (e.g., 6 eggs = 6 × per-egg values)
4. Sum up all items to get the total nutrition values (calories, protein, carbs, fat, fiber, sugar, sodium)
5. The preview card will display both the itemized breakdown AND the totals, so the user can verify your calculations
6. DO NOT ask "does this look right?" before calling - the preview UI handles confirmation
7. If you need to ask clarifying questions (portion size, cooking method, etc.), ask BEFORE calling this tool

Estimation approach:
- Estimate on the MODERATELY higher side when uncertain
- Consider portion sizes and cooking methods
- Homemade food typically has fewer calories than restaurant/takeout
- ALWAYS include fiber, sugar, and sodium estimates for each item

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
