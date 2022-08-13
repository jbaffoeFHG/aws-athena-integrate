const {
    sendError,
    sendResponse,
    getRequestBody,
    getQueryStringParameters,
    sendGeneralMessage
} = require("common-lib/utils/http-utils");
const { requiredFieldsCheck } = require("common-lib/utils/object-utils");
const AccessKeyService = require("./service/access-key-service");
const { InvalidError, ValidationError } = require('common-lib/exception');

const service = new AccessKeyService();

exports.handler = async function (event, context) {
    console.log("event", JSON.stringify(event));
    try {
        const httpMethod = event.httpMethod;
        const pathParameters = event.pathParameters;
        if (httpMethod === "GET") {
            return sendResponse(await service.getAll());
        } else if (httpMethod === "POST") {
            const requestBody = getRequestBody(event);
            const request = {...requestBody, ...pathParameters};
            const check = requiredFieldsCheck(request, ['customerId']);
            if (!check.valid) {
                throw new ValidationError(check);
            }
            const accessKey = await service.create(request);
            return sendResponse({accessKey});
        } else if (httpMethod === "DELETE") {
            const check = requiredFieldsCheck(pathParameters, ['customerId']);
            if (!check.valid) {
                throw new ValidationError(check);
            }

            await service.delete(pathParameters);
            return sendGeneralMessage("deleted");
        } {
            throw new InvalidError(`invalid route`);
        }
    } catch (err) {
        console.error('handler execution failed', err);
        return sendError(err.message, err.code);
    }
}