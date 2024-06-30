const { 
    Stack,
    aws_lambda,
    aws_apigateway
} = require('aws-cdk-lib');
const s3 = require('aws-cdk-lib/aws-s3');

class ImportService extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const { bucket_name } = props;
    const bucket = s3.Bucket.fromBucketName(this, 'ImportBucket', bucket_name);

    this.import_service = new aws_lambda.Function(
        this, 'ImportServiceHandler',
        {
            runtime: aws_lambda.Runtime.NODEJS_20_X,
            code: aws_lambda.Code.fromAsset('import_service/lambda_func/'),
            handler: 'import_service.handler',
            environment: {
              BUCKET_NAME: bucket.bucketName
            }
        }
    );

    bucket.grantPut(this.import_service);
    bucket.grantReadWrite(this.import_service);
  }
}

module.exports = { ImportService }
