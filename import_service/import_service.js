const { 
    Stack,
    aws_lambda,
    aws_apigateway,
    aws_s3
} = require('aws-cdk-lib');

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
    const bucket = aws_s3.Bucket.fromBucketName(this, 'ImportBucket', bucket_name);

    this.import_service = new aws_lambda.Function(
        this, 'ImportServiceHandler',
        {
            runtime: aws_lambda.Runtime.NODEJS_16_X,
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
