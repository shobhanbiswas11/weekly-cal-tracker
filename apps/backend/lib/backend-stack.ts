import * as apigatewayv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as apigatewayv2Authorizers from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import * as apigatewayv2Integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import * as path from "path";

interface BackendStackProps extends cdk.StackProps {
  jwtIssuer: string;
  openaiApiKey: string;
  clerkSecretKey: string;
}

export class BackendStack extends cdk.Stack {
  public readonly apiUrl: cdk.CfnOutput;
  public readonly chatUrl: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    const { jwtIssuer, openaiApiKey, clerkSecretKey } = props;

    // =====================
    // DynamoDB Table (Single Table Design)
    // =====================
    const table = new dynamodb.Table(this, "WeeklyCalorieTrackerTable", {
      tableName: "WeeklyCalorieTracker",
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
    });

    // =====================
    // Shared Lambda Configuration
    // =====================
    const lambdaEnvironment = {
      TABLE_NAME: table.tableName,
      ALLOWED_ORIGIN: "*",
      CLERK_SECRET_KEY: clerkSecretKey,
    };

    const lambdaDefaults: Partial<lambdaNodejs.NodejsFunctionProps> = {
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      bundling: {
        minify: true,
        sourceMap: true,
        externalModules: ["@aws-sdk/*"],
      },
    };

    // =====================
    // Data Lambda (all queries + mutations)
    // =====================
    const dataFn = new lambdaNodejs.NodejsFunction(this, "DataFn", {
      ...lambdaDefaults,
      entry: path.join(__dirname, "../functions/data/index.ts"),
      handler: "handler",
      environment: lambdaEnvironment,
    });

    table.grantReadWriteData(dataFn);

    // =====================
    // Chat Lambda (AI streaming)
    // =====================
    const chatFn = new lambdaNodejs.NodejsFunction(this, "ChatFn", {
      ...lambdaDefaults,
      entry: path.join(__dirname, "../functions/chat/index.ts"),
      handler: "handler",
      timeout: cdk.Duration.seconds(120), // Longer timeout for AI responses
      memorySize: 512,
      environment: {
        ...lambdaEnvironment,
        OPENAI_API_KEY: openaiApiKey,
        JWT_ISSUER: jwtIssuer,
      },
    });

    table.grantReadWriteData(chatFn);

    // Add Lambda Function URL with response streaming for chat
    const chatFnUrl = chatFn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE, // We handle auth in the Lambda
      invokeMode: lambda.InvokeMode.RESPONSE_STREAM,
      cors: {
        allowedOrigins: ["*"],
        allowedHeaders: ["Content-Type", "Authorization"],
        allowedMethods: [lambda.HttpMethod.POST],
      },
    });

    // =====================
    // HTTP API with JWT Authorizer
    // =====================
    const httpApi = new apigatewayv2.HttpApi(this, "WeeklyCalorieTrackerApi", {
      apiName: "WeeklyCalorieTrackerApi",
      corsPreflight: {
        allowOrigins: ["*"],
        allowMethods: [
          apigatewayv2.CorsHttpMethod.GET,
          apigatewayv2.CorsHttpMethod.POST,
          apigatewayv2.CorsHttpMethod.PUT,
          apigatewayv2.CorsHttpMethod.DELETE,
          apigatewayv2.CorsHttpMethod.OPTIONS,
        ],
        allowHeaders: ["Content-Type", "Authorization"],
        maxAge: cdk.Duration.days(1),
      },
    });

    const jwtAuthorizer = new apigatewayv2Authorizers.HttpJwtAuthorizer(
      "JwtAuthorizer",
      jwtIssuer,
      {
        jwtAudience: ["*"],
        identitySource: ["$request.header.Authorization"],
      },
    );

    const dataIntegration = new apigatewayv2Integrations.HttpLambdaIntegration(
      "DataIntegration",
      dataFn,
    );

    // =====================
    // API Routes
    // =====================

    // Summary - app init
    httpApi.addRoutes({
      path: "/summary",
      methods: [apigatewayv2.HttpMethod.GET],
      integration: dataIntegration,
      authorizer: jwtAuthorizer,
    });

    // Weekly summary
    httpApi.addRoutes({
      path: "/weeks/{weekId}",
      methods: [apigatewayv2.HttpMethod.GET],
      integration: dataIntegration,
      authorizer: jwtAuthorizer,
    });

    // Entries - create
    httpApi.addRoutes({
      path: "/entries",
      methods: [apigatewayv2.HttpMethod.POST],
      integration: dataIntegration,
      authorizer: jwtAuthorizer,
    });

    // Entries - update/delete
    httpApi.addRoutes({
      path: "/entries/{date}/{id}",
      methods: [apigatewayv2.HttpMethod.PUT, apigatewayv2.HttpMethod.DELETE],
      integration: dataIntegration,
      authorizer: jwtAuthorizer,
    });

    // Profile - create/update
    httpApi.addRoutes({
      path: "/profile",
      methods: [apigatewayv2.HttpMethod.POST, apigatewayv2.HttpMethod.PUT],
      integration: dataIntegration,
      authorizer: jwtAuthorizer,
    });

    // Activities - get by date
    httpApi.addRoutes({
      path: "/activities/{date}",
      methods: [apigatewayv2.HttpMethod.GET],
      integration: dataIntegration,
      authorizer: jwtAuthorizer,
    });

    // Activities - create
    httpApi.addRoutes({
      path: "/activities",
      methods: [apigatewayv2.HttpMethod.POST],
      integration: dataIntegration,
      authorizer: jwtAuthorizer,
    });

    // Activities - update/delete
    httpApi.addRoutes({
      path: "/activities/{date}/{id}",
      methods: [apigatewayv2.HttpMethod.PUT, apigatewayv2.HttpMethod.DELETE],
      integration: dataIntegration,
      authorizer: jwtAuthorizer,
    });

    // =====================
    // Outputs
    // =====================
    this.apiUrl = new cdk.CfnOutput(this, "ApiUrl", {
      value: httpApi.apiEndpoint,
      description: "HTTP API endpoint URL",
    });

    this.chatUrl = new cdk.CfnOutput(this, "ChatUrl", {
      value: chatFnUrl.url,
      description: "Chat Lambda Function URL (streaming)",
    });

    new cdk.CfnOutput(this, "TableName", {
      value: table.tableName,
      description: "DynamoDB table name",
    });
  }
}
