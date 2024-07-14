AWS = require("aws-sdk");
const errorHandler = require('./errorHandler');

AWS.config.update({ region: "us-east-1" });
const ddbDocClient = new AWS.DynamoDB.DocumentClient();
const snsClient = new AWS.SNS();

exports.handler = async function(event, context, callback) {
    let productsForSns = [];
    const paramsP = {
        TableName: "products",
    };
    const paramsS = {
        TableName: "stocks",
    };
    const snsTopicArn = process.env.SNS_TOPIC_ARN;
    
    try {
        for (const record of event.Records) {
            console.log('record',record);
            let productData = JSON.parse(record.body);
            productData.price = +productData.price || 0;
            productData.count = +productData.count || 0;
            console.log('productData',productData);

            if(
                (
                    typeof productData?.id === 'string'
                    && productData.id.length
                    && typeof productData?.title === 'string'
                    && productData.title.length
                    && (
                        (
                            typeof productData?.description === 'string'
                            && productData.description?.length
                        ) || !productData?.description
                    )
                    && typeof productData?.price === 'number'
                    && productData.price >= 0
                )
            ) {
                productsForSns.push(productData);

                const addedProduct = {
                    id: productData.id,
                    title: productData.title,
                    price: productData.price,
                    description: productData.description,
                };
                const addedStock = {
                    id: productData.id,
                    count: productData.count || 0
                };

                await ddbDocClient.put({
                    ...paramsP,
                    Item: addedProduct
                }).promise();
                await ddbDocClient.put({
                    ...paramsS,
                    Item: addedStock
                }).promise();
            }
        }
        
        console.log('snsTopicArn',snsTopicArn);
        const snsMessage = JSON.stringify({
            default: {
                message: 'Products created successfully',
                products: productsForSns
            }
        });
        console.log('snsMessage',snsMessage);
        return snsClient.publish({
            TopicArn: snsTopicArn,
            Message: snsMessage,
            MessageStructure: 'json'
        }, (err, data) => {
            if(err) {
                console.log('snsMessage publish error',err);
                return errorHandler(err, 500);
            } else {
                console.log('snsMessage publish response',data.MessageId);
                return {
                    "statusCode": 200,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET",
                        "Content-Type": "application/json"
                    },
                    "body": JSON.stringify({
                        message: 'Batch processed successfully'
                    })
                };
            }
        });
    } catch (err) {
        console.log('Error!', err);
        return errorHandler(err, 500);
    }
};