const s3 = require('aws-cdk-lib/aws-s3');

const errorHandler = require('./errorHandler');

exports.handler = async function(event, context) {
    const file_name = event.queryStringParameters.name;
    const bucket_name = process.env.BUCKET_NAME;
    const key = `uploaded/${file_name}`;

    const params = {
        Bucket: bucket_name,
        Key: key
    };
    
    try {
        const signed_url = s3.generatePresignedUrl('put_objects', params);

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