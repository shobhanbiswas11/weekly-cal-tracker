import z from "zod";
import { schemaActivityEntryEntity } from "../entities/activity-entry.entity";

export const schemaCreateActivityEntry = schemaActivityEntryEntity.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const schemaUpdateActivityEntry = schemaCreateActivityEntry.partial();

export type CreateActivityEntryDto = z.infer<typeof schemaCreateActivityEntry>;
export type UpdateActivityEntryDto = z.infer<typeof schemaUpdateActivityEntry>;
