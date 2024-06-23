exports.handler = async function(event, context, callback) {
    const products = [
        {
            id: '1',
            title: 'Product 1',
            description: 'Product 1 description',
            price: 100,
            count: 5
        },
        {
            id: '2',
            title: 'Product 2',
            description: 'Product 2 description',
            price: 200,
            count: 10
        },
        {
            id: '3',
            title: 'Product 3',
            description: 'Product 3 description',
            price: 300,
            count: 15
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