const {
    sendError,
    sendResponse,
    getRequestBody,
    getPathParams,
    sendGeneralMessage
} = require("common-lib/utils/http-utils");
const {
    preparePaginationRequest
} = require("common-lib/utils/pagination-utils");
const { InvalidError } = require('common-lib/exception');
const { AthenaClient, StartQueryExecutionCommand }  = require("@aws-sdk/client-athena"); //
const RESOURCE_PATH = '/athena';

const athenaClient = new AthenaClient();

exports.handler = async function (event, context) {
    console.log("event", JSON.stringify(event));
    try {
        const resourcePath = event.resource;
        const httpMethod = event.httpMethod;

        if (httpMethod === "POST") {
            const request = getRequestBody(event);
            const command = new StartQueryExecutionCommand({
                QueryString: request.queryString,
                QueryExecutionContext: {
                    Catalog: request.catalog,
                    Database: request.database
                },
                ResultConfiguration: {
                    OutputLocation: request.outputLocation
                }
            });
            const response = await athenaClient.send(command);
            console.log("RESPONSE", response);
            return sendResponse({'queryExecutionId': response.QueryExecutionId});

        } else {
            throw new InvalidError(`invalid route ${resourcePath}:${httpMethod}`);
        }
    } catch (err) {
        console.error('handler execution failed', err);
        return sendError(err.message, err.code);
    }
}