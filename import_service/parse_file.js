const {
    Stack,
    aws_lambda,
    aws_sqs,
} = require('aws-cdk-lib');
const s3 = require('aws-cdk-lib/aws-s3');
const s3n = require('aws-cdk-lib/aws-s3-notifications');

class ParseFile extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const { bucket } = props;
    const catalogItemsQueve = aws_sqs.Queue.fromQueueArn(this, 'CatalogItemsQueue', 
      'arn:aws:sqs:us-east-1:211125562846:catalogItemsQueue'
    )

    this.import_file_parser = new aws_lambda.Function(
        this, 'ParseFileHandler',
        {
            runtime: aws_lambda.Runtime.NODEJS_20_X,
            code: aws_lambda.Code.fromAsset('import_service/lambda_func/'),
            handler: 'parse_file.handler',
            environment: {
              BUCKET_NAME: bucket.bucketName
            }
        }
    );

    bucket.grantReadWrite(this.import_file_parser);
    bucket.grantPut(this.import_file_parser);
    bucket.grantDelete(this.import_file_parser);

    catalogItemsQueve.grantSendMessages(this.import_file_parser);

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(this.import_file_parser),
      {
        prefix: 'uploaded/',
      },
    );
  }
}

module.exports = { ParseFile }
