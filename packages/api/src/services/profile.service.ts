import { inject, injectable } from "../di-utils";
import {
  PROFILE_REPO_TOKEN,
  type CreateProfile,
  type Profile,
  type ProfileRepo,
} from "../repo/profile.repo.interface";

@injectable()
export class ProfileService {
  constructor(private profileRepo: ProfileRepo = inject(PROFILE_REPO_TOKEN)) {}

  async create(userId: string, data: CreateProfile): Promise<Profile> {
    return this.profileRepo.create(userId, data);
  }

  async update(userId: string, data: Partial<CreateProfile>): Promise<Profile> {
    return this.profileRepo.update(userId, data);
  }

  async delete(userId: string): Promise<void> {
    return this.profileRepo.delete(userId);
  }

  async getByUserId(userId: string): Promise<Profile | null> {
    return this.profileRepo.getByUserId(userId);
  }

  async getSelectedFields<T extends keyof Profile>(
    userId: string,
    fields: T[],
  ): Promise<Pick<Profile, T> | null> {
    return this.profileRepo.getSelectedFieldsByUserId(userId, fields);
  }
}
