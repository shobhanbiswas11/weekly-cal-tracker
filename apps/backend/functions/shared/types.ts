// Shared types for Lambda functions

export interface CalorieEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string; // ISO 8601
  rawInput?: string;
}

export interface DynamoDBEntry {
  PK: string; // USER#<userId>
  SK: string; // DATE#YYYY-MM-DD#ENTRY#<uuid>
  id: string;
  date: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string;
  rawInput?: string;
}

export interface DailySummary {
  date: string;
  entries: CalorieEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface WeeklySummary {
  startDate: string;
  endDate: string;
  days: DailySummary[];
  weeklyTotalCalories: number;
  weeklyTotalProtein: number;
  weeklyTotalCarbs: number;
  weeklyTotalFat: number;
  averageDailyCalories: number;
}

export interface ParseEntryRequest {
  input: string;
  date?: string; // Optional, defaults to today
}

export interface ParseEntryResponse {
  entries: CalorieEntry[];
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// OpenAI tool definition for save_calorie_entry
export const SAVE_ENTRY_TOOL = {
  type: "function" as const,
  function: {
    name: "save_calorie_entry",
    description:
      "Save a food entry with its nutritional information. Call this function for each distinct food item the user mentions.",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description:
            "Name of the food item (e.g., 'Turkey sandwich', 'Large latte')",
        },
        calories: {
          type: "number",
          description: "Estimated total calories for this food item",
        },
        protein: {
          type: "number",
          description: "Estimated grams of protein",
        },
        carbs: {
          type: "number",
          description: "Estimated grams of carbohydrates",
        },
        fat: {
          type: "number",
          description: "Estimated grams of fat",
        },
      },
      required: ["name", "calories", "protein", "carbs", "fat"],
    },
  },
};

export const SYSTEM_PROMPT = `You are a nutrition assistant for a calorie tracking app. When the user describes what they ate or drank, extract each distinct food item and estimate its nutritional content.

For each food item mentioned, call the save_calorie_entry function with:
- name: A clear, concise name for the food
- calories: Your best estimate of total calories
- protein: Estimated grams of protein
- carbs: Estimated grams of carbohydrates  
- fat: Estimated grams of fat

Guidelines:
- If the user mentions multiple items (e.g., "eggs and toast"), make separate function calls for each
- Use reasonable estimates based on typical portions if quantity isn't specified
- For branded items, use typical nutritional values
- Round nutritional values to reasonable numbers
- If unsure, use conservative middle-ground estimates

Examples:
- "2 eggs" → ~140 cal, 12g protein, 1g carbs, 10g fat
- "slice of toast with butter" → ~150 cal, 3g protein, 20g carbs, 7g fat
- "large latte" → ~190 cal, 10g protein, 18g carbs, 7g fat
- "chicken caesar salad" → ~400 cal, 35g protein, 15g carbs, 22g fat`;
