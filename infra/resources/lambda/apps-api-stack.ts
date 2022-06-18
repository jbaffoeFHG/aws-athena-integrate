import {LambdaConstructor} from "../../helpers/constructors/lambda-constructor";
import ApiGateway from "../api-gateway";
import {ProjectConfig} from "../../config/project-config";
import LambdaLayers from "./lambda-layers";
import * as aws from "@pulumi/aws";
import {DYNAMO_DB_TABLE_ENV, AUTHORIZER_API_FUNC} from "../../consts/common-consts";
import {grantLambdaDynamoDBAccess} from "../../helpers/utils/iam-utils";
import {getAuthorizerFuncName} from "../../helpers/utils/auth-utils";

export default class AppsApiStack {
    private readonly projectConfig: ProjectConfig;
    private readonly apiGateway: ApiGateway;

    constructor(apiGateway: ApiGateway, lambdaLayers: LambdaLayers, table: aws.dynamodb.Table) {
        this.apiGateway = apiGateway;
        this.projectConfig = new ProjectConfig();

        const envVariables: any = {};
        envVariables[DYNAMO_DB_TABLE_ENV] = table.name;
        envVariables[AUTHORIZER_API_FUNC] = getAuthorizerFuncName();

        const appsApiFunc = new LambdaConstructor('apps-api', {
            handlerPath: 'apps-api',
            envVariables: envVariables,
            layers: lambdaLayers.getDefaultLayers(),
        });
        grantLambdaDynamoDBAccess("apps-api-db", appsApiFunc.role, table);
        this.apiGateway.addEndpoint(appsApiFunc.lambdaFunc, "/apps", "GET");
        this.apiGateway.addEndpoint(appsApiFunc.lambdaFunc, "/apps/{appId}", "GET");
        this.apiGateway.addEndpoint(appsApiFunc.lambdaFunc, "/apps", "POST");
        this.apiGateway.addEndpoint(appsApiFunc.lambdaFunc, "/apps/{appId}", "PUT");
        this.apiGateway.addEndpoint(appsApiFunc.lambdaFunc, "/apps/{appId}", "DELETE");
    }
}