const s3 = require('aws-cdk-lib/aws-s3');

const errorHandler = require('./errorHandler');

exports.handler = async function(event, context) {
    try {
        const bucket_name = process.env.BUCKET_NAME;
    
        event.Records.array.forEach(element => {
            const key = record.s3.object.key;
    
            const params = {
                Bucket: bucket_name,
                Key: key
            };
    
            console.log('File rows:');
            s3.getObject(params).createReadStream().on('entry', function (entry) {
                console.log(entry);
            });
    
            const copy_source = { ...params };
            const parsed_key = key.replace('uploaded/','parsed/');
            s3.copyObject({
                CopySource: copy_source,
                Bucket: bucket_name,
                Key: parsed_key
            });

            if(key !== 'uploaded/') {
                s3.deleteObject(params);
            }
        });
    } catch (err) {
        return errorHandler(err, 500);
    }
};