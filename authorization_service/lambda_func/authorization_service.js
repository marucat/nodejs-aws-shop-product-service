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
        }
      ],
    },
  };

  return authResponse;
};

exports.handler = async function(event, context) {
  console.log('event',event);
  const authorizationHeader = event?.authorizationToken;
  if(!authorizationHeader) {
    const policy = generatePolicy('username', 'Deny', event.methodArn);
    console.log('policy: ', JSON.stringify(policy));
    return policy;
  }

  const encodedCredentials = authorizationHeader.split(' ')[1];
  const decodedCredentials = base64.decode(encodedCredentials);
  let [username, password] = decodedCredentials.split('=');
  password = password.trim();
  const storedPassword = process.env[username];

  if(storedPassword && storedPassword == password) {
    const policy = generatePolicy(username, 'Allow', event.methodArn);
    console.log('policy: ', JSON.stringify(policy));
    return policy;
  } else {
    const policy = generatePolicy(username, 'Deny', event.methodArn);
    console.log("Bad auth", JSON.stringify(policy));
    return policy;
  }
};