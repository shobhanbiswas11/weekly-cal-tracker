import { inject, injectable } from "../di-utils";
import {
  ACTIVITY_ENTRY_REPO_TOKEN,
  type ActivityEntry,
  type ActivityEntryRepo,
  type CreateActivityEntry,
} from "../repo/activity-entry.repo.interface";
import type { ISODate } from "../repo/types";

@injectable()
export class ActivityService {
  constructor(
    private activityEntryRepo: ActivityEntryRepo = inject(
      ACTIVITY_ENTRY_REPO_TOKEN,
    ),
  ) {}

  async create(
    userId: string,
    data: CreateActivityEntry,
  ): Promise<ActivityEntry> {
    return this.activityEntryRepo.create(userId, data);
  }

  async update(
    userId: string,
    id: string,
    data: Partial<CreateActivityEntry>,
  ): Promise<ActivityEntry> {
    return this.activityEntryRepo.update(userId, id, data);
  }

  async delete(userId: string, id: string): Promise<void> {
    return this.activityEntryRepo.delete(userId, id);
  }

  async getById(userId: string, id: string): Promise<ActivityEntry | null> {
    return this.activityEntryRepo.getById(userId, id);
  }

  async getByDate(userId: string, date: ISODate): Promise<ActivityEntry[]> {
    return this.activityEntryRepo.getByDate(userId, date);
  }

  async getByDateRange(
    userId: string,
    startDate: ISODate,
    endDate?: ISODate,
  ): Promise<ActivityEntry[]> {
    return this.activityEntryRepo.getByDateRange(userId, startDate, endDate);
  }
}
