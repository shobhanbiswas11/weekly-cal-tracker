import { schemaCreateProfile, schemaProfileEntity } from "@weekly-cal/core";
import type { z } from "zod";
import { InjectionToken } from "../di-utils";

export type Profile = z.infer<typeof schemaProfileEntity>;
export type CreateProfile = z.infer<typeof schemaCreateProfile>;

export interface ProfileRepo {
  create: (userId: string, data: CreateProfile) => Promise<Profile>;
  update: (userId: string, data: Partial<CreateProfile>) => Promise<Profile>;
  delete: (userId: string) => Promise<void>;
  getByUserId: (userId: string) => Promise<Profile | null>;
  getSelectedFieldsByUserId: <T extends keyof Profile>(
    userId: string,
    fields: T[],
  ) => Promise<Pick<Profile, T> | null>;
}

export const PROFILE_REPO_TOKEN = new InjectionToken<ProfileRepo>(
  "PROFILE_REPO",
);
