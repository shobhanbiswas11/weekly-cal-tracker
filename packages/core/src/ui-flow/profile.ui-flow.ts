import type { UpdateProfileDto } from "../dtos";
import { defaultFlowBuilder } from "./utils";

const actions = {
  updateProfile: "UPDATE_PROFILE",
} as const;

interface ProfileUpdateUIFlowPayload {
  message: string;
  changes: UpdateProfileDto;
}

export const uiFlowProfile = {
  update: defaultFlowBuilder<ProfileUpdateUIFlowPayload>(actions.updateProfile),
};

export { actions as profileUIFlowActions };
