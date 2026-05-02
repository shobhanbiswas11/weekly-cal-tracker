import { inject, injectable, MEAL_ENTRY_REPO } from "../di";
import type {
  CreateMealEntry,
  MealEntry,
  MealEntryRepo,
} from "../repo/meal-entry.repo.interface";
import type { ISODate } from "../repo/types";

@injectable()
export class MealService {
  constructor(private mealEntryRepo: MealEntryRepo = inject(MEAL_ENTRY_REPO)) {}

  async create(userId: string, data: CreateMealEntry): Promise<MealEntry> {
    return this.mealEntryRepo.create(userId, data);
  }

  async update(
    userId: string,
    id: string,
    data: Partial<CreateMealEntry>,
  ): Promise<MealEntry> {
    return this.mealEntryRepo.update(userId, id, data);
  }

  async delete(userId: string, id: string): Promise<void> {
    return this.mealEntryRepo.delete(userId, id);
  }

  async getById(userId: string, id: string): Promise<MealEntry | null> {
    return this.mealEntryRepo.getById(userId, id);
  }

  async getByDate(userId: string, date: ISODate): Promise<MealEntry[]> {
    return this.mealEntryRepo.getByDate(userId, date);
  }

  async getByDateRange(
    userId: string,
    startDate: ISODate,
    endDate?: ISODate,
  ): Promise<MealEntry[]> {
    return this.mealEntryRepo.getByDateRange(userId, startDate, endDate);
  }
}
