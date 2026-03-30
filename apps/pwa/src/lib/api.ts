import type {
  ApiResponse,
  CalorieEntry,
  DailySummary,
  WeeklySummary,
} from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type GetToken = () => Promise<string | null>;

class ApiClient {
  private getToken: GetToken | null = null;

  setTokenGetter(getToken: GetToken) {
    this.getToken = getToken;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    if (!this.getToken) {
      return { success: false, error: "Not authenticated" };
    }

    const token = await this.getToken();
    if (!token) {
      return { success: false, error: "No auth token available" };
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Request failed with status ${response.status}`,
        };
      }

      return data as ApiResponse<T>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  async parseEntry(
    input: string,
    date?: string,
  ): Promise<ApiResponse<{ entries: CalorieEntry[]; message: string }>> {
    return this.fetch("/entries/parse", {
      method: "POST",
      body: JSON.stringify({ input, date }),
    });
  }

  async getEntries(date?: string): Promise<ApiResponse<DailySummary>> {
    const params = date ? `?date=${date}` : "";
    return this.fetch(`/entries${params}`);
  }

  async getWeeklySummary(): Promise<ApiResponse<WeeklySummary>> {
    return this.fetch("/summary");
  }

  async deleteEntry(
    date: string,
    entryId: string,
  ): Promise<ApiResponse<{ message: string }>> {
    return this.fetch(`/entries/${date}/${entryId}`, {
      method: "DELETE",
    });
  }
}

export const api = new ApiClient();
