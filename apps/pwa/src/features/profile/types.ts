import type { CreateProfileDto, Profile } from "@weekly-cal/core";

export type ProfileResult = {
  action: "saved" | "canceled";
};

// Re-export from core for convenience
export type { Profile };
export type CreateProfile = CreateProfileDto;
