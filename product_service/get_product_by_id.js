const { 
    Stack,
    aws_lambda,
    aws_apigateway
} = require('aws-cdk-lib');

class ProductsById extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    this.get_products_by_id = new aws_lambda.Function(
        this, 'GetProductsByIdHandler',
        {
            runtime: aws_lambda.Runtime.NODEJS_20_X,
            code: aws_lambda.Code.fromAsset('product_service/lambda_func/'),
            handler: 'product_by_id.handler'
        }
    )
  }
}

module.exports = { ProductsById }
