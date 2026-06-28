#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import appConfig from "../app-config.json";
import { AppStage } from "../lib/app-stage";

const app = new cdk.App();

const { appName, stages } = appConfig;

for (const stage of stages) {
  new AppStage(app, `${appName}-${stage.name}`, {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
    stageName: stage.name,
  });
}
