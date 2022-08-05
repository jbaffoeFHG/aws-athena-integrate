import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import {LambdaAuthorizer} from "@pulumi/awsx/apigateway";

export interface LambdaCreateArgs {
    handlerPath: string; // handle file or handler dir path
    inlinePolicies?: aws.iam.PolicyDocument[];
    handler?: string;
    runtime?: string;
    description?: string,
    roleArn?: pulumi.Input<string>;
    layers?: aws.lambda.LayerVersion[];
    envVariables?: pulumi.Input<{[key: string]: pulumi.Input<string>}>;
    memorySize?: pulumi.Input<number>; // timeout in mb. default 512
    timeout?: pulumi.Input<number>; // timeout in seconds. default 60
    env?: string;
    api?: string;
}

export interface ApiAddEndpointArgs {
    authorizerNone?: boolean;
    customLambdaAuthorizer?: LambdaAuthorizer;
}

export interface EventRuleCreateArgs {
    name: string;
    eventBusName: pulumi.Input<string>;
    description?: string; 
    eventPattern?: pulumi.Input<string>;  
    scheduleExpression?: pulumi.Input<string>; 
    roleArn: pulumi.Input<string>;  
    isEnabled?: pulumi.Input<boolean>;
    targets: EventTargetCreateArgs[];
}

export interface EventRuleAssigneeArgs {
    name: string;
    eventBusName: pulumi.Input<string>;
    isEnabled?: pulumi.Input<boolean>;
    targets: EventTargetCreateArgs[];
}

export interface EventTargetCreateArgs {
    targetId: string;
    targetFunction: aws.lambda.Function;
}