import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { inject, injectable } from "../di-utils";
import { AppConfigService } from "../services";
import { DynamoDBClient } from "./dynamodb";
import {
  CreateProfile,
  Profile,
  ProfileRepo,
  schemaProfileEntity,
} from "./profile.repo.interface";

type DynamoDBProfile = Profile & { PK: string; SK: string };

@injectable()
export class DynamoDBProfileRepo implements ProfileRepo {
  private static readonly PROFILE_SK = DynamoDBClient.SK_PREFIX.PROFILE;

  private static toProfile(item: DynamoDBProfile): Profile {
    const { PK, SK, ...profile } = item;
    return schemaProfileEntity.parse({
      ...profile,
      id: profile.id ?? PK.replace("USER#", ""),
    });
  }

  constructor(
    private config = inject(AppConfigService),
    private db = inject(DynamoDBClient),
  ) {}

  async create(userId: string, data: CreateProfile): Promise<Profile> {
    const now = new Date().toISOString();

    const item: DynamoDBProfile = {
      ...data,
      id: userId,
      PK: DynamoDBClient.createPK(userId),
      SK: DynamoDBProfileRepo.PROFILE_SK,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.client.send(
      new PutCommand({
        TableName: this.config.tableName,
        Item: item,
        ConditionExpression:
          "attribute_not_exists(PK) AND attribute_not_exists(SK)",
      }),
    );

    return DynamoDBProfileRepo.toProfile(item);
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

    const result = await this.db.client.send(
      new UpdateCommand({
        TableName: this.config.tableName,
        Key: {
          PK: DynamoDBClient.createPK(userId),
          SK: DynamoDBProfileRepo.PROFILE_SK,
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

    return DynamoDBProfileRepo.toProfile(result.Attributes as DynamoDBProfile);
  }

  async delete(userId: string): Promise<void> {
    await this.db.client.send(
      new DeleteCommand({
        TableName: this.config.tableName,
        Key: {
          PK: DynamoDBClient.createPK(userId),
          SK: DynamoDBProfileRepo.PROFILE_SK,
        },
      }),
    );
  }

  async getByUserId(userId: string): Promise<Profile | null> {
    const result = await this.db.client.send(
      new GetCommand({
        TableName: this.config.tableName,
        Key: {
          PK: DynamoDBClient.createPK(userId),
          SK: DynamoDBProfileRepo.PROFILE_SK,
        },
      }),
    );

    if (!result.Item) {
      return null;
    }

    return DynamoDBProfileRepo.toProfile(result.Item as DynamoDBProfile);
  }

  async getSelectedFieldsByUserId<T extends keyof Profile>(
    userId: string,
    fields: T[],
  ): Promise<Pick<Profile, T> | null> {
    const expressionNames: Record<string, string> = {};
    const projectionParts: string[] = [];

    for (const field of fields) {
      const nameKey = `#${String(field)}`;
      expressionNames[nameKey] = String(field);
      projectionParts.push(nameKey);
    }

    const result = await this.db.client.send(
      new GetCommand({
        TableName: this.config.tableName,
        Key: {
          PK: DynamoDBClient.createPK(userId),
          SK: DynamoDBProfileRepo.PROFILE_SK,
        },
        ProjectionExpression: projectionParts.join(", "),
        ExpressionAttributeNames: expressionNames,
      }),
    );

    if (!result.Item) {
      return null;
    }

    return result.Item as Pick<Profile, T>;
  }

  async incrementChatMessageCount(userId: string): Promise<number> {
    const result = await this.db.client.send(
      new UpdateCommand({
        TableName: this.config.tableName,
        Key: {
          PK: DynamoDBClient.createPK(userId),
          SK: DynamoDBProfileRepo.PROFILE_SK,
        },
        UpdateExpression:
          "SET #count = if_not_exists(#count, :zero) + :one, #updatedAt = :now",
        ExpressionAttributeNames: {
          "#count": "chatMessageCount",
          "#updatedAt": "updatedAt",
        },
        ExpressionAttributeValues: {
          ":zero": 0,
          ":one": 1,
          ":now": new Date().toISOString(),
        },
        ReturnValues: "ALL_NEW",
      }),
    );

    return (result.Attributes?.chatMessageCount as number) ?? 0;
  }
}
