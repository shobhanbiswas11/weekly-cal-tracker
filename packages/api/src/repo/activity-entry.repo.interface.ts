import {
  schemaActivityEntryEntity,
  schemaCreateActivityEntry,
} from "@weekly-cal/core";
import type { z } from "zod";
import { InjectionToken } from "../di-utils";
import type { ISODate } from "./types";

export type ActivityEntry = z.infer<typeof schemaActivityEntryEntity>;
export type CreateActivityEntry = z.infer<typeof schemaCreateActivityEntry>;

export interface ActivityEntryRepo {
  create: (userId: string, data: CreateActivityEntry) => Promise<ActivityEntry>;
  update: (
    userId: string,
    id: string,
    data: Partial<CreateActivityEntry>,
  ) => Promise<ActivityEntry>;
  delete: (userId: string, id: string) => Promise<void>;
  getById: (userId: string, id: string) => Promise<ActivityEntry | null>;
  getByDate: (userId: string, date: ISODate) => Promise<ActivityEntry[]>;
  getByDateRange: (
    userId: string,
    startDate: ISODate,
    endDate?: ISODate,
  ) => Promise<ActivityEntry[]>;
}

export const ACTIVITY_ENTRY_REPO_TOKEN = new InjectionToken<ActivityEntryRepo>(
  "ACTIVITY_ENTRY_REPO",
);
