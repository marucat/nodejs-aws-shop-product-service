const {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} = require('@aws-sdk/client-s3');
const { SQSClient, GetQueueUrlCommand, SendMessageCommand } = require('@aws-sdk/client-sqs');
const csv = require('csv-parser');

const errorHandler = require('./errorHandler');

const client = new S3Client({});
const sqsClient = new SQSClient({});

const csvParser = async (stream, sqsQueueUrl) => {
  return new Promise((res, rej) => {
    stream.pipe(csv())
      .on('data', async (data) => {
        const commandSqsSendMes = new SendMessageCommand({
          QueueUrl: sqsQueueUrl,
          MessageBody: data,
        });
      
        const response = await sqsClient.send(commandSqsSendMes);
        console.log('SQS send message response', response);
        return response;
      })
      .on('end', () => {
        res();
      }).on('error', (err) => {
      rej(err);
      console.log('error parsing csv', err);
    });
  });
};

exports.handler = async function(event, context) {
    try {
        const bucket_name = process.env.BUCKET_NAME;

        const commandSqs = new GetQueueUrlCommand({ QueueName: 'catalogItemsQueue' });
        const responseSqs = await sqsClient.send(commandSqs);
        const sqsQueueUrl = responseSqs.QueueUrl;
    
        for (const record of event.Records) {
            const key = record.s3.object.key;
            console.log('key: ', key);
            console.log('record: ', record);
    
            const params = {
                Bucket: bucket_name,
                Key: key
            };
    
            const getCommand = new GetObjectCommand(params);
            const getResponse = await client.send(getCommand);
            console.log(getResponse);
            
            console.log('File rows:');
            if(getResponse.Body) {
                const stream = getResponse.Body;
                await csvParser(stream, sqsQueueUrl);
            } else {
                throw new Error('Empty body');
            }
            
            const copy_params = {
                Bucket: bucket_name,
                CopySource: `${bucket_name}/${key}`,
                Key: key.replace('uploaded', 'parsed'),
            };
            const copyCommand = new CopyObjectCommand(copy_params);
            const copyResponse = await client.send(copyCommand);
            console.log('File has been copied:', copyResponse);
            
            const deleteCommand = new DeleteObjectCommand(params);
            const deleteResponse = await client.send(deleteCommand);
            console.log('File has been deleted:', deleteResponse);
        };
    } catch (err) {
        console.log('Error!!',err);
        return errorHandler(err, 500);
    }
};