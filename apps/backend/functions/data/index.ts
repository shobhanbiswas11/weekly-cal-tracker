// Data Lambda - Handles all data queries and mutations
// Thin handler - delegates to routes

import { initContainer } from "@weekly-cal/api";
import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { createRouter } from "../shared/http";
import { routes } from "./routes";

// Initialize DI container (validates env vars at cold start)
initContainer();
const router = createRouter(routes);

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  return router(event);
};
