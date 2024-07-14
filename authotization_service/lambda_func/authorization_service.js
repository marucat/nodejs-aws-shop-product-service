const base64 = require('base-64');
const errorHandler = require('./errorHandler');

// Help function to generate an IAM policy
var generatePolicy = function(principalId, effect, resource) {
  // Required output:
  var authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
      var policyDocument = {};
      policyDocument.Version = '2012-10-17'; // default version
      policyDocument.Statement = [];
      var statementOne = {};
      statementOne.Action = 'execute-api:Invoke'; // default action
      statementOne.Effect = effect;
      statementOne.Resource = resource;
      policyDocument.Statement[0] = statementOne;
      authResponse.policyDocument = policyDocument;
  }
  // Optional output with custom properties of the String, Number or Boolean type.
  // authResponse.context = {
  //     "stringKey": "stringval",
  //     "numberKey": 123,
  //     "booleanKey": true
  // };
  return authResponse;
}

exports.handler = async function(event, context) {
  console.log('event',event);
  const authorizationHeader = event?.authorizationToken;
  if(!authorizationHeader) return errorHandler({message: 'Unauthorised'}, 401);

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
    return errorHandler({message: 'Forbidden'}, 403);
  }
};