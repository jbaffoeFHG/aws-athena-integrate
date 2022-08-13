import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import {getResourceName} from "./common-utils";
import {Input} from "@pulumi/pulumi";

export function grantLambdaDynamoDBAccess(id: string, lambdaRole: aws.iam.Role, table: aws.dynamodb.Table) {
    const resourceId = getResourceName(id);
    const policy = new aws.iam.Policy(resourceId, {
        policy: pulumi.output({
            Version: "2012-10-17",
            Statement: [{
                Action: [
                    "dynamodb:UpdateItem",
                    "dynamodb:PutItem",
                    "dynamodb:GetItem",
                    "dynamodb:Query",
                    "dynamodb:DescribeTable",
                    "dynamodb:DeleteItem"
                ],
                Resource: "*", // TODO need to add table and table-indexes
                Effect: "Allow",
            }],
        }),
    });
    new aws.iam.RolePolicyAttachment(`${resourceId}-att`, {
        role: lambdaRole,
        policyArn: policy.arn,
    });
}

export function addToRolePolicy(id: string, lambdaRole: aws.iam.Role, actions: string[], resource: Input<string>) {
    const resourceId = getResourceName(id);
    const policy = new aws.iam.Policy(resourceId, {
        policy: pulumi.output({
            Version: "2012-10-17",
            Statement: [{
                Action: actions,
                Resource: [resource],
                Effect: "Allow",
            }],
        }),
    });
    new aws.iam.RolePolicyAttachment(`${resourceId}-att`, {
        role: lambdaRole,
        policyArn: policy.arn,
    });
}