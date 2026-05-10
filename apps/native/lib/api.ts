// API client for backend communication

import type {
  ApiResponse,
  CreateMealEntryDto,
  CreateProfileDto,
  MealEntry,
  Profile,
  ResponseEntriesByDate,
  ResponseSummary,
  UpdateMealEntryDto,
  UpdateProfileDto,
} from "@weekly-cal/core";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const CHAT_URL = process.env.EXPO_PUBLIC_CHAT_ENDPOINT_URL;

if (!API_BASE_URL) {
  throw new Error("Missing EXPO_PUBLIC_API_URL in environment");
}

if (!CHAT_URL) {
  throw new Error("Missing EXPO_PUBLIC_CHAT_ENDPOINT_URL in environment");
}

type GetToken = () => Promise<string | null>;

// =============================================================================
// Generic Fetch Wrapper
// =============================================================================

async function apiFetch<T = unknown>(
  endpoint: string,
  getToken: GetToken,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();
  if (!token) {
    throw new Error("No authentication token available. Please sign in.");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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

// =============================================================================
// API Client Factory
// =============================================================================

export function createApiClient(getToken: GetToken) {
  const fetch = <T>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, getToken, options);

  return {
    fetchSummary: () => fetch<ResponseSummary>("/summary"),
    fetchWeeklySummary: (weekId: string) =>
      fetch<ResponseSummary>(`/weeks/${weekId}`),
    fetchEntriesByDate: (date: string) =>
      fetch<ResponseEntriesByDate>(`/entries/${date}`),
    createEntry: (data: CreateMealEntryDto) =>
      fetch<MealEntry>("/entries", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateEntry: (date: string, id: string, data: UpdateMealEntryDto) =>
      fetch<MealEntry>(`/entries/${date}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    deleteEntry: (date: string, id: string) =>
      fetch(`/entries/${date}/${id}`, { method: "DELETE" }),
    createProfile: (data: CreateProfileDto) =>
      fetch<Profile>("/profile", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateProfile: (data: UpdateProfileDto) =>
      fetch<Profile>("/profile", { method: "PUT", body: JSON.stringify(data) }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

export { API_BASE_URL, CHAT_URL };
export type { GetToken };
