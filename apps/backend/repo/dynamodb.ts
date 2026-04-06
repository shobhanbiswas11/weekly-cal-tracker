// DynamoDB client singleton for Lambda functions

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Singleton DynamoDB client
const client = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(client);

// Table name from environment
export const TABLE_NAME = process.env.TABLE_NAME!;
if (!TABLE_NAME) {
  throw new Error("TABLE_NAME environment variable is not set");
}

// =============================================================================
// Key Helpers
// =============================================================================

export const createPK = (userId: string): string => `USER#${userId}`;

// Sort key prefixes for single-table design
export const SK_PREFIX = {
  PROFILE: "PROFILE",
  FOOD_ENTRY: "FOOD_ENTRY",
  WORKOUT_ENTRY: "WORKOUT_ENTRY", // Future
} as const;
