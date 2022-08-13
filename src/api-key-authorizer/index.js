const {
    SecretsManagerClient,
    GetSecretValueCommand
} = require("@aws-sdk/client-secrets-manager");
const jwt = require('jsonwebtoken');

const secretsManagerClient = new SecretsManagerClient();
exports.handler = async function (event, context, callback) {
    console.log("event", event);
    console.log("context", context);

    try {
        const token = event.headers['apikey'];
        const claims = jwt.verify(token, process.env.ACCESS_KEY_SECRET);;
        const { customerId, ref, key } = claims;

        const secretArn = `arn:aws:secretsmanager:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:secret:${ref}`;
        const command = new GetSecretValueCommand({ SecretId: secretArn});
        const { SecretString } = await secretsManagerClient.send(command);
        if (SecretString === key) {
            callback(null, generatePolicy(customerId, 'Allow', event.methodArn, { customerId }));
        } else {
            callback(null, generatePolicy(null, 'Deny', event.methodArn, {}));
        }
    } catch(err) {
        console.error("token validation failed", err);
        callback("Error: Invalid token");
    }
};

const generatePolicy = function (principalId, effect, resource, claims) {
    const authResponse = {};

    authResponse.principalId = principalId;
    if (effect && resource) {
        const policyDocument = {};
        policyDocument.Version = '2012-10-17';
        policyDocument.Statement = [];
        const statementOne = {};
        statementOne.Action = 'execute-api:Invoke';
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }

    authResponse.context = claims;
    return authResponse;
}