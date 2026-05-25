import {
  DeleteCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { inject, injectable } from "@needle-di/core";
import { schemaActivityEntryEntity } from "@weekly-cal/core";
import { v4 as uuidv4 } from "uuid";
import { AppConfigService } from "../services";
import type {
  ActivityEntry,
  ActivityEntryRepo,
  CreateActivityEntry,
} from "./activity-entry.repo.interface";
import { DynamoDBClient } from "./dynamodb";
import type { ISODate } from "./types";

type DynamoDBActivityEntry = ActivityEntry & { PK: string; SK: string };

@injectable()
export class DynamoDBActivityEntryRepo implements ActivityEntryRepo {
  private static readonly ENTRY_PREFIX =
    DynamoDBClient.SK_PREFIX.ACTIVITY_ENTRY;

  private static createSK(date: string, id: string): string {
    return `${DynamoDBActivityEntryRepo.ENTRY_PREFIX}#${date}#${id}`;
  }

  private static toActivityEntry(item: DynamoDBActivityEntry): ActivityEntry {
    const { PK, SK, ...entry } = item;
    return schemaActivityEntryEntity.parse(entry);
  }

  constructor(
    private config = inject(AppConfigService),
    private db = inject(DynamoDBClient),
  ) {}

  async create(
    userId: string,
    data: CreateActivityEntry,
  ): Promise<ActivityEntry> {
    const now = new Date().toISOString();
    const id = uuidv4();
    const date = data.date ?? now.split("T")[0];

    const item: DynamoDBActivityEntry = {
      ...data,
      id,
      date,
      PK: DynamoDBClient.createPK(userId),
      SK: DynamoDBActivityEntryRepo.createSK(date, id),
      createdAt: now,
      updatedAt: now,
    };

    await this.db.client.send(
      new PutCommand({
        TableName: this.config.tableName,
        Item: item,
      }),
    );

    return DynamoDBActivityEntryRepo.toActivityEntry(item);
  }

  async update(
    userId: string,
    id: string,
    data: Partial<CreateActivityEntry>,
  ): Promise<ActivityEntry> {
    const existing = await this.getById(userId, id);
    if (!existing || !existing.date) {
      throw new Error(`Activity entry not found: ${id}`);
    }

    // If date is being changed, we need to delete and recreate (SK changes)
    if (data.date && data.date !== existing.date) {
      await this.delete(userId, id);
      const newEntry = await this.create(userId, {
        ...existing,
        ...data,
        date: data.date,
      });
      return {
        ...newEntry,
        id: existing.id,
        createdAt: existing.createdAt,
      };
    }

    const updateParts: string[] = ["#updatedAt = :updatedAt"];
    const expressionValues: Record<string, unknown> = {
      ":updatedAt": new Date().toISOString(),
    };
    const expressionNames: Record<string, string> = {
      "#updatedAt": "updatedAt",
    };

    for (const [key, value] of Object.entries(data)) {
      if (["PK", "SK", "id", "createdAt", "date"].includes(key)) continue;
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
          SK: DynamoDBActivityEntryRepo.createSK(existing.date, id),
        },
        UpdateExpression: `SET ${updateParts.join(", ")}`,
        ExpressionAttributeValues: expressionValues,
        ExpressionAttributeNames: expressionNames,
        ReturnValues: "ALL_NEW",
      }),
    );

    if (!result.Attributes) {
      throw new Error(`Activity entry not found: ${id}`);
    }

    return DynamoDBActivityEntryRepo.toActivityEntry(
      result.Attributes as DynamoDBActivityEntry,
    );
  }

  async delete(userId: string, id: string): Promise<void> {
    const existing = await this.getById(userId, id);
    if (!existing || !existing.date) {
      return;
    }

    await this.db.client.send(
      new DeleteCommand({
        TableName: this.config.tableName,
        Key: {
          PK: DynamoDBClient.createPK(userId),
          SK: DynamoDBActivityEntryRepo.createSK(existing.date, id),
        },
      }),
    );
  }

  async getById(userId: string, id: string): Promise<ActivityEntry | null> {
    const result = await this.db.client.send(
      new QueryCommand({
        TableName: this.config.tableName,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
        FilterExpression: "id = :id",
        ExpressionAttributeValues: {
          ":pk": DynamoDBClient.createPK(userId),
          ":skPrefix": `${DynamoDBActivityEntryRepo.ENTRY_PREFIX}#`,
          ":id": id,
        },
      }),
    );

    if (!result.Items || result.Items.length === 0) {
      return null;
    }

    return DynamoDBActivityEntryRepo.toActivityEntry(
      result.Items[0] as DynamoDBActivityEntry,
    );
  }

  async getByDate(userId: string, date: ISODate): Promise<ActivityEntry[]> {
    const result = await this.db.client.send(
      new QueryCommand({
        TableName: this.config.tableName,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
        ExpressionAttributeValues: {
          ":pk": DynamoDBClient.createPK(userId),
          ":skPrefix": `${DynamoDBActivityEntryRepo.ENTRY_PREFIX}#${date}#`,
        },
      }),
    );

    if (!result.Items) {
      return [];
    }

    return result.Items.map((item) =>
      DynamoDBActivityEntryRepo.toActivityEntry(item as DynamoDBActivityEntry),
    );
  }

  async getByDateRange(
    userId: string,
    startDate: ISODate,
    endDate?: ISODate,
  ): Promise<ActivityEntry[]> {
    const end = endDate ?? startDate;

    const result = await this.db.client.send(
      new QueryCommand({
        TableName: this.config.tableName,
        KeyConditionExpression: "PK = :pk AND SK BETWEEN :skStart AND :skEnd",
        ExpressionAttributeValues: {
          ":pk": DynamoDBClient.createPK(userId),
          ":skStart": `${DynamoDBActivityEntryRepo.ENTRY_PREFIX}#${startDate}#`,
          ":skEnd": `${DynamoDBActivityEntryRepo.ENTRY_PREFIX}#${end}#~`,
        },
      }),
    );

    if (!result.Items) {
      return [];
    }

    return result.Items.map((item) =>
      DynamoDBActivityEntryRepo.toActivityEntry(item as DynamoDBActivityEntry),
    );
  }
}
