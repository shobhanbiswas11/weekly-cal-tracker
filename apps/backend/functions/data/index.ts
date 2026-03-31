// Data Lambda - Handles all data queries and mutations
// Thin handler - delegates to routes

import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { createRouter } from "../shared/http";
import { routes } from "./routes";

const router = createRouter(routes);

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  return router(event);
};
