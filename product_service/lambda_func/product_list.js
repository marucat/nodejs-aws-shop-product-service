AWS = require("aws-sdk");
const errorHandler = require('./errorHandler');
AWS.config.update({ region: "us-east-1" });
const ddbDocClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async function(event, context, callback) {
    const paramsP = {
        TableName: "products",
    };
    const paramsS = {
        TableName: "stocks",
    };
    
    try {
        const products = await ddbDocClient.scan(paramsP).promise();
        const stocks = await ddbDocClient.scan(paramsS).promise();

        if(!products?.Items?.length) return errorHandler({message: "Products not found"});

        let data = [];
        products.Items.forEach(function (product, index, array) {
          const stock = stocks.Items?.find(stockEl => stockEl.id === product.id) || {};
          
          data.push({
              ...product,
              ...stock,
          });
        });
        
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET",
                "Content-Type": "application/json"
            },
            "body": JSON.stringify(data)
        };
    } catch (err) {
        return errorHandler(err, 500);
    }
};