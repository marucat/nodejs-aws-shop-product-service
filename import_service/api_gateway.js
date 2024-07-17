const { 
    Stack,
    aws_lambda,
    aws_apigateway,
    Fn,
} = require('aws-cdk-lib');
const { Role } = require('aws-cdk-lib/aws-iam');
class ApiGateway extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const {
      import_service_fn = aws_lambda,
    } = props;
    
    const api = new aws_apigateway.RestApi(this, 'ImportApi', {
        restApiName: 'Import Service',
        // defaultCorsPreflightOptions: {
        //   allowOrigins: aws_apigateway.Cors.ALL_ORIGINS,
        //   allowMethods: aws_apigateway.Cors.ALL_METHODS,
        //   allowHeaders: aws_apigateway.Cors.DEFAULT_HEADERS,
        //   allowCredentials: true,
        // },
    });

    const basicAuthorizerArn = Fn.importValue("BasicAuthorizerArn");
    const basicAuthorizerArnRole = Fn.importValue("BasicAuthorizerArnRole");
    const basicAuthorizerRole = Role.fromRoleArn(
      this,
      "BasicAuthorizerRole",
      basicAuthorizerArnRole
    );
    const basicAuthorizerLambda = aws_lambda.Function.fromFunctionAttributes(
      this,
      "authFunction",
      {
        functionArn: basicAuthorizerArn,
        role: basicAuthorizerRole,
      }
    );

    const authorizer = new aws_apigateway.TokenAuthorizer(this, 'APIGatewayAuthorizer', {
      identitySource: aws_apigateway.IdentitySource.header("Authorization"),
      handler: basicAuthorizerLambda
    });

    const import_resource = api.root.addResource('import');
    import_resource.addMethod('GET', new aws_apigateway.LambdaIntegration(import_service_fn),
      {
        authorizer: authorizer,
        authorizationType: aws_apigateway.AuthorizationType.CUSTOM,
        requestParameters: {
          "method.request.querystring.name": true,
        },
      }
    );

    api.addGatewayResponse("GatewayResponseUnauthorized", {
      type: aws_apigateway.ResponseType.UNAUTHORIZED,
      responseHeaders: {
        "Access-Control-Allow-Origin": "'*'",
        "Access-Control-Allow-Headers":
          "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
        "Access-Control-Allow-Methods": "'GET,PUT'",
      },
      statusCode: "401",
    });

    api.addGatewayResponse("GatewayResponseAccessDenied", {
      type: aws_apigateway.ResponseType.ACCESS_DENIED,
      responseHeaders: {
        "Access-Control-Allow-Origin": "'*'",
        "Access-Control-Allow-Headers":
          "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
        "Access-Control-Allow-Methods": "'GET,PUT'",
      },
      statusCode: "403",
    });

    import_resource.addMethod('OPTIONS', new aws_apigateway.MockIntegration({
      integrationResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
            'method.response.header.Access-Control-Allow-Origin': "'*'",
            'method.response.header.Access-Control-Allow-Methods': "'GET,POST,OPTIONS'",
            'method.response.header.Access-Control-Max-Age': "'1728000'",
          },
          responseTemplates: {
            'application/json': '{"statusCode": 200}'
          },
        },
      ],
      passthroughBehavior: aws_apigateway.PassthroughBehavior.NEVER,
      requestTemplates: {
        'application/json': '{"statusCode": 200}'
      },
    }), {
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Headers': true,
            'method.response.header.Access-Control-Allow-Methods': true,
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Max-Age': true,
          },
        },
      ],
    });

  }
}

module.exports = { ApiGateway }


