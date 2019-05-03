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
    local stack_name="burninator-${1}"
    local config_file="cf-${1}.yaml"
    shift
    if [[ "${1}" != "" ]]; then
        config_file="cf-${1}.yaml"
        shift
    fi

    local op="$(operation $stack_name)"

    local params=()
    if [[ "${1}" != "" ]]; then
        params=(--parameters)
        while [[ "$1" != "" ]]; do
            if [ "$op" == "create" ]; then
                params+=("ParameterKey=${1},ParameterValue=${2}")
            else
                params+=("ParameterKey=${1},UsePreviousValue=true")
            fi
            shift; shift
        done
    fi

    local failed=""
    aws cloudformation "${op}-stack" \
        --stack-name $stack_name \
        --template-body "file://${config_file}" \
        --capabilities CAPABILITY_IAM \
        "${params[@]}" || failed="Y"

    if [ "$failed" == "Y" ]; then
        echo "$stack_name not provisioned" 1>&2
    else
        aws cloudformation wait stack-${op}-complete \
            --stack-name $stack_name
    fi

}

cd "$(dirname "$0")"

export AWS_DEFAULT_REGION=us-west-1
# Infrastructure
provision data
provision repository
provision config
provision logs
provision compute
provision service
provision access

# Pipeline
provision pipeline pipeline GitHubOAuthToken "$1"


