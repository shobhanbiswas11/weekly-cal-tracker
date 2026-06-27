import z from "zod";
import { schemaProfileEntity } from "../entities/profile.entity";

export const schemaCreateProfile = schemaProfileEntity.pick({
  name: true,
  dateOfBirth: true,
  biologicalSex: true,
  height: true,
  weight: true,
  activityLevel: true,
  goal: true,
  additionalNotes: true,
});

// Update schema - all fields optional for partial updates
export const schemaUpdateProfile = schemaCreateProfile.partial();

export type CreateProfileDto = z.infer<typeof schemaCreateProfile>;
export type UpdateProfileDto = z.infer<typeof schemaUpdateProfile>;
