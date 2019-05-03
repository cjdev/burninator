#!/usr/bin/env bash

set -e

cd "$(dirname "${0}")/.."
tar -czvf data.tgz data
aws s3 cp data.tgz s3://${BACKUP_BUCKET}/burninator/
