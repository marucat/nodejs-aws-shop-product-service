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

    const api = new aws_apigateway.RestApi(this, 'ImportApi', {
        restApiName: 'Import Service'
    });

    const import_resource = api.root.addResource('import');
    import_resource.addMethod('GET', new aws_apigateway.LambdaIntegration(import_service_fn));
  }
}

module.exports = { ApiGateway }


