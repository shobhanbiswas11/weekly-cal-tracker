import { schemaCreateProfile, schemaProfileEntity } from "@weekly-cal/core";
import z from "zod";

export type Profile = z.infer<typeof schemaProfileEntity>;
export type CreateProfile = z.infer<typeof schemaCreateProfile>;

export interface ProfileRepo {
  create: (userId: string, data: CreateProfile) => Promise<Profile>;
  update: (userId: string, data: Partial<CreateProfile>) => Promise<Profile>;
  delete: (userId: string) => Promise<void>;
  getByUserId: (userId: string) => Promise<Profile | null>;
}
