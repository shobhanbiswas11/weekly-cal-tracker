import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(client);

export const createPK = (userId: string): string => `USER#${userId}`;

export const SK_PREFIX = {
  PROFILE: "PROFILE",
  FOOD_ENTRY: "FOOD_ENTRY",
  WORKOUT_ENTRY: "WORKOUT_ENTRY", // Future
} as const;
