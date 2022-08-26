import * as aws from "@pulumi/aws";
import { LambdaConstructor } from "../../helpers/constructors/lambda-constructor";
import {ProjectConfig} from "../../config/project-config";
import {ACCESS_KEY_SECRET} from "../../consts/common-consts";
import {addToRolePolicy} from "../../helpers/utils/iam-utils";

export default class ApiKeyAuthorizer {
    private readonly _authorizerLambda: aws.lambda.Function;

    constructor() {
        const projectConfig = new ProjectConfig();

        const envVariables: any = {};
        envVariables["AWS_ACCOUNT_ID"] = projectConfig.accountId;
        envVariables[ACCESS_KEY_SECRET] = projectConfig.accessKeyConfig.secret;

        const _authorizerLambdaConstructor = new LambdaConstructor("authfn", {
            handlerPath: "api-key-authorizer",
            envVariables
        });

        this._authorizerLambda = _authorizerLambdaConstructor.lambdaFunc;

        addToRolePolicy("apik-auth-sec", _authorizerLambdaConstructor.role, [
            "secretsmanager:GetSecretValue",
            "secretsmanager:DescribeSecret"
        ], `arn:aws:secretsmanager:*:${projectConfig.accountId}:secret:*`);
    }

    public get authorizerLambda() {
        return this._authorizerLambda;
    }
}
