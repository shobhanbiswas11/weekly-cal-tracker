// Entry repository - DynamoDB operations for food entries

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import type {
  CreateFoodEntryRequest,
  FoodEntry,
  FoodEntryItem,
  UpdateFoodEntryRequest,
} from "../../shared/types";

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

const toFoodEntry = (item: FoodEntryItem): FoodEntry => ({
  id: item.id,
  date: item.date,
  name: item.name,
  calories: item.calories,
  protein: item.protein,
  carbs: item.carbs,
  fat: item.fat,
  timestamp: item.timestamp,
  rawInput: item.rawInput,
});

// =============================================================================
// Repository Functions
// =============================================================================

export const createEntry = async (
  userId: string,
  entryId: string,
  request: CreateFoodEntryRequest,
): Promise<FoodEntry> => {
  const timestamp = new Date().toISOString();
  const date = request.date || timestamp.split("T")[0];

  const item: FoodEntryItem = {
    PK: createPK(userId),
    SK: createEntrySK(date, entryId),
    id: entryId,
    date,
    name: request.name,
    calories: Math.round(request.calories),
    protein: Math.round(request.protein),
    carbs: Math.round(request.carbs),
    fat: Math.round(request.fat),
    timestamp,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }),
  );

  return toFoodEntry(item);
};

export const updateEntry = async (
  userId: string,
  date: string,
  entryId: string,
  updates: UpdateFoodEntryRequest,
): Promise<FoodEntry | null> => {
  // Build update expression dynamically
  const updateParts: string[] = [];
  const expressionValues: Record<string, unknown> = {};
  const expressionNames: Record<string, string> = {};

  if (updates.name !== undefined) {
    updateParts.push("#name = :name");
    expressionNames["#name"] = "name";
    expressionValues[":name"] = updates.name;
  }
  if (updates.calories !== undefined) {
    updateParts.push("calories = :calories");
    expressionValues[":calories"] = Math.round(updates.calories);
  }
  if (updates.protein !== undefined) {
    updateParts.push("protein = :protein");
    expressionValues[":protein"] = Math.round(updates.protein);
  }
  if (updates.carbs !== undefined) {
    updateParts.push("carbs = :carbs");
    expressionValues[":carbs"] = Math.round(updates.carbs);
  }
  if (updates.fat !== undefined) {
    updateParts.push("fat = :fat");
    expressionValues[":fat"] = Math.round(updates.fat);
  }

  if (updateParts.length === 0) {
    // No updates to apply, fetch and return current item
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
      ...(Object.keys(expressionNames).length > 0 && {
        ExpressionAttributeNames: expressionNames,
      }),
      ReturnValues: "ALL_NEW",
    }),
  );

  if (!result.Attributes) {
    return null;
  }

  return toFoodEntry(result.Attributes as FoodEntryItem);
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
): Promise<FoodEntry[]> => {
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

  const items = (result.Items || []) as FoodEntryItem[];
  return items.map(toFoodEntry);
};

export const getEntriesByDateRange = async (
  userId: string,
  startDate: string,
  endDate: string,
): Promise<FoodEntry[]> => {
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

  const items = (result.Items || []) as FoodEntryItem[];
  return items.map(toFoodEntry);
};
