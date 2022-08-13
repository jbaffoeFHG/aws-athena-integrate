const {
    SecretsManagerClient,
    CreateSecretCommand,
    DeleteSecretCommand } = require("@aws-sdk/client-secrets-manager");
const { AccessKeyMetaData } = require("../model/access-key-model");

class AccessKeySecretsManagerService {
    constructor() {
        this.client = new SecretsManagerClient();
    }

    async setup(secretName, secretValue) {
        const secretId = (await this._createSecret(secretName, secretValue)).ARN;
        return new AccessKeyMetaData({
            secretId
        });
    }

    async delete({secretId}) {
        await this._deleteSecret(secretId);
    }

    async _createSecret(secretName, secretValue) {
        const params = {
            Name: secretName,
            SecretString: secretValue
        };
        const command = new CreateSecretCommand(params);
        return await this.client.send(command);
    }

    async _deleteSecret(secretId) {
        const params = {
            SecretId: secretId,
            ForceDeleteWithoutRecovery: true
        };
        const command = new DeleteSecretCommand(params);
        return await this.client.send(command);
    }
}

module.exports = AccessKeySecretsManagerService;