import { createRemoteJWKSet, jwtVerify } from "jose";
import { inject, injectable } from "../di-utils";
import { AppConfigService } from "./app-config.service";

@injectable()
export class TokenVerificationService {
  private jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

  constructor(private config = inject(AppConfigService)) {}

  private getJWKS(): ReturnType<typeof createRemoteJWKSet> {
    if (!this.jwks) {
      this.jwks = createRemoteJWKSet(
        new URL(`${this.config.jwtIssuer}/.well-known/jwks.json`),
      );
    }
    return this.jwks;
  }

  /**
   * Verify a Bearer token and return the userId (sub claim).
   * Throws if verification fails.
   */
  async verifyToken(token: string): Promise<string> {
    const { payload } = await jwtVerify(token, this.getJWKS(), {
      issuer: this.config.jwtIssuer,
    });

    if (!payload.sub) {
      throw new Error("Invalid token: no subject");
    }

    return payload.sub;
  }
}
