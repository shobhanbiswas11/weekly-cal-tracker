// Profile repository - DynamoDB operations for user profiles
// Treats profile as key-value record

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import type { DataRecord } from "../../shared/types";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME!;

// =============================================================================
// Key Helpers
// =============================================================================

const createPK = (userId: string): string => `USER#${userId}`;
const PROFILE_SK = "PROFILE";

// =============================================================================
// Repository Functions
// =============================================================================

export const getProfile = async (
  userId: string,
): Promise<DataRecord | null> => {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: createPK(userId),
        SK: PROFILE_SK,
      },
    }),
  );

  if (!result.Item) {
    return null;
  }

  return result.Item.data as DataRecord;
};

export const upsertProfile = async (
  userId: string,
  profileData: DataRecord,
): Promise<DataRecord> => {
  const now = new Date().toISOString();

  // First, try to get existing profile to preserve createdAt
  const existing = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: createPK(userId),
        SK: PROFILE_SK,
      },
    }),
  );

  const createdAt = existing.Item?.createdAt || now;

  const item = {
    PK: createPK(userId),
    SK: PROFILE_SK,
    data: profileData,
    createdAt,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }),
  );

  return profileData;
};

export const deleteProfile = async (userId: string): Promise<void> => {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: createPK(userId),
        SK: PROFILE_SK,
      },
    }),
  );
};
