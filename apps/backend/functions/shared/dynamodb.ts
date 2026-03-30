// DynamoDB utilities for Lambda functions

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { CalorieEntry, DynamoDBEntry } from "./types";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME!;

// Helper to create partition key
export const createPK = (userId: string): string => `USER#${userId}`;

// Helper to create sort key
export const createSK = (date: string, entryId: string): string =>
  `DATE#${date}#ENTRY#${entryId}`;

// Convert DynamoDB item to CalorieEntry
export const toCalorieEntry = (item: DynamoDBEntry): CalorieEntry => ({
  id: item.id,
  userId: item.PK.replace("USER#", ""),
  date: item.date,
  name: item.name,
  calories: item.calories,
  protein: item.protein,
  carbs: item.carbs,
  fat: item.fat,
  timestamp: item.timestamp,
  rawInput: item.rawInput,
});

// Save a calorie entry to DynamoDB
export const saveEntry = async (entry: CalorieEntry): Promise<void> => {
  const item: DynamoDBEntry = {
    PK: createPK(entry.userId),
    SK: createSK(entry.date, entry.id),
    id: entry.id,
    date: entry.date,
    name: entry.name,
    calories: entry.calories,
    protein: entry.protein,
    carbs: entry.carbs,
    fat: entry.fat,
    timestamp: entry.timestamp,
    rawInput: entry.rawInput,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }),
  );
};

// Get all entries for a user on a specific date
export const getEntriesByDate = async (
  userId: string,
  date: string,
): Promise<CalorieEntry[]> => {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
      ExpressionAttributeValues: {
        ":pk": createPK(userId),
        ":skPrefix": `DATE#${date}`,
      },
    }),
  );

  return (result.Items as DynamoDBEntry[])?.map(toCalorieEntry) || [];
};

// Get entries for a date range (for weekly summary)
export const getEntriesByDateRange = async (
  userId: string,
  startDate: string,
  endDate: string,
): Promise<CalorieEntry[]> => {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND SK BETWEEN :start AND :end",
      ExpressionAttributeValues: {
        ":pk": createPK(userId),
        ":start": `DATE#${startDate}`,
        ":end": `DATE#${endDate}#~`, // ~ is after # in ASCII, captures all entries for endDate
      },
    }),
  );

  return (result.Items as DynamoDBEntry[])?.map(toCalorieEntry) || [];
};

// Delete an entry
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
        SK: createSK(date, entryId),
      },
    }),
  );
};
