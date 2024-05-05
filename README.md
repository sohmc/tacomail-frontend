# tacomail - frontend

A user interface for [Tacomail](https://github.com/sohmc/node-postfix-api).

## Configuration

The front-end requires the following environment variables:

| Name | Description |
| --- | --- |
| LAMBDA_URL | The URL end-point for tacomail, typically provided within the AWS Console, or, the AWS API Gateway URL |
| AWS_ACCESS_KEY | The AWS Access Key set up to access the Lambda Endpoint.  This access key does not require access to the DynamoDB table |
| AWS_SECRET_KEY | The AWS Secret Key that goes with the Access Key |

The AWS Access Key and Secret Key are required.  Please do not set up your Lambda to be accessible without authentication as that workflow is not supported at this time.

Optional environment variables

| Name | Description |
| --- | --- |
| LOG_LEVEL | Log-level for Winston.  Default is info, but you may set it to any log level supported by Winston |

Environment variables should be set in an env file and bind-mounted to `/app/.env.local`, which will then be read by nextjs.

