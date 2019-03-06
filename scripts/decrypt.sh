#!/usr/bin/env bash

set -e

here=$(dirname $0)

plain="$here/../.env"
cipher="$here/../production.env.encrypted"
keystore="$here/../production.env.key"

cat "$cipher"
echo
cat "$keystore"

export AWS_DEFAULT_REGION=us-west-1

< "$keystore" \
    openssl base64 -d | \
    aws kms decrypt \
        --debug \
        --ciphertext-blob fileb:///dev/stdin \
        --query Plaintext \
        --output text | \
    openssl base64 -d | \
    openssl enc -d -a -aes256 -md md5 \
        -pass stdin \
        -in "$cipher" \
        -out "$plain"
