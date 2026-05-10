# Weekly Calorie Tracker

## Overview

A natural language calorie tracking PWA where users log meals by describing what they ate in plain English. An LLM extracts nutritional data and stores it for weekly tracking.

## Architecture

```
PWA (React 19 + Vite) → API Gateway → Lambda → OpenAI GPT-4 (tool calling) → DynamoDB
                           ↑
                     Clerk JWT Auth
```

## Stack

| Layer    | Technology                                     |
| -------- | ---------------------------------------------- |
| Frontend | React 19, Vite, TailwindCSS 4, Base UI         |
| Auth     | Clerk (Google Sign-In)                         |
| API      | AWS API Gateway (HTTP API) with JWT Authorizer |
| Backend  | AWS Lambda (Node.js 20), CDK                   |
| LLM      | OpenAI GPT-4 with function/tool calling        |
| Database | DynamoDB (user-scoped entries)                 |


## Key Features

1. **Natural Language Input**: "I had 2 eggs and toast for breakfast" → LLM extracts calories, protein, carbs, fat
2. **Weekly Tracking**: View daily breakdowns and weekly totals
3. **Full Macros**: Track calories, protein, carbs, and fat
4. **Offline Support**: PWA with service worker caching (planned)
5. **Google Sign-In**: Via Clerk, no custom OAuth setup needed

## Data Model

**DynamoDB Table: CalorieEntries**
- PK: `USER#<clerkUserId>`
- SK: `DATE#YYYY-MM-DD#ENTRY#<uuid>`

## API Endpoints

| Method | Path                       | Description                    |
| ------ | -------------------------- | ------------------------------ |
| POST   | `/entries/parse`           | Parse NL input, create entries |
| GET    | `/entries?date=YYYY-MM-DD` | Get entries for a date         |
| GET    | `/summary?week=YYYY-Www`   | Get weekly summary             |
| DELETE | `/entries/{date}/{id}`     | Delete an entry                |

## Configuration

- **Clerk**: `backend/cdk.context.json` (clerkIssuer, clerkAudience)
- **OpenAI**: SSM Parameter `/calorie-tracker/openai-api-key`
- **Frontend API URL**: Set after `cdk deploy` outputs ApiUrl

## Coding Style

- **Minimal comments**: Only add comments where logic is non-obvious. Don't comment every line—let the code speak for itself.
- **Class-based styling**: Always use Tailwind/UniWind `className` utility classes for styling in both native (UniWind) and web (TailwindCSS) apps. Avoid inline `style` props except for truly computed/dynamic values with no Tailwind equivalent (e.g., dynamically computed pixel sizes, percentage widths, `fontVariant`, `contentContainerStyle` on ScrollView).

## Current Status

- [x] Backend CDK infrastructure
- [x] Lambda functions (parseEntry, getEntries, getWeeklySummary, deleteEntry)
- [x] OpenAI tool calling integration
- [ ] Frontend Clerk integration
- [ ] Frontend API service layer
- [ ] UI components (NLInput, EntryList, WeeklySummary)
- [ ] Offline queue with IndexedDB
