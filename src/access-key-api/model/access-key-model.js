class AccessKeyMetaData {
    constructor({
                    secretId='',
                    // IAM access mode
                    iamUserId='',
                    iamUserName='',
                    iamUserArn='',
                    iamUserPath = '',
                    iamPolicyArn = '',
                }) {
        this.secretId = secretId;
        this.iamUserId = iamUserId;
        this.iamUserName = iamUserName;
        this.iamUserArn = iamUserArn;
        this.iamUserPath = iamUserPath;
        this.iamPolicyArn = iamPolicyArn;
    }
}

class AccessKey {
    constructor({
                    customerId,
                    metadata = new AccessKeyMetaData({}),
                    expire,
                    createdAt,
                }) {
        this.customerId = customerId;
        this.metadata = metadata;
        this.expire = expire;
        this.createdAt = createdAt;
    }
}

module.exports = {
    AccessKey,
    AccessKeyMetaData
};