const { Stack, Duration } = require('aws-cdk-lib');

const { ApiGateway } = require('./api_gateway');
const { GetProducts } = require('./get_products');
const { CreateProduct } = require('./create_product');
const { ProductsById } = require('./get_product_by_id');
const { BatchProducts } = require('./batch_products');

class ProductServiceStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    new BatchProducts(this, 'BatchProducts');
    const get_product_list_lbd = new GetProducts(this, 'ProductsList');
    const create_product_lbd = new CreateProduct(this, 'ProductCreate');
    const get_product_by_id_lbd = new ProductsById(this, 'ProductsById');
    new ApiGateway(this, 'APIGateway', {
      get_product_list_fn: get_product_list_lbd.get_product_list,
      create_product_fn: create_product_lbd.create_product,
      get_products_by_id_fn: get_product_by_id_lbd.get_products_by_id,
    });
  }
}

module.exports = { ProductServiceStack }
