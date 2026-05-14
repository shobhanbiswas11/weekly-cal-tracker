import {
  activityUIFlowActions,
  mealUIFlowActions,
  profileUIFlowActions,
} from "@weekly-cal/core";
import type { ComponentType, ReactNode } from "react";
import { DeleteActivity } from "./delete-activity";
import { DeleteMeal } from "./delete-meal";
import { LogActivity } from "./log-activity";
import { LogMeal } from "./log-meal";
import type { UIFlowRendererProps } from "./types";
import { UpdateActivity } from "./update-activity";
import { UpdateMeal } from "./update-meal";
import { UpdateProfile } from "./update-profile";

const registry: Map<string, ComponentType<any>> = new Map();

function addToRegistry(action: string, component: ComponentType<any>) {
  registry.set(action, component);
}

// Profiles
addToRegistry(profileUIFlowActions.updateProfile, UpdateProfile);

// Meals
addToRegistry(mealUIFlowActions.logMeal, LogMeal);
addToRegistry(mealUIFlowActions.updateMeal, UpdateMeal);
addToRegistry(mealUIFlowActions.deleteMeal, DeleteMeal);

// Activities
addToRegistry(activityUIFlowActions.logActivity, LogActivity);
addToRegistry(activityUIFlowActions.updateActivity, UpdateActivity);
addToRegistry(activityUIFlowActions.deleteActivity, DeleteActivity);

export function renderUIFlow(props: UIFlowRendererProps): ReactNode {
  const Component = registry.get(props.flow.action);
  if (!Component) return null;

  return <Component {...props} />;
}
