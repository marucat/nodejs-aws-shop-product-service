const { 
    Stack,
    aws_lambda,
    aws_apigateway,
    aws_sns,
    aws_sns_subscriptions,
    aws_sqs,
    aws_lambda_event_sources,
} = require('aws-cdk-lib');

class BatchProducts extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const createProductTopic = new aws_sns.Topic(this, 'CreateProductTopic', {
      topicName: 'createProductTopic'
    });
    createProductTopic.addSubscription(
      new aws_sns_subscriptions.EmailSubscription('mariia_yakovlieva@epam.com')
    );

    const catalogItemsQueve = new aws_sqs.Queue(this, 'CatalogItemsQueue',
      {
        queueName: 'catalogItemsQueue'
      }
    )
      
    const eventSource = new aws_lambda_event_sources.SqsEventSource(catalogItemsQueve,
      {
        batchSize: 5
      }
    )

    const environment = {
      SNS_TOPIC_ARN: createProductTopic.topicArn
    }

    this.putBatch = new aws_lambda.Function(this, 'PutBatch', {
      runtime: aws_lambda.Runtime.NODEJS_16_X,
      code: aws_lambda.Code.fromAsset('product_service/lambda_func/'),
      handler: 'products_batch.handler',
      environment
    });

    this.putBatch.addEventSource(eventSource);
    catalogItemsQueve.grantConsumeMessages(this.putBatch);

    createProductTopic.grantPublish(this.putBatch);
  }
}

module.exports = { BatchProducts }
