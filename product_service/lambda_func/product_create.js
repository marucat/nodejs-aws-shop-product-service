AWS = require("aws-sdk");
const { randomUUID } = require('crypto');
const errorHandler = require('./errorHandler');

AWS.config.update({ region: "us-east-1" });
const ddbDocClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async function(event, context, callback) {
    const productData = event.body;

    console.log('Create product with the following data: ', JSON.stringify(productData));
    
    try {
        if(
            !(
                typeof productData?.title === 'string'
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
            return errorHandler({message: "Check your input properly"}, 400);
        }

        const idGenerated = randomUUID();
        const addedProduct = {
            id: idGenerated,
            title: productData.title,
            price: productData.price,
            description: productData.description,
        };
        const addedStock = {
            id: idGenerated,
            count: productData.count || 0
        };
        const paramsP = {
            TableName: "products",
            Item: addedProduct
        };
        const paramsS = {
            TableName: "stocks",
            Item: addedStock
        };
        await ddbDocClient.put(paramsP).promise();
        await ddbDocClient.put(paramsS).promise();
        
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET",
                "Content-Type": "application/json"
            },
            "body": JSON.stringify({
                ...addedProduct,
                ...addedStock,
            })
        };
    } catch (err) {
        return errorHandler(err, 500);
    }
};