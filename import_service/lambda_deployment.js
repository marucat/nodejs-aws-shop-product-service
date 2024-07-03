const { Stack } = require('aws-cdk-lib');

const { ApiGateway } = require('./api_gateway');
const { ImportBucketClass } = require('./import_bucket');
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

    const { bucket } = new ImportBucketClass(this, 'ImportProductsBucket');

    const import_service_lbd = new ImportService(this, 'ImportService', { bucket });
    new ParseFile(this, 'ParseFile', { bucket });
    new ApiGateway(this, 'ImportAPIGateway', {
      import_service_fn: import_service_lbd.import_service,
    });
  }
}

module.exports = { ImportServiceStack }
