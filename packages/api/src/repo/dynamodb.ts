import { DynamoDBClient as DynamoDBsdkClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { injectable } from "@needle-di/core";
@injectable()
export class DynamoDBClient {
  public readonly client: DynamoDBDocumentClient;

  constructor() {
    this.client = DynamoDBDocumentClient.from(new DynamoDBsdkClient({}));
  }

  static SK_PREFIX = {
    PROFILE: "PROFILE",
    FOOD_ENTRY: "FOOD_ENTRY",
    ACTIVITY_ENTRY: "ACTIVITY_ENTRY",
  } as const;

  static createPK(userId: string): string {
    return `USER#${userId}`;
  }
}
