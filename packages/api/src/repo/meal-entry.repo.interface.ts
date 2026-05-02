import { schemaCreateMealEntry, schemaMealEntryEntity } from "@weekly-cal/core";
import type { z } from "zod";
import { InjectionToken } from "../di-utils";
import type { ISODate } from "./types";

export type MealEntry = z.infer<typeof schemaMealEntryEntity>;
export type CreateMealEntry = z.infer<typeof schemaCreateMealEntry>;

export interface MealEntryRepo {
  create: (userId: string, data: CreateMealEntry) => Promise<MealEntry>;
  update: (
    userId: string,
    id: string,
    data: Partial<CreateMealEntry>,
  ) => Promise<MealEntry>;
  delete: (userId: string, id: string) => Promise<void>;
  getById: (userId: string, id: string) => Promise<MealEntry | null>;
  getByDate: (userId: string, date: ISODate) => Promise<MealEntry[]>;
  getByDateRange: (
    userId: string,
    startDate: ISODate,
    endDate?: ISODate,
  ) => Promise<MealEntry[]>;
}

export const MEAL_ENTRY_REPO_TOKEN = new InjectionToken<MealEntryRepo>(
  "MEAL_ENTRY_REPO",
);
