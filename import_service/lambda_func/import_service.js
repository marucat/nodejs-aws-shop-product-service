var S3 = require('aws-sdk/clients/s3');

const errorHandler = require('./errorHandler');

exports.handler = async function(event, context) {
    const file_name = event.queryStringParameters.name;
    const bucket_name = process.env.BUCKET_NAME;
    const key = `uploaded/${file_name}`;
    var s3 = new S3();
    
    console.log('file_name',file_name);
    console.log('bucket_name',bucket_name);
    console.log('key',key);

    const params = {
        Bucket: bucket_name,
        Key: key
    };
    
    try {
        const signed_url = await s3.getSignedUrl('putObject', params).promise();
        console.log('signed_url',signed_url);

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE",
                "Content-Type": "application/json"
            },
            "body": signed_url
        };
    } catch (err) {
        return errorHandler(err, 500);
    }
};