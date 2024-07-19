const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const errorHandler = require('./errorHandler');

const client = new S3Client({});

exports.handler = async function(event, context) {
    const file_name = event.queryStringParameters.name;
    const bucket_name = process.env.BUCKET_NAME;
    const key = `uploaded/${file_name}`;
    
    console.log('file_name',file_name);
    console.log('bucket_name',bucket_name);
    console.log('key',key);

    if (!file_name) {
        return errorHandler({message: 'File should be provided!'}, 400);
    }

    const params = {
        Bucket: bucket_name,
        Key: key
    };

    const command = new PutObjectCommand(params);
    
    try {
        const signed_url = await getSignedUrl(client, command, { expiresIn: 360 });
    
        console.log('signed_url created successfully', signed_url);

        return {
            "statusCode": 201,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT",
                "Access-Control-Allow-Credentials": true,
                "Content-Type": "application/json"
            },
            "body": signed_url
        };
    } catch (err) {
        return errorHandler(err, 500);
    }
};