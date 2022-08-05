import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import {getResourceName} from "../helpers/utils/common-utils";
import {ProjectConfig} from "../config/project-config";
import { ApiAddEndpointArgs } from "../types/aws-resources";
import Authorizer from "./lambda/authorizer";

export default class ApiGateway {
    private readonly projectConfig: ProjectConfig;
    private readonly routes: awsx.apigateway.Route[] = [];
    private readonly lambdaAuthorizer: awsx.apigateway.LambdaAuthorizer;
    
    constructor(authorizer: Authorizer) {
        this.projectConfig = new ProjectConfig();
        this.lambdaAuthorizer = awsx.apigateway.getRequestLambdaAuthorizer({
            authorizerName: getResourceName('authorizer'),
            handler: authorizer.authorizerLambda,
            headers: ['Authorization'],
            authorizerResultTtlInSeconds: 0 // disable cache
        });
        this.setupOptionEndpoint()
    }

    public addEndpoint(
        lambda: aws.lambda.Function, 
        path: string, 
        method: awsx.apigateway.Method, 
        args: ApiAddEndpointArgs = {}) {
        const authorizers = args.authorizerNone? []: (args.customLambdaAuthorizer? [args.customLambdaAuthorizer]: this.lambdaAuthorizer);
        this.routes.push({
            path,
            method,
            authorizers,
            eventHandler: lambda,
        })
    }

    public deploy() {
        const api = new awsx.apigateway.API(getResourceName('rest-api'), {
            routes: this.routes,
            stageName: this.projectConfig.env,
            deploymentArgs: { stageDescription: this.projectConfig.env }
        });
        api.stage.invokeUrl.apply(invokeUrl=>console.log(`APIGateway InvokeUrl => ${invokeUrl}`))

        new aws.apigateway.Response(getResourceName('access-denied-response'), {
            restApiId: api.restAPI.id,
            statusCode: "403",
            responseType: "ACCESS_DENIED",
            responseTemplates: {
                "application/json": `{"message":$context.error.messageString}`,
            },
            responseParameters: {
                "gatewayresponse.header.Authorization": "'Basic'",
            },
        });

        // TODO dont have domain yet
        // const { domain, domainCertArn, hostedZoneId } = this.projectConfig.apigatewayRouteConfig;
        // const apiDomainName = new aws.apigateway.DomainName(getResourceName('domain-name'), {
        //     certificateArn: domainCertArn,
        //     domainName: domain,
        // });
        //
        // new aws.route53.Record(domain, {
        //     zoneId: hostedZoneId,
        //     name: domain,
        //     type: "A",
        //     aliases: [
        //         {
        //             name: apiDomainName.cloudfrontDomainName,
        //             zoneId: apiDomainName.cloudfrontZoneId,
        //             evaluateTargetHealth: true
        //         }
        //     ]
        // });
        //
        // new aws.apigateway.BasePathMapping(
        //     getResourceName('domain-mapping'),
        //     {
        //         restApi: api.restAPI.id,
        //         stageName: api.stage.stageName,
        //         domainName: apiDomainName.domainName,
        //     }
        // );
    }

    private setupOptionEndpoint() {
        const accessControlAllowHeaders = this.projectConfig.apigateway.accessControlAllowHeaders;
        const accessControlAllowOrigin = this.projectConfig.apigateway.accessControlAllowOrigin;
        const accessControlAllowMethods = this.projectConfig.apigateway.accessControlAllowMethods;
        this.routes.push({
            path: "/{proxy+}",
            method: "OPTIONS",
            eventHandler: async (event) => {
                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: 'success' }),
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Headers': accessControlAllowHeaders,
                        'Access-Control-Allow-Origin': accessControlAllowOrigin,
                        'Access-Control-Allow-Methods': accessControlAllowMethods
                    }
                };
            },
        })
    }
}