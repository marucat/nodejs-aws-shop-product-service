const base64 = require('base-64');

// Help function to generate an IAM policy
const generatePolicy = (
  principalId,
  effect,
  resource
) => {
  const authResponse = {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
        {
          'Effect': 'Allow',
          'Principal': {
              'Service': ['apigateway.amazonaws.com','lambda.amazonaws.com']
          },
          'Action': 'sts:AssumeRole'
        }
      ],
    },
  };

  return authResponse;
};

exports.handler = async function(event, context) {
  console.log('event',event);
  const authorizationHeader = event?.headers?.authorization;
  if(!authorizationHeader) return generatePolicy('username', 'Deny', event.methodArn);

  const encodedCredentials = authorizationHeader.split(' ')[1];
  const decodedCredentials = base64.decode(encodedCredentials);
  let [username, password] = decodedCredentials.split('=');
  password = password.trim();
  const storedPassword = process.env[username];

  if(storedPassword && storedPassword == password) {
    const policy = generatePolicy(username, 'Allow', event.methodArn);
    console.log('policy: ', policy);
    return policy;
  } else {
    console.log("Bad auth");
    return generatePolicy(username, 'Deny', event.methodArn);
  }
};