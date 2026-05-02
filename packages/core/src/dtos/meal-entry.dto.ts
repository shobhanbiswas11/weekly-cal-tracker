import z from "zod";
import { schemaMealEntryEntity } from "../entities/meal-entry.entity";

// Tool input schema for log_meal (AI passes this)
export const schemaCreateMealEntry = schemaMealEntryEntity.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Update schema - all fields optional except timestamps (handled server-side)
export const schemaUpdateMealEntry = schemaCreateMealEntry.partial();

export type CreateMealEntryDto = z.infer<typeof schemaCreateMealEntry>;
export type UpdateMealEntryDto = z.infer<typeof schemaUpdateMealEntry>;
