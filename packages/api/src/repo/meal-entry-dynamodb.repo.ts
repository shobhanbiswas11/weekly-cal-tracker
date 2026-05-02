import {
  DeleteCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { inject, injectable } from "@needle-di/core";
import { v4 as uuidv4 } from "uuid";
import { AppConfigService } from "../services";
import { createPK, docClient, SK_PREFIX } from "./dynamodb";
import type {
  CreateMealEntry,
  MealEntry,
  MealEntryRepo,
} from "./meal-entry.repo.interface";
import type { ISODate } from "./types";

// =============================================================================
// Key Helpers
// =============================================================================

const ENTRY_PREFIX = SK_PREFIX.FOOD_ENTRY;

/**
 * Sort key format: FOOD_ENTRY#<date>#<id>
 * This allows efficient date range queries using begins_with and between
 */
const createSK = (date: string, id: string): string =>
  `${ENTRY_PREFIX}#${date}#${id}`;

// =============================================================================
// Mappers
// =============================================================================

type DynamoDBMealEntry = MealEntry & { PK: string; SK: string };

const toMealEntry = (item: DynamoDBMealEntry): MealEntry => {
  const { PK, SK, ...entry } = item;
  return entry;
};

// =============================================================================
// Repository Implementation
// =============================================================================

@injectable()
export class DynamoDBMealEntryRepo implements MealEntryRepo {
  constructor(private config = inject(AppConfigService)) {}

  async create(userId: string, data: CreateMealEntry): Promise<MealEntry> {
    const now = new Date().toISOString();
    const id = uuidv4();
    const date = data.date ?? now.split("T")[0]; // Default to today if no date

    const item: DynamoDBMealEntry = {
      ...data,
      id,
      date,
      PK: createPK(userId),
      SK: createSK(date, id),
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: this.config.tableName,
        Item: item,
      }),
    );

    return toMealEntry(item);
  }

  async update(
    userId: string,
    id: string,
    data: Partial<CreateMealEntry>,
  ): Promise<MealEntry> {
    // First, get the existing entry to know its date (needed for SK)
    const existing = await this.getById(userId, id);
    if (!existing || !existing.date) {
      throw new Error(`Meal entry not found: ${id}`);
    }

    // If date is being changed, we need to delete and recreate (SK changes)
    if (data.date && data.date !== existing.date) {
      await this.delete(userId, id);
      const newEntry = await this.create(userId, {
        ...existing,
        ...data,
        date: data.date,
      });
      // Preserve original id and createdAt
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

    const result = await docClient.send(
      new UpdateCommand({
        TableName: this.config.tableName,
        Key: {
          PK: createPK(userId),
          SK: createSK(existing.date, id),
        },
        UpdateExpression: `SET ${updateParts.join(", ")}`,
        ExpressionAttributeValues: expressionValues,
        ExpressionAttributeNames: expressionNames,
        ReturnValues: "ALL_NEW",
      }),
    );

    if (!result.Attributes) {
      throw new Error(`Meal entry not found: ${id}`);
    }

    return toMealEntry(result.Attributes as DynamoDBMealEntry);
  }

  async delete(userId: string, id: string): Promise<void> {
    // First, get the existing entry to know its date (needed for SK)
    const existing = await this.getById(userId, id);
    if (!existing || !existing.date) {
      return; // Already deleted, idempotent
    }

    await docClient.send(
      new DeleteCommand({
        TableName: this.config.tableName,
        Key: {
          PK: createPK(userId),
          SK: createSK(existing.date, id),
        },
      }),
    );
  }

  async getById(userId: string, id: string): Promise<MealEntry | null> {
    // Since we don't know the date, we need to query by id
    // Query all entries and filter by id (inefficient but necessary without GSI)
    const result = await docClient.send(
      new QueryCommand({
        TableName: this.config.tableName,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
        FilterExpression: "id = :id",
        ExpressionAttributeValues: {
          ":pk": createPK(userId),
          ":skPrefix": `${ENTRY_PREFIX}#`,
          ":id": id,
        },
      }),
    );

    if (!result.Items || result.Items.length === 0) {
      return null;
    }

    return toMealEntry(result.Items[0] as DynamoDBMealEntry);
  }

  async getByDate(userId: string, date: ISODate): Promise<MealEntry[]> {
    const result = await docClient.send(
      new QueryCommand({
        TableName: this.config.tableName,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
        ExpressionAttributeValues: {
          ":pk": createPK(userId),
          ":skPrefix": `${ENTRY_PREFIX}#${date}#`,
        },
      }),
    );

    if (!result.Items) {
      return [];
    }

    return result.Items.map((item) => toMealEntry(item as DynamoDBMealEntry));
  }

  async getByDateRange(
    userId: string,
    startDate: ISODate,
    endDate?: ISODate,
  ): Promise<MealEntry[]> {
    const end = endDate ?? startDate;

    // Use BETWEEN for date range query
    // SK format: FOOD_ENTRY#<date>#<id>
    // We want all entries where date is between startDate and endDate
    const result = await docClient.send(
      new QueryCommand({
        TableName: this.config.tableName,
        KeyConditionExpression: "PK = :pk AND SK BETWEEN :skStart AND :skEnd",
        ExpressionAttributeValues: {
          ":pk": createPK(userId),
          ":skStart": `${ENTRY_PREFIX}#${startDate}#`,
          ":skEnd": `${ENTRY_PREFIX}#${end}#~`, // ~ is after all UUIDs lexicographically
        },
      }),
    );

    if (!result.Items) {
      return [];
    }

    return result.Items.map((item) => toMealEntry(item as DynamoDBMealEntry));
  }
}
