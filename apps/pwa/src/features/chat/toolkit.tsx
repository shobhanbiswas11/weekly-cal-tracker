import { type Toolkit } from "@assistant-ui/react";
import { calorieTools } from "../calories/tools";
import { profileTools } from "../profile";

// Toolkit with frontend tools
export const toolkit: Toolkit = {
  ...profileTools,
  ...calorieTools,
};
