#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import { BackendStack } from "../lib/backend-stack";

const app = new cdk.App();

// Get configuration from context or environment variables
const clerkIssuer =
  app.node.tryGetContext("clerkIssuer") || process.env.CLERK_ISSUER;
const clerkAudience =
  app.node.tryGetContext("clerkAudience") || process.env.CLERK_AUDIENCE;
const allowedOrigin =
  app.node.tryGetContext("allowedOrigin") || process.env.ALLOWED_ORIGIN || "*";

new BackendStack(app, "CalorieTrackerStack", {
  // Deploy to the current CLI-configured account/region
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },

  // Stack-specific configuration
  clerkIssuer,
  clerkAudience,
  allowedOrigin,

  // Stack tags
  tags: {
    Project: "WeeklyCalorieTracker",
    Environment: "production",
  },
});
