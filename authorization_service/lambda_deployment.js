const { Stack, aws_ass } = require('aws-cdk-lib');
const { Template } = require('aws-cdk-lib/assertions');

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

    const stack = new AuthorizationService(this, 'AuthorizationService');
    const template = Template.fromStack(stack);
  }
}

module.exports = { AuthorizationServiceStack }
