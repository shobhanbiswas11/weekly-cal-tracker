import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { createPK, docClient, SK_PREFIX, TABLE_NAME } from "./dynamodb";
import type {
  CreateProfile,
  Profile,
  ProfileRepo,
} from "./profile.repo.interface";

// =============================================================================
// Key Helpers
// =============================================================================

const PROFILE_SK = SK_PREFIX.PROFILE;

// =============================================================================
// Mappers
// =============================================================================

type DynamoDBProfile = Profile & { PK: string; SK: string };

const toProfile = (item: DynamoDBProfile): Profile => {
  const { PK, SK, ...profile } = item;
  return profile;
};

// =============================================================================
// Repository Implementation
// =============================================================================

export class DynamoDBProfileRepo implements ProfileRepo {
  async create(userId: string, data: CreateProfile): Promise<Profile> {
    const now = new Date().toISOString();

    const item: DynamoDBProfile = {
      ...data,
      id: userId,
      PK: createPK(userId),
      SK: PROFILE_SK,
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
        ConditionExpression:
          "attribute_not_exists(PK) AND attribute_not_exists(SK)",
      }),
    );

    return toProfile(item);
  }

  async update(userId: string, data: Partial<CreateProfile>): Promise<Profile> {
    const updateParts: string[] = ["#updatedAt = :updatedAt"];
    const expressionValues: Record<string, unknown> = {
      ":updatedAt": new Date().toISOString(),
    };
    const expressionNames: Record<string, string> = {
      "#updatedAt": "updatedAt",
    };

    for (const [key, value] of Object.entries(data)) {
      if (["id", "PK", "SK", "createdAt"].includes(key)) continue;
      if (value === undefined) continue;

      // For plain nested objects (e.g. preferences), expand to attribute-path
      // updates so individual sub-fields are patched without overwriting others.
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        for (const [subKey, subValue] of Object.entries(value)) {
          if (subValue === undefined) continue;
          const nameKey = `#${key}`;
          const subNameKey = `#${key}_${subKey}`;
          const valueKey = `:${key}_${subKey}`;
          updateParts.push(`${nameKey}.${subNameKey} = ${valueKey}`);
          expressionNames[nameKey] = key;
          expressionNames[subNameKey] = subKey;
          expressionValues[valueKey] = subValue;
        }
        continue;
      }

      const nameKey = `#${key}`;
      const valueKey = `:${key}`;
      updateParts.push(`${nameKey} = ${valueKey}`);
      expressionNames[nameKey] = key;
      expressionValues[valueKey] = value;
    }

    const result = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: createPK(userId),
          SK: PROFILE_SK,
        },
        UpdateExpression: `SET ${updateParts.join(", ")}`,
        ExpressionAttributeValues: expressionValues,
        ExpressionAttributeNames: expressionNames,
        ReturnValues: "ALL_NEW",
      }),
    );

    if (!result.Attributes) {
      throw new Error(`Profile not found: ${userId}`);
    }

    return toProfile(result.Attributes as DynamoDBProfile);
  }

  async delete(userId: string): Promise<void> {
    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: createPK(userId),
          SK: PROFILE_SK,
        },
      }),
    );
  }

  async getByUserId(userId: string): Promise<Profile | null> {
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

    return toProfile(result.Item as DynamoDBProfile);
  }
}

// Export singleton instance
export const profileRepo = new DynamoDBProfileRepo();
