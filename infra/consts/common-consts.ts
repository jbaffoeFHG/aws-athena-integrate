// lambda
export const LAMBDA_HANDLER = 'index.handler';
export const LAMBDA_HANDLERS_LOCATION = process.env.LAMBDA_HANDLERS_LOCATION || '../src';
export const LAMBDA_LAYERS_LOCATION = './app/lambda/layers';
export const LAMBDA_NODEJS_14_RUNTIME = 'nodejs14.x';
export const LAMBDA_DEFAULT_RUNTIME = LAMBDA_NODEJS_14_RUNTIME;
export const LAMBDA_DEFAULT_MEMORY_SIZE = 512;
export const LAMBDA_DEFAULT_TIMEOUT = 60;

// env
export const DYNAMO_DB_TABLE_ENV = 'DYNAMO_DB_TABLE';
export const AUTHORIZER_API_FUNC = 'AUTHORIZER_API_FUNC';
export const ROLES_API_FUNC = 'ROLES_API_FUNC';
export const USERS_API_FUNC = 'USERS_API_FUNC';
export const CONSUMER_USER_POOL_ID = 'CONSUMER_USER_POOL_ID';
export const ACCESS_KEY_SECRET = 'ACCESS_KEY_SECRET';