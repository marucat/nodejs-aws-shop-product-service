const {
    Stack,
    aws_lambda,
    aws_apigateway,
    aws_s3_notifications,
    aws_s3,
} = require('aws-cdk-lib');

class ParseFile extends Stack {
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

    this.import_file_parser = new aws_lambda.Function(
        this, 'ParseFileHandler',
        {
            runtime: aws_lambda.Runtime.NODEJS_16_X,
            code: aws_lambda.Code.fromAsset('import_service/lambda_func/'),
            handler: 'parse_file.handler',
            environment: {
              BUCKET_NAME: bucket.bucketName
            }
        }
    );

    bucket.grantPut(this.import_file_parser);
    bucket.grantReadWrite(this.import_file_parser);
    bucket.grantDelete(this.import_file_parser);

    const notification = new aws_s3_notifications.LambdaDestination(this.import_file_parser);
    bucket.addEventNotification(aws_s3.EventType.OBJECT_CREATED, notification, {
      prefix: 'uploaded/'
    });
  }
}

module.exports = { ParseFile }
