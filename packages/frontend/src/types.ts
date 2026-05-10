import type {
  CreateMealEntryDto,
  CreateProfileDto,
  MealEntry,
  Profile,
  ResponseEntriesByDate,
  ResponseSummary,
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

export interface ApiClient {
  fetchSummary: () => Promise<ResponseSummary>;
  fetchWeeklySummary: (weekId: string) => Promise<ResponseSummary>;
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
}
