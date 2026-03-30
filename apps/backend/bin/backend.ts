#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import "dotenv/config";
import { BackendStack } from "../lib/backend-stack";

const app = new cdk.App();

// Get configuration from environment variables
const clerkIssuer = process.env.CLERK_ISSUER;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!clerkIssuer) {
  throw new Error("CLERK_ISSUER environment variable is required");
}

if (!openaiApiKey) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

new BackendStack(app, "CalorieTrackerStack", {
  // Deploy to the current CLI-configured account/region
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },

  // Stack-specific configuration
  clerkIssuer,
  openaiApiKey,

  // Stack tags
  tags: {
    Project: "WeeklyCalorieTracker",
    Environment: "production",
  },
});
