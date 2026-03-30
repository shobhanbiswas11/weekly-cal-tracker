# Weekly Calorie Tracker - Backend

AWS CDK backend for the Weekly Calorie Tracker application.

## Architecture

- **API Gateway (HTTP API)** - REST API with JWT authentication
- **Lambda Functions** - Node.js 20 functions for API handlers
- **DynamoDB** - NoSQL database for calorie entries
- **Clerk** - JWT authentication provider

## Prerequisites

1. **AWS CLI** configured with credentials
2. **Node.js 20+**
3. **AWS CDK CLI** (`npm install -g aws-cdk`)
4. **Clerk account** with application set up

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.dev)
2. Create an application (or use existing)
3. Enable Google social connection under **User & Authentication → Social Connections**
4. Note your **Frontend API URL** (e.g., `https://your-app.clerk.accounts.dev`)

### 3. Configure CDK Context

Edit `cdk.context.json` with your Clerk configuration:

```json
{
  "clerkIssuer": "https://YOUR_CLERK_DOMAIN.clerk.accounts.dev",
  "clerkAudience": "https://YOUR_CLERK_DOMAIN.clerk.accounts.dev",
  "allowedOrigin": "http://localhost:5173"
}
```

- **clerkIssuer**: Your Clerk domain (the `iss` claim in Clerk JWTs)
- **clerkAudience**: Your Clerk Frontend API URL (the `aud` claim)
- **allowedOrigin**: Your frontend URL (use `*` for development)

### 4. Store OpenAI API Key

Store your OpenAI API key in AWS SSM Parameter Store:

```bash
aws ssm put-parameter \
  --name "/calorie-tracker/openai-api-key" \
  --value "sk-your-openai-api-key" \
  --type SecureString
```

### 5. Bootstrap CDK (First Time Only)

```bash
npx cdk bootstrap
```

### 6. Deploy

```bash
npx cdk deploy
```

After deployment, note the **ApiUrl** output - you'll need this for the frontend.

## API Endpoints

All endpoints require a valid Clerk JWT in the `Authorization` header.

| Method   | Endpoint                   | Description                                     |
| -------- | -------------------------- | ----------------------------------------------- |
| `POST`   | `/entries/parse`           | Parse natural language input and create entries |
| `GET`    | `/entries?date=YYYY-MM-DD` | Get all entries for a date                      |
| `GET`    | `/summary?week=YYYY-Www`   | Get weekly summary                              |
| `DELETE` | `/entries/{date}/{id}`     | Delete an entry                                 |

### Example: Parse Entry

```bash
curl -X POST https://your-api-id.execute-api.region.amazonaws.com/entries/parse \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <clerk-jwt>" \
  -d '{"input": "I had 2 eggs and toast for breakfast"}'
```

Response:
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "abc123",
        "name": "2 eggs",
        "calories": 140,
        "protein": 12,
        "carbs": 1,
        "fat": 10,
        "date": "2026-03-29",
        "timestamp": "2026-03-29T10:30:00.000Z"
      },
      {
        "id": "def456",
        "name": "Toast",
        "calories": 80,
        "protein": 3,
        "carbs": 15,
        "fat": 1,
        "date": "2026-03-29",
        "timestamp": "2026-03-29T10:30:00.000Z"
      }
    ],
    "message": "Successfully logged 2 items"
  }
}
```

## Development

### Build

```bash
npm run build
```

### Synthesize CloudFormation

```bash
npx cdk synth
```

### Compare Changes

```bash
npx cdk diff
```

### Run Tests

```bash
npm test
```

## Project Structure

```
backend/
├── bin/
│   └── backend.ts           # CDK app entry point
├── lib/
│   └── backend-stack.ts     # CDK stack definition
├── functions/
│   ├── parseEntry/          # Parse NL input Lambda
│   ├── getEntries/          # Get entries Lambda
│   ├── getWeeklySummary/    # Weekly summary Lambda
│   ├── deleteEntry/         # Delete entry Lambda
│   └── shared/
│       ├── types.ts         # Shared TypeScript types
│       └── dynamodb.ts      # DynamoDB utilities
├── cdk.context.json         # CDK context configuration
└── package.json
```

## Troubleshooting

### "clerkAudience is required" Error

Make sure you've configured `cdk.context.json` with your actual Clerk values.

### SSM Parameter Not Found

Ensure you've created the OpenAI API key parameter:
```bash
aws ssm get-parameter --name "/calorie-tracker/openai-api-key"
```

### CORS Errors

Update `allowedOrigin` in `cdk.context.json` to match your frontend URL exactly.

## Cleanup

To delete all resources:

```bash
npx cdk destroy
```

Note: The DynamoDB table has `removalPolicy: RETAIN` to prevent accidental data loss. Delete it manually if needed.
