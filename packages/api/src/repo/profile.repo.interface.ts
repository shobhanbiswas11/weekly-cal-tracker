import type {
  CreateProfileDto as CreateProfile,
  Profile,
} from "@weekly-cal/core";
import { InjectionToken } from "../di-utils";

export { schemaProfileEntity } from "@weekly-cal/core";
export type { CreateProfile, Profile };

export interface ProfileRepo {
  create: (userId: string, data: CreateProfile) => Promise<Profile>;
  update: (userId: string, data: Partial<CreateProfile>) => Promise<Profile>;
  delete: (userId: string) => Promise<void>;
  getByUserId: (userId: string) => Promise<Profile | null>;
  getSelectedFieldsByUserId: <T extends keyof Profile>(
    userId: string,
    fields: T[],
  ) => Promise<Pick<Profile, T> | null>;
  incrementChatMessageCount: (userId: string) => Promise<number>;
}

export const PROFILE_REPO_TOKEN = new InjectionToken<ProfileRepo>(
  "PROFILE_REPO",
);
