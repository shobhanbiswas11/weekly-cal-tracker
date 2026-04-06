import type {
  schemaCreateProfile,
  schemaProfileEntity,
} from "@weekly-cal/core";
import type z from "zod";

export type ProfileResult = {
  action: "saved" | "canceled";
};

export type Profile = z.infer<typeof schemaProfileEntity>;
export type CreateProfile = z.infer<typeof schemaCreateProfile>;
