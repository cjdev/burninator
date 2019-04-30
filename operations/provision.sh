#!/usr/bin/env bash

set -e

operation() {
    local stack_name="$1"
    aws cloudformation describe-stacks --stack-name "$stack_name" &> /dev/null
    if [ "$?" -eq 0 ]; then
        echo -n update
    else
        echo -n create
    fi
}

provision() {
    local stack_name="$1"
    local config_file="$2"
    local op="$(operation $stack_name)"
    aws cloudformation "${op}-stack" \
        --stack-name $stack_name \
        --template-body "file://${config_file}" \
        --capabilities CAPABILITY_IAM \
    || echo "$stack_name not provisioned: $?" 1>&2
}

cd "$(dirname "$0")"

export AWS_DEFAULT_REGION=us-west-1

# Infrastructure
provision burninator-data cf-data.yaml
provision burninator-repository cf-repository.yaml
provision burninator-config cf-config.yaml
provision burninator-logs cf-logs.yaml
provision burninator-compute cf-compute.yaml
provision burninator-service cf-service.yaml

# Pipeline
provision burninator-pipeline cf-pipeline.yaml

