import z from "zod";
import { schemaProfileEntity } from "../entities/profile.entity";

export const schemaCreateProfile = schemaProfileEntity.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Update schema - all fields optional for partial updates
export const schemaUpdateProfile = schemaCreateProfile.partial();

export type CreateProfileDto = z.infer<typeof schemaCreateProfile>;
export type UpdateProfileDto = z.infer<typeof schemaUpdateProfile>;
