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

const API_BASE_URL = import.meta.env.VITE_API_URL;
const CHAT_URL = import.meta.env.VITE_CHAT_URL;

if (!API_BASE_URL) {
  throw new Error("Missing VITE_API_URL in environment");
}

if (!CHAT_URL) {
  throw new Error("Missing VITE_CHAT_URL in environment");
}

// Clerk types for window object
declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string | null>;
      };
    };
  }
}

// =============================================================================
// Auth
// =============================================================================

// Get the current auth token from Clerk
async function getAuthToken(): Promise<string> {
  const token = await window.Clerk?.session?.getToken();
  if (!token) {
    throw new Error("No authentication token available. Please sign in.");
  }
  return token;
}

// =============================================================================
// Generic Fetch Wrapper
// =============================================================================

async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAuthToken();

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
// API Functions
// =============================================================================

export async function fetchSummary() {
  return apiFetch<ResponseSummary>("/summary");
}

export async function fetchWeeklySummary(weekId: string) {
  return apiFetch<ResponseSummary>(`/weeks/${weekId}`);
}

export async function fetchEntriesByDate(date: string) {
  return apiFetch<ResponseEntriesByDate>(`/entries/${date}`);
}

export async function createEntry(data: CreateMealEntryDto) {
  return apiFetch<MealEntry>("/entries", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEntry(
  date: string,
  id: string,
  data: UpdateMealEntryDto,
) {
  return apiFetch<MealEntry>(`/entries/${date}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteEntry(date: string, id: string) {
  return apiFetch(`/entries/${date}/${id}`, {
    method: "DELETE",
  });
}

export async function createProfile(data: CreateProfileDto) {
  return apiFetch<Profile>("/profile", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProfile(data: UpdateProfileDto) {
  return apiFetch<Profile>("/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export { API_BASE_URL, CHAT_URL, getAuthToken };
