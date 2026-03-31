// API client for backend communication
// Backend stores generic records - no strict types needed

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

// Get the current auth token from Clerk
async function getAuthToken(): Promise<string> {
  const token = await window.Clerk?.session?.getToken();
  if (!token) {
    throw new Error("No authentication token available. Please sign in.");
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
// API Functions - All return generic records
// =============================================================================

// Dashboard (app init)
export async function fetchDashboard(): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>("/dashboard");
}

// Weekly summary
export async function fetchWeeklySummary(weekId: string) {
  return apiFetch(`/weeks/${weekId}`);
}

// Entries
export async function createEntry(data: Record<string, unknown>) {
  return apiFetch("/entries", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEntry(
  date: string,
  id: string,
  data: Record<string, unknown>,
) {
  return apiFetch(`/entries/${date}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteEntry(date: string, id: string) {
  await apiFetch(`/entries/${date}/${id}`, {
    method: "DELETE",
  });
}

// Profile
export async function updateProfile(data: Record<string, unknown>) {
  return apiFetch("/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// =============================================================================
// Exports
// =============================================================================

export { API_BASE_URL, CHAT_URL, getAuthToken };
