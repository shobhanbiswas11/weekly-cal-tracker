import {
  BatchWriteItemCommand,
  DynamoDBClient,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";

const TABLE_NAME = "weekly-health-staging";
const client = new DynamoDBClient({});

async function deleteAllItems() {
  let lastEvaluatedKey: Record<string, any> | undefined;

  do {
    const scanResult = await client.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        ExclusiveStartKey: lastEvaluatedKey,
        ProjectionExpression: "PK, SK",
      }),
    );

    const items = scanResult.Items ?? [];
    lastEvaluatedKey = scanResult.LastEvaluatedKey;

    // BatchWriteItem supports max 25 items per request
    for (let i = 0; i < items.length; i += 25) {
      const batch = items.slice(i, i + 25);
      await client.send(
        new BatchWriteItemCommand({
          RequestItems: {
            [TABLE_NAME]: batch.map((item) => ({
              DeleteRequest: {
                Key: { PK: item.PK, SK: item.SK },
              },
            })),
          },
        }),
      );
    }

    console.log(`Deleted ${items.length} items`);
  } while (lastEvaluatedKey);

  console.log("Done - all items deleted");
}

deleteAllItems().catch((err) => {
  console.error(err);
  process.exit(1);
});
