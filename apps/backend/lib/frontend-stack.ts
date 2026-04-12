import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import * as path from "path";

interface FrontendStackProps extends cdk.StackProps {
  /**
   * The ARN of the ACM certificate (must be in us-east-1 for CloudFront)
   */
  certificateArn: string;

  /**
   * The domain name for the CloudFront distribution (e.g., calories.botobrain.com)
   */
  domainName: string;
}

export class FrontendStack extends cdk.Stack {
  public readonly distributionDomainName: cdk.CfnOutput;
  public readonly distributionId: cdk.CfnOutput;
  public readonly bucketName: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    const { certificateArn, domainName } = props;

    // =====================
    // S3 Bucket for Static Assets
    // =====================
    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // =====================
    // Import existing ACM Certificate
    // =====================
    const certificate = acm.Certificate.fromCertificateArn(
      this,
      "Certificate",
      certificateArn,
    );

    // =====================
    // CloudFront Distribution
    // =====================
    const distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      },
      domainNames: [domainName],
      certificate,
      defaultRootObject: "index.html",
      // SPA routing: return index.html for 403/404 errors
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.minutes(5),
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // US, Canada, Europe
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
    });

    // =====================
    // S3 Deployment (uploads PWA build and invalidates CloudFront)
    // =====================
    new s3deploy.BucketDeployment(this, "DeployWebsite", {
      sources: [s3deploy.Source.asset(path.join(__dirname, "../../pwa/dist"))],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ["/*"],
    });

    // =====================
    // Stack Outputs
    // =====================
    this.distributionDomainName = new cdk.CfnOutput(
      this,
      "DistributionDomainName",
      {
        value: distribution.distributionDomainName,
        description: "CloudFront distribution domain name",
      },
    );

    this.distributionId = new cdk.CfnOutput(this, "DistributionId", {
      value: distribution.distributionId,
      description: "CloudFront distribution ID",
    });

    this.bucketName = new cdk.CfnOutput(this, "BucketName", {
      value: websiteBucket.bucketName,
      description: "S3 bucket name for website assets",
    });
  }
}
