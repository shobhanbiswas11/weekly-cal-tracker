#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import "dotenv/config";
import { BackendStack } from "../lib/backend-stack";
import { FrontendStack } from "../lib/frontend-stack";

const app = new cdk.App();

// Get configuration from environment variables
const jwtIssuer = process.env.JWT_ISSUER;
const openaiApiKey = process.env.OPENAI_API_KEY;
const certificateArn = process.env.CERTIFICATE_ARN;
const domainName = process.env.DOMAIN_NAME;

if (!jwtIssuer) {
  throw new Error("JWT_ISSUER environment variable is required");
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
  jwtIssuer,
  openaiApiKey,

  // Stack tags
  tags: {
    Project: "WeeklyCalorieTracker",
    Environment: "production",
  },
});

// Frontend stack (only deploy if certificate ARN and domain name are provided)
if (certificateArn && domainName) {
  new FrontendStack(app, "FrontendStack", {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },

    certificateArn,
    domainName,

    tags: {
      Project: "WeeklyCalorieTracker",
      Environment: "production",
    },
  });
}
