const { DB_CONFIG } = require('../config/app-config');
const { PackageCreateRequest } = require('../dto/request-dto');
const DynamoDBClient = require('common-lib/db/dynamo-db-client');
const {
    APP_ID_PLACE_HOLDER} = require('common-lib/consts/dynamo-db-const');
const { createUniqueId } = require('common-lib/utils/object-utils');
const { ResourceNotFoundError } = require('common-lib/exception');
const { Package } = require('../model/package-model');

const ENTITY_PREFIX = 'package'
const VAL_PLACE_HOLDER = `%VAL%`;
const PK = `${ENTITY_PREFIX}#${APP_ID_PLACE_HOLDER}`;
const SK = `${ENTITY_PREFIX}-meta-data#${VAL_PLACE_HOLDER}`;

class PackageDao {
    constructor() {
        this._dynamoDBClient = new DynamoDBClient({table: DB_CONFIG.DYNAMO_DB_TABLE });
    }

    async getById(appId, id) {
        const response = await this._dynamoDBClient.findByPKAndSK(this._getPk(appId), this._getSK(id));
        if (response && response.length > 0) {
            return new Package(response[0]);
        } else {
            throw new ResourceNotFoundError(`app ${appId} package ${id} not found`);
        }
    }

    async getAllByAppId(appId, pageRequest) {
        return await this._dynamoDBClient.findAllByPK(this._getPk(appId), pageRequest);
    }

    async create(request) {
        const dbRequest = new PackageCreateRequest(request);
        dbRequest.id = createUniqueId();
        await this._dynamoDBClient.create(
            this._getPk(dbRequest.appId),
            this._getSK(dbRequest.id),
            dbRequest)
        return dbRequest;
    }

    async update(request) {
        const dbRequest = new PackageCreateRequest(request);
        const savedProject = await this.getById(dbRequest.appId, dbRequest.id);
        const newData = {
            ...savedProject,
            ...dbRequest
        };
        await this._dynamoDBClient.update(
            savedProject.pk,
            savedProject.sk,
            newData)
    }

    async delete(appId, id) {
        const savedProject = await this.getById(appId, id);
        await this._dynamoDBClient.deleteByPKAndSK(
            savedProject.pk,
            savedProject.sk)
    }

    _getPk(appId) {
        return PK.replace(APP_ID_PLACE_HOLDER, appId);
    }

    _getSK(id) {
        return SK.replace(VAL_PLACE_HOLDER, id);
    }
}

module.exports = PackageDao;