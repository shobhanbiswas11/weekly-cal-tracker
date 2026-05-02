import { injectable } from "../di-utils";

@injectable()
export class AuthService {
  constructor(public readonly userId: string) {}
}
