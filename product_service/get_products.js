const { 
    Stack,
    aws_lambda,
    aws_apigateway
} = require('aws-cdk-lib');

class GetProducts extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    this.get_product_list = new aws_lambda.Function(
        this, 'GetProductListHandler',
        {
            runtime: aws_lambda.Runtime.NODEJS_16_X,
            code: aws_lambda.Code.fromAsset('product_service/lambda_func/'),
            handler: 'product_list.handler'
        }
    )
  }
}

module.exports = { GetProducts }
