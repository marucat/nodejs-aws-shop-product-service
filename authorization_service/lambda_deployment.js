const { Stack } = require('aws-cdk-lib');

const { AuthorizationService } = require('./auth_service');

class AuthorizationServiceStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    new AuthorizationService(this, 'AuthorizationService');
  }
}

module.exports = { AuthorizationServiceStack }
