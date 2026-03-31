// API client for backend communication

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const CHAT_URL = import.meta.env.VITE_CHAT_URL || "http://localhost:3000/chat";

// Get the current auth token
// Uses Clerk's getToken() when available, falls back to localStorage
async function getAuthToken(): Promise<string> {
  // Try to get token from Clerk (if available in window context)

  const clerk = (
    window as unknown as {
      __clerk_frontend_api?: { session?: { getToken?: () => Promise<string> } };
    }
  ).__clerk_frontend_api;
  if (clerk?.session?.getToken) {
    const token = await clerk.session.getToken();
    if (token) return token;
  }

  // Fallback to localStorage (for development)
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("No authentication token available");
  }
  return token;
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Generic fetch wrapper with auth
async function apiFetch<T>(
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
// API Types (matching backend)
// =============================================================================

export interface FoodEntry {
  id: string;
  date: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string;
  rawInput?: string;
}

export interface DailySummary {
  date: string;
  entries: FoodEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface WeeklySummary {
  weekId: string;
  startDate: string;
  endDate: string;
  days: DailySummary[];
  weeklyTotalCalories: number;
  weeklyTotalProtein: number;
  weeklyTotalCarbs: number;
  weeklyTotalFat: number;
  averageDailyCalories: number;
}

export interface DashboardResponse {
  profile: Record<string, unknown> | null;
  currentWeek: WeeklySummary;
}

export interface CreateEntryRequest {
  date?: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface UpdateEntryRequest {
  name?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

// =============================================================================
// API Functions
// =============================================================================

// Dashboard (app init)
export async function fetchDashboard(): Promise<DashboardResponse> {
  return apiFetch<DashboardResponse>("/dashboard");
}

// Weekly summary
export async function fetchWeeklySummary(
  weekId: string,
): Promise<WeeklySummary> {
  return apiFetch<WeeklySummary>(`/weeks/${weekId}`);
}

// Entries
export async function createEntry(
  data: CreateEntryRequest,
): Promise<FoodEntry> {
  return apiFetch<FoodEntry>("/entries", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEntry(
  date: string,
  id: string,
  data: UpdateEntryRequest,
): Promise<FoodEntry> {
  return apiFetch<FoodEntry>(`/entries/${date}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteEntry(date: string, id: string): Promise<void> {
  await apiFetch<{ message: string }>(`/entries/${date}/${id}`, {
    method: "DELETE",
  });
}

// Profile
export async function updateProfile(
  data: Record<string, unknown>,
): Promise<{ profile: Record<string, unknown> }> {
  return apiFetch<{ profile: Record<string, unknown> }>("/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// =============================================================================
// Exports
// =============================================================================

export { API_BASE_URL, CHAT_URL, getAuthToken };
