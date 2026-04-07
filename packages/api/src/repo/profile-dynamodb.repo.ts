import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { inject, injectable } from "@needle-di/core";
import { APP_CONFIG } from "../container/tokens";
import { createPK, docClient, SK_PREFIX } from "./dynamodb";
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

@injectable()
export class DynamoDBProfileRepo implements ProfileRepo {
  constructor(private config = inject(APP_CONFIG)) {}

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
        TableName: this.config.tableName,
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

      const nameKey = `#${key}`;
      const valueKey = `:${key}`;
      updateParts.push(`${nameKey} = ${valueKey}`);
      expressionNames[nameKey] = key;
      expressionValues[valueKey] = value;
    }

    const result = await docClient.send(
      new UpdateCommand({
        TableName: this.config.tableName,
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
        TableName: this.config.tableName,
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
        TableName: this.config.tableName,
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
