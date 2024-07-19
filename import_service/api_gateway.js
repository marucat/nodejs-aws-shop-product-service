const { 
    Stack,
    aws_lambda,
    aws_apigateway,
    Fn,
    Duration,
} = require('aws-cdk-lib');
const { Role, ServicePrincipal, PolicyStatement } = require('aws-cdk-lib/aws-iam');
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
        defaultCorsPreflightOptions: {
          allowOrigins: aws_apigateway.Cors.ALL_ORIGINS,
          allowMethods: aws_apigateway.Cors.ALL_METHODS,
          allowHeaders: aws_apigateway.Cors.DEFAULT_HEADERS,
          allowCredentials: true,
        },
    });

    const basicAuthorizerLambda = aws_lambda.Function.fromFunctionName(
      this,
      'authFunction',
      'AuthFunction'
    );

    const authorizer = new aws_apigateway.TokenAuthorizer(this, 'APIGatewayAuthorizer', {
      handler: basicAuthorizerLambda,
      identitySource: aws_apigateway.IdentitySource.header('authorization'),
      resultsCacheTtl: Duration.seconds(0),
    });

    const import_resource = api.root.addResource('import');

    import_resource.addMethod('GET', new aws_apigateway.LambdaIntegration(import_service_fn),
      {
        authorizer: authorizer,
        authorizationType: aws_apigateway.AuthorizationType.CUSTOM,
        requestParameters: {
          'method.request.querystring.name': true,
        },
      }
    );

    api.addGatewayResponse('UnauthorizedResponse', {
      type: aws_apigateway.ResponseType.UNAUTHORIZED,
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
        'Access-Control-Allow-Methods': "'GET, POST, PUT, DELETE, OPTIONS'",
      },
      statusCode: '401',
      templates: {
        'text/plain': 'Unauthorized'
      },
    });

    api.addGatewayResponse('AccessForbiddenResponse', {
      type: aws_apigateway.ResponseType.ACCESS_DENIED,
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
        'Access-Control-Allow-Methods': "'GET, POST, PUT, DELETE, OPTIONS'",
      },
      statusCode: '403',
      templates: {
        'text/plain': 'Access Forbidden'
      },
    });

  }
}

module.exports = { ApiGateway }


