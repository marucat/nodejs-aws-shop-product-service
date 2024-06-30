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
        get_product_list_fn = aws_lambda,
        create_product_fn = aws_lambda,
        get_products_by_id_fn = aws_lambda,
    } = props;

    const api = new aws_apigateway.RestApi(this, 'ProductServiceApi', {
        restApiName: 'Product Service'
    });

    const products_resource = api.root.addResource('products');
    products_resource.addMethod('GET', new aws_apigateway.LambdaIntegration(get_product_list_fn));
    products_resource.addMethod('POST', new aws_apigateway.LambdaIntegration(create_product_fn));

    const product_by_id_resource = products_resource.addResource('{productId}');
    product_by_id_resource.addMethod('GET', new aws_apigateway.LambdaIntegration(get_products_by_id_fn));
  }
}

module.exports = { ApiGateway }


