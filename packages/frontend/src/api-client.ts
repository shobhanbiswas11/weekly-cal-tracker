import type {
  ActivityEntry,
  ApiResponse,
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
import type {
  ApiClient,
  ApiClientConfig,
  ResponseActivitiesByDate,
} from "./types";

async function apiFetch<T = unknown>(
  endpoint: string,
  config: ApiClientConfig,
  options: RequestInit = {},
): Promise<T> {
  const token = await config.getToken();
  if (!token) {
    throw new Error("No authentication token available. Please sign in.");
  }

  const response = await config.fetch(`${config.baseUrl}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  const result: ApiResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || "API request failed");
  }

  return result.data as T;
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  const fetchApi = <T>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, config, options);

  return {
    fetchSummary: () => fetchApi<ResponseSummary>("/summary"),
    fetchWeeklySummary: (weekId: string) =>
      fetchApi<ResponseSummary>(`/weeks/${weekId}`),
    fetchEntriesByDate: (date: string) =>
      fetchApi<ResponseEntriesByDate>(`/entries/${date}`),
    createEntry: (data: CreateMealEntryDto) =>
      fetchApi<MealEntry>("/entries", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateEntry: (date: string, id: string, data: UpdateMealEntryDto) =>
      fetchApi<MealEntry>(`/entries/${date}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    deleteEntry: (date: string, id: string) =>
      fetchApi(`/entries/${date}/${id}`, { method: "DELETE" }),
    createProfile: (data: CreateProfileDto) =>
      fetchApi<Profile>("/profile", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateProfile: (data: UpdateProfileDto) =>
      fetchApi<Profile>("/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    fetchActivitiesByDate: (date: string) =>
      fetchApi<ResponseActivitiesByDate>(`/activities/${date}`),
    createActivity: (data: CreateActivityEntryDto) =>
      fetchApi<ActivityEntry>("/activities", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateActivity: (date: string, id: string, data: UpdateActivityEntryDto) =>
      fetchApi<ActivityEntry>(`/activities/${date}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    deleteActivity: (date: string, id: string) =>
      fetchApi(`/activities/${date}/${id}`, { method: "DELETE" }),
  };
}
