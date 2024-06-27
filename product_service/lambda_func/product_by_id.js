AWS = require("aws-sdk");
const errorHandler = require('./errorHandler');

AWS.config.update({ region: "us-east-1" });
const ddbDocClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async function(event, context, callback) {
    const product_id = event.pathParameters.productId;

    console.log('Get product by ID: ', product_id);

    const paramsP = {
        TableName: "products",
        Key: {
            id: product_id
        }
    };
    const paramsS = {
        TableName: "stocks",
        Key: {
            id: product_id
        },
    };
    
    try {
        const product = await ddbDocClient.get(paramsP).promise();
        const stock = await ddbDocClient.get(paramsS).promise();
        const dataProduct = product.Item || null;
        const dataStock = stock.Item || null;
        
        if(!dataProduct || !dataStock) return errorHandler({message: "Product not found"});
        
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET",
                "Content-Type": "application/json"
            },
            "body": JSON.stringify({
                ...dataProduct,
                ...dataStock,
            })
        };
    } catch (err) {
        return errorHandler(err, 500);
    }
};