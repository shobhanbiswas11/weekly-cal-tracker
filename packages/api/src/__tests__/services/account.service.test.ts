import { DynamoDBClient } from "@/repo/dynamodb";
import { AccountService } from "@/services/account.service";
import { AppConfigService } from "@/services/app-config.service";
import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { TEST_USER_ID, testEnv } from "../helpers/test-fixtures";

// =============================================================================
// Tests
// =============================================================================

describe("AccountService", () => {
  let sendMock: Mocked<DynamoDBDocumentClient>["send"];
  let service: AccountService;

  beforeEach(() => {
    sendMock = vi.fn();
    const ddbClient = {
      client: { send: sendMock },
    } as unknown as DynamoDBClient;
    const config = new AppConfigService(
      testEnv as unknown as NodeJS.ProcessEnv,
    );
    service = new AccountService(config, ddbClient);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("deleteAccount", () => {
    it("deletes all DynamoDB items and then Clerk account", async () => {
      // Query returns 2 items, no pagination
      sendMock.mockResolvedValueOnce({
        Items: [
          { PK: `USER#${TEST_USER_ID}`, SK: "PROFILE" },
          { PK: `USER#${TEST_USER_ID}`, SK: "FOOD_ENTRY#2025-01-06#uuid1" },
        ],
        LastEvaluatedKey: undefined,
      });

      // BatchWrite succeeds
      sendMock.mockResolvedValueOnce({});

      // Clerk delete succeeds
      vi.spyOn(global, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ deleted: true }), { status: 200 }),
      );

      await service.deleteAccount(TEST_USER_ID);

      // Should have sent Query + BatchWrite
      expect(sendMock).toHaveBeenCalledTimes(2);

      // Clerk called last
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.clerk.com/v1/users/${TEST_USER_ID}`,
        expect.objectContaining({
          method: "DELETE",
          headers: expect.objectContaining({
            Authorization: `Bearer ${testEnv.CLERK_SECRET_KEY}`,
          }),
        }),
      );
    });

    it("handles paginated DynamoDB queries", async () => {
      // First page
      sendMock.mockResolvedValueOnce({
        Items: [{ PK: `USER#${TEST_USER_ID}`, SK: "PROFILE" }],
        LastEvaluatedKey: { PK: `USER#${TEST_USER_ID}`, SK: "PROFILE" },
      });

      // Second page
      sendMock.mockResolvedValueOnce({
        Items: [
          { PK: `USER#${TEST_USER_ID}`, SK: "FOOD_ENTRY#2025-01-06#uuid1" },
        ],
        LastEvaluatedKey: undefined,
      });

      // Two batch writes (one per page since both pages have items combined into chunks)
      sendMock.mockResolvedValueOnce({});

      vi.spyOn(global, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ deleted: true }), { status: 200 }),
      );

      await service.deleteAccount(TEST_USER_ID);

      // 2 queries + 1 batch write (2 items < 25 threshold)
      expect(sendMock).toHaveBeenCalledTimes(3);
    });

    it("handles batch deletion in chunks of 25", async () => {
      // Return 30 items (needs 2 batch writes)
      const items = Array.from({ length: 30 }, (_, i) => ({
        PK: `USER#${TEST_USER_ID}`,
        SK: `FOOD_ENTRY#2025-01-06#uuid${i}`,
      }));
      sendMock.mockResolvedValueOnce({
        Items: items,
        LastEvaluatedKey: undefined,
      });

      // Two batch writes in parallel
      sendMock.mockResolvedValue({});

      vi.spyOn(global, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ deleted: true }), { status: 200 }),
      );

      await service.deleteAccount(TEST_USER_ID);

      // 1 query + 2 batch writes
      expect(sendMock).toHaveBeenCalledTimes(3);
    });

    it("handles empty user (no items to delete)", async () => {
      sendMock.mockResolvedValueOnce({
        Items: [],
        LastEvaluatedKey: undefined,
      });

      vi.spyOn(global, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ deleted: true }), { status: 200 }),
      );

      await service.deleteAccount(TEST_USER_ID);

      // 1 query, 0 batch writes
      expect(sendMock).toHaveBeenCalledTimes(1);
      // Clerk still called
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("throws when Clerk deletion fails", async () => {
      sendMock.mockResolvedValueOnce({
        Items: [],
        LastEvaluatedKey: undefined,
      });

      vi.spyOn(global, "fetch").mockResolvedValueOnce(
        new Response("Forbidden", { status: 403 }),
      );

      await expect(service.deleteAccount(TEST_USER_ID)).rejects.toThrow(
        "Clerk account deletion failed (403): Forbidden",
      );
    });

    it("deletes DynamoDB items before Clerk account", async () => {
      const callOrder: string[] = [];

      sendMock.mockImplementation(async () => {
        callOrder.push("dynamodb");
        return { Items: [], LastEvaluatedKey: undefined };
      });

      vi.spyOn(global, "fetch").mockImplementation(async () => {
        callOrder.push("clerk");
        return new Response(JSON.stringify({ deleted: true }), { status: 200 });
      });

      await service.deleteAccount(TEST_USER_ID);

      // DynamoDB operations should come before Clerk
      const clerkIndex = callOrder.indexOf("clerk");
      const lastDynamoIndex = callOrder.lastIndexOf("dynamodb");
      expect(lastDynamoIndex).toBeLessThan(clerkIndex);
    });
  });
});
