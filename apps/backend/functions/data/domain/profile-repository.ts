// Profile repository - DynamoDB operations for user profiles

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import type { Profile, ProfileItem } from "../../shared/types";

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

export const getProfile = async (userId: string): Promise<Profile | null> => {
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

  const item = result.Item as ProfileItem;
  return item.data;
};

export const upsertProfile = async (
  userId: string,
  profileData: Profile,
): Promise<Profile> => {
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

  const existingItem = existing.Item as ProfileItem | undefined;
  const createdAt = existingItem?.createdAt || now;

  const item: ProfileItem = {
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

  return item.data;
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
