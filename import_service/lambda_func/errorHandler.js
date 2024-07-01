const errorHandler = (err, status) => {
    return {
        "statusCode": status || 404,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Content-Type": "application/json"
        },
        "body": JSON.stringify(err)
    };
}

module.exports = errorHandler;