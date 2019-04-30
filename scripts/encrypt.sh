#!/usr/bin/env bash

here=$(dirname $0)

plain="$here/../.env"
cipher="$here/../production.env.encrypted"
keystore="$here/../production.env.key"

assume-tooling-org() {
    local role="arn:aws:iam::123972995618:role/cjorganization/CJOrganizationAccessRole"

    eval "$(aws --profile cjumb sts assume-role \
    --role-arn "$role" \
    --role-session-name "provision-t$$" \
    --query \
        'Credentials |
            join (`\n`,
            values({
                AccessKeyId: join(``, [`export AWS_ACCESS_KEY_ID=`,AccessKeyId]),
                SecretAccessKey:join(``, [`export AWS_SECRET_ACCESS_KEY=`,SecretAccessKey]),
                SessionToken:join(``, [`export AWS_SESSION_TOKEN=`,SessionToken])
            }))' \
    --output text)"

}

export AWS_DEFAULT_REGION=us-west-1

assume-tooling-org

eval $(aws kms generate-data-key \
    --key-id '32782ec6-4170-4cc8-87fb-8dd668458306' \
    --key-spec 'AES_256' \
    --output text \
    --query \
       'join (`\n`,
           values({
             CiphertextBlob: join(``, [`encryptedkey=`,CiphertextBlob]),
             Plaintext:join(``, [`plainkey=`,Plaintext])
           }))')

echo "$plainkey" | fold -w 64 | \
    openssl base64 -d | \
    openssl enc -e -a -aes256 -md md5 \
        -pass stdin \
        -in "$plain" \
        -out "$cipher"

echo "$encryptedkey" | fold -w 64 > "$keystore"
