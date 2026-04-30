import { defaultFlowBuilder } from "./utils";

const actions = {
  logMeal: "LOG_MEAL",
  updateMeal: "UPDATE_MEAL",
  deleteMeal: "DELETE_MEAL",
} as const;

export interface LogMealUIFlowPayload {
  name: string;
  date: string;
  note: string | null;
  foodItems: {
    name: string;
    calories: number;
    quantity: string;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    sugar: number;
    sodium: number;
  }[];
}

export type DeleteMealPayload = {
  mealId: string;
  date: string;
  mealName: string;
};

export type UpdateMealPayload = {
  mealId: string;
  date: string;
  mealName: string;
  changes: Array<{ field: string; value: string }>;
};

export const uiFlowMeal = {
  log: defaultFlowBuilder<LogMealUIFlowPayload>(actions.logMeal),
  update: defaultFlowBuilder<UpdateMealPayload>(actions.updateMeal),
  delete: defaultFlowBuilder<DeleteMealPayload>(actions.deleteMeal),
};

export { actions as mealUIFlowActions };
