#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import "dotenv/config";
import { BackendStack } from "../lib/backend-stack";

const app = new cdk.App();

// Get configuration from environment variables
const clerkIssuer = process.env.CLERK_ISSUER;
const clerkAudience = process.env.CLERK_AUDIENCE || "";
const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
const openaiApiKey = process.env.OPENAI_API_KEY;

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
  openaiApiKey,

  // Stack tags
  tags: {
    Project: "WeeklyCalorieTracker",
    Environment: "production",
  },
});
