exports.handler = async function (event, context, callback) {
    console.time("auth-process");
    console.log("event", JSON.stringify(event));
    try {
        const apiKey = event.headers['apikey'];
        if (process.env.API_KEY === apiKey) {
            const username = 'api';
            callback(null, generatePolicy(username, 'Allow', event.methodArn, { username }));
        } else {
            throw new Error(`invalid apikey ${apiKey}`);
        }

    } catch (err) {
        console.error("token validation failed", err);
        callback(null, generatePolicy(null, 'Deny', event.methodArn, {}));
    }
    console.timeEnd("auth-process");
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