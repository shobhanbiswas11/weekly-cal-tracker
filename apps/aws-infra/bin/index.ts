#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import "dotenv/config";
import { ServerlessStack } from "../lib/serverless-stack";

const app = new cdk.App();

// Get configuration from environment variables
const jwtIssuer = process.env.JWT_ISSUER;

if (!jwtIssuer) {
  throw new Error("JWT_ISSUER environment variable is required");
}

new ServerlessStack(app, "WeeklyHealthServerlessStack", {
  // Deploy to the current CLI-configured account/region
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },

  // Stack-specific configuration
  jwtIssuer,

  // Stack tags
  tags: {
    Project: "Weekly Health",
    Environment: "production",
  },
});
