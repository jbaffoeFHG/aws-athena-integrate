const DynamoDBClient = require('common-lib/db/dynamo-db-client');
const {AccessKey} = require('../model/access-key-model');

const VAL_PLACE_HOLDER = "$VAL"
const PK_PREFIX = `customer`;
const SK_PREFIX = `id#${VAL_PLACE_HOLDER}`;

class AccessKeyDao {

    constructor() {
        this._dynamoDBClient = new DynamoDBClient({table: process.env.DYNAMO_DB_TABLE});
    }

    async getAll() {
        return await this._dynamoDBClient.findAllByPK(this._getPk());
    }

    async getByCustomerId(customerId) {
        const response = await this._dynamoDBClient.findByPKAndSK(this._getPk(), this._getSK(customerId));
        if (response.length > 0) {
            return response[0];
        } else {
            return null;
        }
    }

    async save(request) {
        const dbRequest = new AccessKey(request);
        await this._dynamoDBClient.save(
            this._getPk(),
            this._getSK(dbRequest.customerId),
            dbRequest)
        return dbRequest;
    }

    async delete(customerId) {
        return await this._dynamoDBClient.deleteByPKAndSK(
            this._getPk(),
            this._getSK(customerId));
    }

    _getPk() {
        return PK_PREFIX;
    }

    _getSK(customerId) {
        return SK_PREFIX
            .replace(VAL_PLACE_HOLDER, customerId);
    }
}

module.exports = AccessKeyDao;