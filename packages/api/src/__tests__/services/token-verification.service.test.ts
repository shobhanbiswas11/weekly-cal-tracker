import { AppConfigService } from "@/services/app-config.service";
import { TokenVerificationService } from "@/services/token-verification.service";
import { TEST_USER_ID, testEnv } from "../helpers/test-fixtures";

// Mock the jose module
vi.mock("jose", () => ({
  createRemoteJWKSet: vi.fn(() => "mock-jwks"),
  jwtVerify: vi.fn(),
}));

import { createRemoteJWKSet, jwtVerify } from "jose";

// =============================================================================
// Tests
// =============================================================================

describe("TokenVerificationService", () => {
  let service: TokenVerificationService;

  beforeEach(() => {
    const config = new AppConfigService(
      testEnv as unknown as NodeJS.ProcessEnv,
    );
    service = new TokenVerificationService(config);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns userId from valid token", async () => {
    vi.mocked(jwtVerify).mockResolvedValueOnce({
      payload: { sub: TEST_USER_ID, iss: testEnv.JWT_ISSUER },
      protectedHeader: { alg: "RS256" },
    } as any);

    const userId = await service.verifyToken("valid-token");

    expect(userId).toBe(TEST_USER_ID);
    expect(jwtVerify).toHaveBeenCalledWith("valid-token", "mock-jwks", {
      issuer: testEnv.JWT_ISSUER,
    });
  });

  it("throws when token has no sub claim", async () => {
    vi.mocked(jwtVerify).mockResolvedValueOnce({
      payload: { iss: testEnv.JWT_ISSUER },
      protectedHeader: { alg: "RS256" },
    } as any);

    await expect(service.verifyToken("no-sub-token")).rejects.toThrow(
      "Invalid token: no subject",
    );
  });

  it("throws when jwtVerify rejects (expired/invalid token)", async () => {
    vi.mocked(jwtVerify).mockRejectedValueOnce(new Error("JWT expired"));

    await expect(service.verifyToken("expired-token")).rejects.toThrow(
      "JWT expired",
    );
  });

  it("creates JWKS from correct URL", async () => {
    vi.mocked(jwtVerify).mockResolvedValueOnce({
      payload: { sub: TEST_USER_ID },
      protectedHeader: { alg: "RS256" },
    } as any);

    await service.verifyToken("token");

    expect(createRemoteJWKSet).toHaveBeenCalledWith(
      new URL(`${testEnv.JWT_ISSUER}/.well-known/jwks.json`),
    );
  });

  it("caches JWKS across multiple calls", async () => {
    vi.mocked(jwtVerify).mockResolvedValue({
      payload: { sub: TEST_USER_ID },
      protectedHeader: { alg: "RS256" },
    } as any);

    await service.verifyToken("token-1");
    await service.verifyToken("token-2");

    // createRemoteJWKSet should only be called once (cached)
    expect(createRemoteJWKSet).toHaveBeenCalledTimes(1);
  });
});
