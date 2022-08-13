const { randomUUID } = require('crypto');
const jwt = require('jsonwebtoken');
const AccessKeyDao = require('../dao/access-key-dao');
const AccessKeySecretsManagerService = require('../service/access-key-secrets-mgr-service');
const {ResourceNotFoundError, InvalidError} = require('common-lib/exception');
const keyPrefix = process.env.ACCESS_KEY_PREFIX;
const keySecret = process.env.ACCESS_KEY_SECRET;

class AccessKeyService {
    constructor() {
        this.dao = new AccessKeyDao();
        this.secretsManagerService = new AccessKeySecretsManagerService();
    }

    async getAll() {
        return await this.dao.getAll();
    }

    async getByCustomerId(customerId) {
        const response = await this.dao.getByCustomerId(customerId);
        if (!response) {
            throw new ResourceNotFoundError(`customerId ${customerId}`);
        }
        return response;
    }

    async create(request) {
        const { customerId } = request;
        if ((await this.dao.getByCustomerId(request.customerId))) {
            // if key-id already exits
            throw new InvalidError(`access-key already exists`)
        }
        const secretName = this.getSecretName(customerId);
        const secretValue = randomUUID();
        request.metadata = await this.secretsManagerService.setup(secretName, secretValue);
        const accessKey = this.createAccesskey(customerId, request.metadata.secretId, secretValue);
        await this.dao.save(request);
        return accessKey;
    }

    async delete(request) {
        const { customerId } = request;
        const savedAccessKey = await this.getByCustomerId(customerId);
        await this.secretsManagerService.delete(savedAccessKey.metadata);
        return await this.dao.delete(customerId);
    }

    getSecretName(customerId) {
        return `${keyPrefix}-${customerId}`;
    }

    createAccesskey(customerId, secretName, secretValue) {
        const ref = secretName.split(":secret:")[1]; // remove aws related info from ARN.
        const accessKey = jwt.sign(
            { customerId, ref, key: secretValue },
            keySecret
        );
        return accessKey;
    }
}

module.exports = AccessKeyService;