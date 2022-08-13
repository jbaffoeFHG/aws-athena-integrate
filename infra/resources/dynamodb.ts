import {ProjectConfig} from "../config/project-config";
import * as aws from "@pulumi/aws";
import {getResourceName} from "../helpers/utils/common-utils";
import * as pulumi from "@pulumi/pulumi";
import {input as inputs} from "@pulumi/aws/types";

const PK_FIELD = 'pk';
const SK_FIELD = 'sk';

export default class Dynamodb {
    private readonly _projectConfig: ProjectConfig;
    private readonly _usersApiTable: aws.dynamodb.Table;
    private readonly _accessKeyTable: aws.dynamodb.Table;

    constructor() {
        this._projectConfig = new ProjectConfig();
        this._usersApiTable = this._createTable("users-api", [
            {
                hashKey: 'email',
                rangeKey: PK_FIELD,
                name: "email-userid-index",
                projectionType: "ALL"
            }
            ], [{
                name: 'email',
                type: "S",
        }]);
        this._accessKeyTable = this._createTable("access-key");
    }

    private _createTable(
        tableName: string,
        globalSecondaryIndexes?: pulumi.Input<pulumi.Input<inputs.dynamodb.TableGlobalSecondaryIndex>[]>,
        defineAttributes?: any[]) {
        const name = getResourceName(tableName);
        const attributes: any[] = [{
            name: PK_FIELD,
            type: "S",
        },
            {
                name: SK_FIELD,
                type: "S",
            }
        ];

        if (defineAttributes) {
            attributes.push(...defineAttributes);
        }

        return new aws.dynamodb.Table(name, {
            name,
            billingMode: "PAY_PER_REQUEST",
            hashKey: PK_FIELD,
            rangeKey: SK_FIELD,
            globalSecondaryIndexes,
            attributes,
            // replicas: [
            //     {
            //         regionName: "us-east-2",
            //     },
            //     {
            //         regionName: "us-west-2",
            //     },
            // ],
            //streamEnabled: true,
            //streamViewType: "NEW_AND_OLD_IMAGES",
        });
    }

    public get usersApiTable() {
        return this._usersApiTable;
    }

    public get accessKeyTable() {
        return this._accessKeyTable;
    }
}