exports.handler = async function(event, context, callback) {
    const products = [
        {
            id: '1',
            name: 'Product 1',
            price: 100
        },
        {
            id: '2',
            name: 'Product 2',
            price: 200
        },
        {
            id: '3',
            name: 'Product 3',
            price: 300
        }
    ];
    const product_id = event.pathParameters.productId;
    const product = products.find((pro) => {
        return pro.id === product_id;
    }) || null;

    if(product) {
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET",
                "Content-Type": "application/json"
            },
            "body": JSON.stringify(product)
        };
    } else {
        return {
            "statusCode": 404,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET",
                "Content-Type": "application/json"
            },
            "body": JSON.stringify({message: 'Product not found'})
        };
    }

};