import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import appConfig from "../app-config.json";
import { ServerlessStack } from "./serverless-stack";

interface AppStageProps extends cdk.StageProps {
  stageName: string;
}

export class AppStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: AppStageProps) {
    super(scope, id, props);

    new ServerlessStack(this, "ServerlessStack", {
      stageName: props.stageName,
      tags: {
        Project: appConfig.appName,
        Environment: props.stageName,
      },
    });
  }
}
