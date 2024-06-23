AWS = require("aws-sdk");
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const errorHandler = require('./errorHandler');

AWS.config.update({ region: "us-east-1" });
const ddbDocClient = new AWS.DynamoDB.DocumentClient();

const schema = Joi.object({
    title: Joi.string()
        .required(),

    description: Joi.string(),

    price: Joi.number()
        .integer()
})

exports.handler = async function(event, context, callback) {
    const productData = event.body;
    
    try {
        const productValidatedData = await schema.validateAsync(productData);

        const idGenerated = uuidv4();
        const paramsP = {
            TableName: "products",
            Item: {
                id: idGenerated,
                title: productValidatedData.title,
                price: productValidatedData.price,
                description: productValidatedData.description,
            }
        };
        const paramsS = {
            TableName: "stocks",
            Item: {
                id: idGenerated,
                count: productValidatedData.count || 0
            },
        };
        const product = await ddbDocClient.put(paramsP).promise();
        const stock = await ddbDocClient.put(paramsS).promise();
        const dataProduct = product.Item || null;
        const dataStock = stock.Item || null;
        
        if(!dataProduct || !dataStock) return errorHandler({message: "Something went wrong"}, 500);
        
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