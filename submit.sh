#!/usr/bin/env bash

# Submit sources to pipeline for build and deploy.
# Performs S3 upload without AWS CLI due to Jenkins restrictions

set -e

fileName="master.zip"
s3Bucket='burninator-pipeline-sourcestore-1twv0baie2nlz'

echo "Creating ${fileName} for upload to ${s3Bucket} ..."

cd "$(dirname "$0")"

echo "In directory ${PWD} ..." 1>&2

echo "$(git rev-parse HEAD)" > commit-id

echo "Wrote commit id"

rm -rf ./build
rm -rf ./node_modules

echo "Removed unneeded dirs ..." 1>&2

rm -f "$fileName"

echo "Removed previous artifact ..." 1>&2

zip "$fileName"  -r9 * .babelrc .eslintrc

echo "Zipped sources ..." 1>&2

# do it this way because getting consistent AWS CLI on our Jenkins is gnarly
date=`date +%Y%m%d`
dateFormatted=`date -R`
relativePath="/${s3Bucket}/${fileName}"
contentType="application/octet-stream"
stringToSign="PUT\n\n${contentType}\n${dateFormatted}\n${relativePath}"
signature=`echo -en ${stringToSign} | openssl sha1 -hmac "${AWS_SECRET_ACCESS_KEY}" -binary | base64`
curl -X PUT -L -T "${fileName}" \
    -H "Host: ${s3Bucket}.s3.amazonaws.com" \
    -H "Date: ${dateFormatted}" \
    -H "Content-Type: ${contentType}" \
    -H "Authorization: AWS ${AWS_ACCESS_KEY_ID}:${signature}" \
    http://${s3Bucket}.s3.amazonaws.com/${fileName}


echo "Uploaded sources ..." 1>&2

# here's how you would do it with AWs CLI
# aws s3 cp master.zip s3://${s3Bucket}/


