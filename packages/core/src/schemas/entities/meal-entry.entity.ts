import z from "zod";
import { schemaCreateMealEntry } from "../dtos/create-meal-entry.dto";

export const schemaMealEntryEntity = schemaCreateMealEntry.extend({
  id: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
