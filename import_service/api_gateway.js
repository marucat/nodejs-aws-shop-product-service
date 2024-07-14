const { 
    Stack,
    aws_lambda,
    aws_apigateway,
} = require('aws-cdk-lib');

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

    const basicAuthorizerLambda = aws_lambda.Function.fromFunctionName(this, 'authFunction', 'AuthFunction');

    const api = new aws_apigateway.RestApi(this, 'ImportApi', {
        restApiName: 'Import Service'
    });

    const authorizer = new aws_apigateway.TokenAuthorizer(this, 'BasicAuthorizer', {
      identitySource: 'method.request.header.Authorization',
      handler: basicAuthorizerLambda
    });

    const import_resource = api.root.addResource('import');
    import_resource.addMethod('GET', new aws_apigateway.LambdaIntegration(import_service_fn),
      {
        authorizer: authorizer,
        authorizationType: aws_apigateway.AuthorizationType.CUSTOM
      }
    );
  }
}

module.exports = { ApiGateway }


