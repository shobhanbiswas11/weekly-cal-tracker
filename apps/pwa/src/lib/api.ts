// API client for backend communication

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
// API Types - Matching backend structure
// =============================================================================

// Generic record type (backend accepts flexible schema)
type DataRecord = Record<string, unknown>;

// API Response wrapper (from backend shared/http.ts)
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// -----------------------------------------------------------------------------
// Dashboard
// -----------------------------------------------------------------------------

/** GET /dashboard response */
export interface DashboardResponse {
  profile: ProfileData | null;
  weekId: string; // Format: YYYY-Www (e.g., "2026-W13")
  entries: EntryData[];
}

// -----------------------------------------------------------------------------
// Profile
// -----------------------------------------------------------------------------

/** Profile data structure */
export interface ProfileData extends DataRecord {
  name?: string;
  age?: number;
  height?: number;
  weight?: number;
  calorieGoal?: number;
  proteinGoal?: number;
  carbsGoal?: number;
  fatsGoal?: number;
}

/** PUT /profile request body */
export type ProfileUpdateRequest = Partial<ProfileData>;

/** POST/PUT /profile response */
export interface ProfileResponse {
  profile: ProfileData;
}

// -----------------------------------------------------------------------------
// Entries
// -----------------------------------------------------------------------------

/** Entry data structure (stored in DynamoDB) */
export interface EntryData extends DataRecord {
  id: string; // UUID
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO 8601
  name?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

/** POST /entries request body */
export interface EntryCreateRequest extends DataRecord {
  name?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  date?: string; // YYYY-MM-DD, defaults to today if not provided
}

/** PUT /entries/{date}/{id} request body */
export type EntryUpdateRequest = Partial<Omit<EntryData, "id" | "date">>;

/** GET /entries/{date} response */
export interface EntriesByDateResponse {
  entries: EntryData[];
}

/** DELETE /entries/{date}/{id} response */
export interface EntryDeleteResponse {
  message: string;
}

// -----------------------------------------------------------------------------
// Weekly Summary
// -----------------------------------------------------------------------------

/** GET /weeks/{weekId} response */
export interface WeeklySummaryResponse {
  weekId: string; // Format: YYYY-Www
  entries: EntryData[];
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

  const result: ApiResponse<T> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "API request failed");
  }

  return result.data as T;
}

// =============================================================================
// API Functions
// =============================================================================

/** GET /dashboard - Initialize app with current week's profile and entries */
export async function fetchDashboard(): Promise<DashboardResponse> {
  return apiFetch<DashboardResponse>("/dashboard");
}

/** GET /weeks/{weekId} - Get summary for a specific week */
export async function fetchWeeklySummary(
  weekId: string,
): Promise<WeeklySummaryResponse> {
  return apiFetch<WeeklySummaryResponse>(`/weeks/${weekId}`);
}

/** GET /entries/{date} - Get all entries for a specific date */
export async function fetchEntriesByDate(
  date: string,
): Promise<EntriesByDateResponse> {
  return apiFetch<EntriesByDateResponse>(`/entries/${date}`);
}

/** POST /entries - Create a new food entry */
export async function createEntry(
  data: EntryCreateRequest,
): Promise<EntryData> {
  return apiFetch<EntryData>("/entries", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** PUT /entries/{date}/{id} - Update an existing food entry */
export async function updateEntry(
  date: string,
  id: string,
  data: EntryUpdateRequest,
): Promise<EntryData> {
  return apiFetch<EntryData>(`/entries/${date}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/** DELETE /entries/{date}/{id} - Delete a food entry */
export async function deleteEntry(
  date: string,
  id: string,
): Promise<EntryDeleteResponse> {
  return apiFetch<EntryDeleteResponse>(`/entries/${date}/${id}`, {
    method: "DELETE",
  });
}

/** PUT /profile - Update user profile */
export async function updateProfile(
  data: ProfileUpdateRequest,
): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse>("/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// =============================================================================
// Exports
// =============================================================================

export { API_BASE_URL, CHAT_URL, getAuthToken };
