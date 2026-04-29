import { UpdateProfileDto } from "../schemas";

export type UpdateProfilePayload =
  | {
      state: "initiated";
      changes: UpdateProfileDto;
      message: string;
    }
  | {
      state: "confirmed" | "cancelled" | "error";
      message: string;
    };

export type LogMealPayload =
  | {
      state: "initiated";
      name: string;
      date: string;
      note: string | null;
      foodItems: {
        name: string;
        calories: number;
        quantity: string;
        protein: number;
        carbs: number;
        fats: number;
        fiber: number;
        sugar: number;
        sodium: number;
      }[];
    }
  | {
      state: "confirmed" | "cancelled" | "error";
      message: string;
    };
