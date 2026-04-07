// DynamoDB client singleton for Lambda functions

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Singleton DynamoDB client
const client = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(client);

// Note: TABLE_NAME is injected via DI container (see services/tokens.ts)

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
