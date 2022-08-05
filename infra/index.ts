import Authorizer from "./resources/lambda/authorizer";
import ApiGateway from "./resources/api-gateway";
import Cognito from "./resources/cognito";
import Dynamodb from "./resources/dynamodb";
import LambdaLayers from "./resources/lambda/lambda-layers";
import CognitoTriggersStack from "./resources/lambda/cognito-triggers-stack";
import AthenaApiStack from "./resources/lambda/athena-api-stack";
import UsersApiStack from "./resources/lambda/users-api-stack";
import ApiKeyAuthorizer from "./resources/lambda/api-key-authorizer";

const dynamodb = new Dynamodb();
const lambdaLayers = new LambdaLayers();

const cognitoTriggerStack = new CognitoTriggersStack(lambdaLayers, dynamodb.usersApiTable);
const cognito = new Cognito(cognitoTriggerStack);

const authorizerLambda = new Authorizer(cognito);
const apiKeyAuthorizerLambda = new ApiKeyAuthorizer()
const apiGateway = new ApiGateway(authorizerLambda);

new UsersApiStack(apiGateway, lambdaLayers, dynamodb.usersApiTable, cognito.userPool)
new AthenaApiStack(apiGateway, lambdaLayers, apiKeyAuthorizerLambda)

apiGateway.deploy();