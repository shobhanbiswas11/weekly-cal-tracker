import * as apigatewayv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as apigatewayv2Authorizers from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import * as apigatewayv2Integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import * as path from "path";

interface BackendStackProps extends cdk.StackProps {
  clerkIssuer?: string;
  clerkAudience?: string;
  allowedOrigin?: string;
}

export class BackendStack extends cdk.Stack {
  public readonly apiUrl: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props?: BackendStackProps) {
    super(scope, id, props);

    // Configuration from context or environment
    const clerkIssuer =
      props?.clerkIssuer ||
      this.node.tryGetContext("clerkIssuer") ||
      "https://YOUR_CLERK_DOMAIN.clerk.accounts.dev";
    const clerkAudience =
      props?.clerkAudience || this.node.tryGetContext("clerkAudience") || "";
    const allowedOrigin =
      props?.allowedOrigin || this.node.tryGetContext("allowedOrigin") || "*";

    // =====================
    // DynamoDB Table
    // =====================
    const calorieEntriesTable = new dynamodb.Table(
      this,
      "CalorieEntriesTable",
      {
        tableName: "CalorieEntries",
        partitionKey: {
          name: "PK",
          type: dynamodb.AttributeType.STRING,
        },
        sortKey: {
          name: "SK",
          type: dynamodb.AttributeType.STRING,
        },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    );

    // =====================
    // SSM Parameter for OpenAI API Key
    // =====================
    // Note: You need to create this parameter manually in AWS SSM Parameter Store
    // aws ssm put-parameter --name "/calorie-tracker/openai-api-key" --value "sk-xxx" --type SecureString
    const openaiApiKeyParam =
      ssm.StringParameter.fromSecureStringParameterAttributes(
        this,
        "OpenAIApiKey",
        {
          parameterName: "/calorie-tracker/openai-api-key",
        },
      );

    // =====================
    // Shared Lambda Configuration
    // =====================
    const lambdaEnvironment = {
      TABLE_NAME: calorieEntriesTable.tableName,
      ALLOWED_ORIGIN: allowedOrigin,
    };

    const lambdaDefaults: Partial<lambdaNodejs.NodejsFunctionProps> = {
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      bundling: {
        minify: true,
        sourceMap: true,
        externalModules: ["@aws-sdk/*"], // Use SDK from Lambda runtime
      },
    };

    // =====================
    // Lambda Functions
    // =====================
    const parseEntryFn = new lambdaNodejs.NodejsFunction(this, "ParseEntryFn", {
      ...lambdaDefaults,
      entry: path.join(__dirname, "../functions/parseEntry/index.ts"),
      handler: "handler",
      timeout: cdk.Duration.seconds(60), // Longer timeout for OpenAI calls
      environment: {
        ...lambdaEnvironment,
        OPENAI_API_KEY: openaiApiKeyParam.stringValue,
      },
    });

    const getEntriesFn = new lambdaNodejs.NodejsFunction(this, "GetEntriesFn", {
      ...lambdaDefaults,
      entry: path.join(__dirname, "../functions/getEntries/index.ts"),
      handler: "handler",
      environment: lambdaEnvironment,
    });

    const getWeeklySummaryFn = new lambdaNodejs.NodejsFunction(
      this,
      "GetWeeklySummaryFn",
      {
        ...lambdaDefaults,
        entry: path.join(__dirname, "../functions/getWeeklySummary/index.ts"),
        handler: "handler",
        environment: lambdaEnvironment,
      },
    );

    const deleteEntryFn = new lambdaNodejs.NodejsFunction(
      this,
      "DeleteEntryFn",
      {
        ...lambdaDefaults,
        entry: path.join(__dirname, "../functions/deleteEntry/index.ts"),
        handler: "handler",
        environment: lambdaEnvironment,
      },
    );

    // Grant DynamoDB permissions
    calorieEntriesTable.grantReadWriteData(parseEntryFn);
    calorieEntriesTable.grantReadData(getEntriesFn);
    calorieEntriesTable.grantReadData(getWeeklySummaryFn);
    calorieEntriesTable.grantReadWriteData(deleteEntryFn);

    // =====================
    // HTTP API with JWT Authorizer
    // =====================
    const httpApi = new apigatewayv2.HttpApi(this, "CalorieTrackerApi", {
      apiName: "CalorieTrackerApi",
      corsPreflight: {
        allowOrigins: [allowedOrigin],
        allowMethods: [
          apigatewayv2.CorsHttpMethod.GET,
          apigatewayv2.CorsHttpMethod.POST,
          apigatewayv2.CorsHttpMethod.DELETE,
          apigatewayv2.CorsHttpMethod.OPTIONS,
        ],
        allowHeaders: ["Content-Type", "Authorization"],
        maxAge: cdk.Duration.days(1),
      },
    });

    // JWT Authorizer for Clerk
    // Note: For Clerk, the audience should be your Clerk Frontend API URL
    // e.g., "https://your-app.clerk.accounts.dev"
    if (!clerkAudience) {
      throw new Error(
        "clerkAudience is required. Set it to your Clerk Frontend API URL in cdk.context.json",
      );
    }

    const jwtAuthorizer = new apigatewayv2Authorizers.HttpJwtAuthorizer(
      "ClerkJwtAuthorizer",
      clerkIssuer,
      {
        jwtAudience: [clerkAudience],
        identitySource: ["$request.header.Authorization"],
      },
    );

    // =====================
    // API Routes
    // =====================

    // POST /entries/parse - Parse natural language and create entries
    httpApi.addRoutes({
      path: "/entries/parse",
      methods: [apigatewayv2.HttpMethod.POST],
      integration: new apigatewayv2Integrations.HttpLambdaIntegration(
        "ParseEntryIntegration",
        parseEntryFn,
      ),
      authorizer: jwtAuthorizer,
    });

    // GET /entries - Get entries for a date
    httpApi.addRoutes({
      path: "/entries",
      methods: [apigatewayv2.HttpMethod.GET],
      integration: new apigatewayv2Integrations.HttpLambdaIntegration(
        "GetEntriesIntegration",
        getEntriesFn,
      ),
      authorizer: jwtAuthorizer,
    });

    // GET /summary - Get weekly summary
    httpApi.addRoutes({
      path: "/summary",
      methods: [apigatewayv2.HttpMethod.GET],
      integration: new apigatewayv2Integrations.HttpLambdaIntegration(
        "GetWeeklySummaryIntegration",
        getWeeklySummaryFn,
      ),
      authorizer: jwtAuthorizer,
    });

    // DELETE /entries/{date}/{id} - Delete an entry
    httpApi.addRoutes({
      path: "/entries/{date}/{id}",
      methods: [apigatewayv2.HttpMethod.DELETE],
      integration: new apigatewayv2Integrations.HttpLambdaIntegration(
        "DeleteEntryIntegration",
        deleteEntryFn,
      ),
      authorizer: jwtAuthorizer,
    });

    // =====================
    // Outputs
    // =====================
    this.apiUrl = new cdk.CfnOutput(this, "ApiUrl", {
      value: httpApi.apiEndpoint,
      description: "HTTP API endpoint URL",
    });

    new cdk.CfnOutput(this, "TableName", {
      value: calorieEntriesTable.tableName,
      description: "DynamoDB table name",
    });
  }
}
