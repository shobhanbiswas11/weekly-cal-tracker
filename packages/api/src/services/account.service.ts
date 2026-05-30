import { BatchWriteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { inject, injectable } from "../di-utils";
import { DynamoDBClient } from "../repo/dynamodb";
import { AppConfigService } from "./app-config.service";

@injectable()
export class AccountService {
  constructor(
    private appConfig: AppConfigService = inject(AppConfigService),
    private ddbClient: DynamoDBClient = inject(DynamoDBClient),
  ) {}

  async deleteAccount(userId: string): Promise<void> {
    const tableName = this.appConfig.tableName;
    const pk = DynamoDBClient.createPK(userId);
    const ddb = this.ddbClient.client;

    // 1. Query all items for this user (paginated, keys only)
    const allKeys: { PK: string; SK: string }[] = [];
    let lastKey: Record<string, unknown> | undefined;
    do {
      const result = await ddb.send(
        new QueryCommand({
          TableName: tableName,
          KeyConditionExpression: "PK = :pk",
          ExpressionAttributeValues: { ":pk": pk },
          ProjectionExpression: "PK, SK",
          ExclusiveStartKey: lastKey,
        }),
      );
      for (const item of result.Items ?? []) {
        allKeys.push({ PK: item.PK as string, SK: item.SK as string });
      }
      lastKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
    } while (lastKey);

    // 2. Batch-delete in parallel chunks of 25 (DynamoDB BatchWrite limit)
    const chunks: { PK: string; SK: string }[][] = [];
    for (let i = 0; i < allKeys.length; i += 25) {
      chunks.push(allKeys.slice(i, i + 25));
    }
    await Promise.all(
      chunks.map((chunk) =>
        ddb.send(
          new BatchWriteCommand({
            RequestItems: {
              [tableName]: chunk.map(({ PK, SK }) => ({
                DeleteRequest: { Key: { PK, SK } },
              })),
            },
          }),
        ),
      ),
    );

    // 3. Delete the Clerk account — after all data is gone
    const clerkRes = await fetch(
      `https://api.clerk.com/v1/users/${encodeURIComponent(userId)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${this.appConfig.clerkSecretKey}` },
      },
    );
    if (!clerkRes.ok) {
      throw new Error(
        `Clerk account deletion failed (${clerkRes.status}): ${await clerkRes.text()}`,
      );
    }
  }
}
