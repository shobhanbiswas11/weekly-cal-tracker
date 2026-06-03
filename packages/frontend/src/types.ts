import type {
  ActivityEntry,
  CreateActivityEntryDto,
  CreateMealEntryDto,
  CreateProfileDto,
  MealEntry,
  Profile,
  ResponseEntriesByDate,
  ResponseSummary,
  UpdateActivityEntryDto,
  UpdateMealEntryDto,
  UpdateProfileDto,
} from "@weekly-cal/core";

export type GetToken = () => Promise<string | null>;

export type FetchFn = typeof globalThis.fetch;

export interface ApiClientConfig {
  baseUrl: string;
  getToken: GetToken;
  fetch: FetchFn;
}

export interface ResponseActivitiesByDate {
  entries: ActivityEntry[];
}

export interface ApiClient {
  fetchSummary: (weekId?: string) => Promise<ResponseSummary>;
  fetchEntriesByDate: (date: string) => Promise<ResponseEntriesByDate>;
  createEntry: (data: CreateMealEntryDto) => Promise<MealEntry>;
  updateEntry: (
    date: string,
    id: string,
    data: UpdateMealEntryDto,
  ) => Promise<MealEntry>;
  deleteEntry: (date: string, id: string) => Promise<unknown>;
  createProfile: (data: CreateProfileDto) => Promise<Profile>;
  updateProfile: (data: UpdateProfileDto) => Promise<Profile>;
  fetchActivitiesByDate: (date: string) => Promise<ResponseActivitiesByDate>;
  createActivity: (data: CreateActivityEntryDto) => Promise<ActivityEntry>;
  updateActivity: (
    date: string,
    id: string,
    data: UpdateActivityEntryDto,
  ) => Promise<ActivityEntry>;
  deleteActivity: (date: string, id: string) => Promise<unknown>;
  deleteAccount: () => Promise<{ message: string }>;
}
