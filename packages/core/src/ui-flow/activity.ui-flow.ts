import { defaultFlowBuilder } from "./utils";

const actions = {
  logActivity: "LOG_ACTIVITY",
  updateActivity: "UPDATE_ACTIVITY",
  deleteActivity: "DELETE_ACTIVITY",
} as const;

export interface LogActivityUIFlowPayload {
  name: string;
  date: string;
  caloriesBurned: number;
  note: string | null;
}

export type DeleteActivityPayload = {
  activityId: string;
  date: string;
  activityName: string;
};

export type UpdateActivityPayload = {
  activityId: string;
  date: string;
  activityName: string;
  changes: Array<{ field: string; value: string }>;
};

export const uiFlowActivity = {
  log: defaultFlowBuilder<LogActivityUIFlowPayload>(actions.logActivity),
  update: defaultFlowBuilder<UpdateActivityPayload>(actions.updateActivity),
  delete: defaultFlowBuilder<DeleteActivityPayload>(actions.deleteActivity),
};

export { actions as activityUIFlowActions };
