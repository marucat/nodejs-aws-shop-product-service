const { Stack, Duration } = require('aws-cdk-lib');

const { ApiGateway } = require('./api_gateway');
const { ImportService } = require('./import_service');
const { ParseFile } = require('./parse_file');

class ImportServiceStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const bucket_name = 'task5-bucket-for-shop-csv';

    const import_service_lbd = new ImportService(this, 'ImportService', { bucket_name });
    new ParseFile(this, 'ParseFile', { bucket_name });
    new ApiGateway(this, 'APIGateway', {
      import_service_fn: import_service_lbd.import_service,
    });
  }
}

module.exports = { ImportServiceStack }
