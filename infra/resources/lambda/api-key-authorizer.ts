import * as aws from "@pulumi/aws";
import { LambdaConstructor } from "../../helpers/constructors/lambda-constructor";
import Cognito from "../cognito";
import {ProjectConfig} from "../../config/project-config";

export default class ApiKeyAuthorizer {
    private readonly _authorizerLambda: aws.lambda.Function;

    constructor() {
        const projectConfig = new ProjectConfig();

        const envVariables: any = {};
        envVariables["API_KEY"] = '98da1233-c2c5-4abf-9956-13952c47e204';

        this._authorizerLambda = new LambdaConstructor("apik-authorizer", {
            handlerPath: "api-key-authorizer",
            envVariables
        }).lambdaFunc;
    }

    public get authorizerLambda() {
        return this._authorizerLambda;
    }
}