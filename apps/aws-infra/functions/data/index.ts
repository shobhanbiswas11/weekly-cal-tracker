// Data Lambda - Handles all data queries and mutations
// Thin handler - delegates to routes

import { initContainer } from "@weekly-cal/api";
import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { createRouter } from "../shared/http";
import { getSecret } from "../shared/secrets";
import { routes } from "./routes";

// Fetch secrets from SSM at cold start, then initialize
const init = (async () => {
  process.env.CLERK_SECRET_KEY = await getSecret(
    process.env.SSM_CLERK_SECRET_KEY!,
  );
  initContainer();
})();

const router = createRouter(routes);

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  await init;
  return router(event);
};
