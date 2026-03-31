// Entry repository - DynamoDB operations for food entries
// Treats entries as key-value records - only id and date are required

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import type { DataRecord } from "../../shared/types";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME!;

// =============================================================================
// Key Helpers
// =============================================================================

const createPK = (userId: string): string => `USER#${userId}`;

const createEntrySK = (date: string, entryId: string): string =>
  `FOOD_ENTRY#${date}#${entryId}`;

// =============================================================================
// Mappers
// =============================================================================

const toEntry = (item: DataRecord): DataRecord => {
  // Remove DynamoDB keys, return the rest
  const { PK, SK, ...entry } = item;
  return entry;
};

// =============================================================================
// Repository Functions
// =============================================================================

export const createEntry = async (
  userId: string,
  entryId: string,
  data: DataRecord,
): Promise<DataRecord> => {
  const timestamp = new Date().toISOString();
  const date = (data.date as string) || timestamp.split("T")[0];

  const item: DataRecord = {
    ...data,
    PK: createPK(userId),
    SK: createEntrySK(date, entryId),
    id: entryId,
    date,
    timestamp,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }),
  );

  return toEntry(item);
};

export const updateEntry = async (
  userId: string,
  date: string,
  entryId: string,
  updates: DataRecord,
): Promise<DataRecord | null> => {
  // Build update expression dynamically from all provided fields
  const updateParts: string[] = [];
  const expressionValues: Record<string, unknown> = {};
  const expressionNames: Record<string, string> = {};

  for (const [key, value] of Object.entries(updates)) {
    // Skip reserved/internal fields
    if (["id", "date", "PK", "SK"].includes(key)) continue;

    // Use expression attribute names to avoid reserved word conflicts
    const nameKey = `#${key}`;
    const valueKey = `:${key}`;
    updateParts.push(`${nameKey} = ${valueKey}`);
    expressionNames[nameKey] = key;
    expressionValues[valueKey] = value;
  }

  if (updateParts.length === 0) {
    return null;
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: createPK(userId),
        SK: createEntrySK(date, entryId),
      },
      UpdateExpression: `SET ${updateParts.join(", ")}`,
      ExpressionAttributeValues: expressionValues,
      ExpressionAttributeNames: expressionNames,
      ReturnValues: "ALL_NEW",
    }),
  );

  if (!result.Attributes) {
    return null;
  }

  return toEntry(result.Attributes as DataRecord);
};

export const deleteEntry = async (
  userId: string,
  date: string,
  entryId: string,
): Promise<void> => {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: createPK(userId),
        SK: createEntrySK(date, entryId),
      },
    }),
  );
};

export const getEntriesByDate = async (
  userId: string,
  date: string,
): Promise<DataRecord[]> => {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
      ExpressionAttributeValues: {
        ":pk": createPK(userId),
        ":skPrefix": `FOOD_ENTRY#${date}`,
      },
    }),
  );

  return (result.Items || []).map(toEntry);
};

export const getEntriesByDateRange = async (
  userId: string,
  startDate: string,
  endDate: string,
): Promise<DataRecord[]> => {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND SK BETWEEN :start AND :end",
      ExpressionAttributeValues: {
        ":pk": createPK(userId),
        ":start": `FOOD_ENTRY#${startDate}`,
        ":end": `FOOD_ENTRY#${endDate}~`, // ~ is after Z in ASCII
      },
    }),
  );

  return (result.Items || []).map(toEntry);
};
