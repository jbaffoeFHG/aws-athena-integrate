import {LambdaConstructor} from "../../helpers/constructors/lambda-constructor";
import ApiGateway from "../api-gateway";
import {ProjectConfig} from "../../config/project-config";
import LambdaLayers from "./lambda-layers";
import * as aws from "@pulumi/aws";
import {ACCESS_KEY_SECRET} from "../../consts/common-consts";
import {addToRolePolicy, grantLambdaDynamoDBAccess} from "../../helpers/utils/iam-utils";

const ENDPOINT_PREFIX = `/access-keys`;
export default class AccessKeyApiStack {
    private readonly projectConfig: ProjectConfig;
    private readonly apiGateway: ApiGateway;

    constructor(apiGateway: ApiGateway, lambdaLayers: LambdaLayers, table: aws.dynamodb.Table) {
        this.apiGateway = apiGateway;
        this.projectConfig = new ProjectConfig();

        const envVariables: any = {};
        envVariables['DYNAMO_DB_TABLE'] = table.name;
        envVariables['ACCESS_KEY_PREFIX'] = this.projectConfig.accessKeyConfig.prefix;
        envVariables[ACCESS_KEY_SECRET] = this.projectConfig.accessKeyConfig.secret;

        const apiFunc = new LambdaConstructor("access-key-api", {
            handlerPath: 'access-key-api',
            envVariables: envVariables,
            layers: lambdaLayers.getDefaultLayers(),
        });
        grantLambdaDynamoDBAccess("access-key-api-db", apiFunc.role, table);
        apiGateway.addEndpoint(apiFunc.lambdaFunc, `${ENDPOINT_PREFIX}`, "GET");
        apiGateway.addEndpoint(apiFunc.lambdaFunc, `${ENDPOINT_PREFIX}`, "POST");
        apiGateway.addEndpoint(apiFunc.lambdaFunc, `${ENDPOINT_PREFIX}/{customerId}`, "DELETE");

        addToRolePolicy("access-key-sec", apiFunc.role, [
            "secretsmanager:GetSecretValue",
            "secretsmanager:DescribeSecret",
            "secretsmanager:PutSecretValue",
            "secretsmanager:CreateSecret",
            "secretsmanager:DeleteSecret"
        ], `arn:aws:secretsmanager:*:${this.projectConfig.accountId}:secret:*`);
    }
}