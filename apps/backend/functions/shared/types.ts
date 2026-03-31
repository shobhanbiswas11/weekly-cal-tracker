// Shared types for Lambda functions
// Backend treats all data as key-value records - frontend owns types

// Generic record type - all data is key-value pairs
export type DataRecord = Record<string, unknown>;

// =============================================================================
// DynamoDB Key Structure (Single Table Design)
// =============================================================================

// PK: USER#<userId>
// SK patterns:
//   - PROFILE
//   - FOOD_ENTRY#<YYYY-MM-DD>#<uuid>
