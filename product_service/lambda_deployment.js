const { Stack, Duration } = require('aws-cdk-lib');

const { ApiGateway } = require('./api_gateway');
const { GetProducts } = require('./get_products');
const { ProductsById } = require('./get_product_by_id');

class ProductServiceStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const get_product_list_lbd = new GetProducts(this, 'ProductsList');
    const get_product_by_id_lbd = new ProductsById(this, 'ProductsById');
    new ApiGateway(this, 'APIGateway', {
      get_product_list_fn: get_product_list_lbd.get_product_list,
      get_products_by_id_fn: get_product_by_id_lbd.get_products_by_id,
    });
  }
}

module.exports = { ProductServiceStack }
