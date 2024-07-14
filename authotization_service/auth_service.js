const {
  Stack,
  aws_lambda,
} = require('aws-cdk-lib');
require('dotenv').config();

class AuthorizationService extends Stack {
/**
 *
 * @param {Construct} scope
 * @param {string} id
 * @param {StackProps=} props
 */
constructor(scope, id, props) {
  super(scope, id, props);

  const login = 'marucat';
  const SECRET_KEY = process.env[login];

  this.authorization_service = new aws_lambda.Function(
      this, 'AuthorizationServiceHandler',
      {
          runtime: aws_lambda.Runtime.NODEJS_20_X,
          code: aws_lambda.Code.fromAsset('authorization_service/lambda_func/'),
          handler: 'authorization_service.handler',
          environment: {
            [login]: SECRET_KEY
          },
          functionName: 'AuthFunction'
      }
  );
}
}

module.exports = { AuthorizationService }
