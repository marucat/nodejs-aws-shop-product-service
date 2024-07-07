const { Construct } = require('constructs');
const s3 = require('aws-cdk-lib/aws-s3');
const cr = require('aws-cdk-lib/custom-resources');

class ImportBucketClass extends Construct {
  constructor(scope, id) {
    super(scope, id);

    this.bucket = s3.Bucket.fromBucketName(this, id, 'task5-bucket-for-shop-csv');

    const corsRule = {
      AllowedHeaders: ['*'],
      AllowedMethods: ['PUT'],
      AllowedOrigins: ['*'],
    };

    new cr.AwsCustomResource(this, 'PutCorsConfiguration', {
      onCreate: {
        service: 'S3',
        action: 'putBucketCors',
        parameters: {
          Bucket: this.bucket.bucketName,
          CORSConfiguration: {
            CORSRules: [corsRule],
          },
        },
        physicalResourceId: cr.PhysicalResourceId.of(`PutCorsConfiguration-${this.bucket.bucketName}`),
      },
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({ resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE }),
    });

  }
}

module.exports = { ImportBucketClass }