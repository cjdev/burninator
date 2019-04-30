#!/usr/bin/env bash

set -e

cd "$(dirname "$0")"

IFS=':' read -a buildfields <<<"${CODEBUILD_BUILD_ID}"
if [ "${buildfields[1]}" == "" ]; then
    echo "artifact id cannot be determined from '${CODEBUILD_BUILD_ID}', using 'local-build'"
    artifactid='local-build'
    localbuild=x
else
    artifactid="${buildfields[1]}"
fi
echo "$artifactid" > artifact-id

if [ "$localbuild" == "" ]; then
  tag="${ECR_REPOSITORY}:artifact-${artifactid}"
  tagl="${ECR_REPOSITORY}:latest"
else
  commitid="$(git rev-parse HEAD)"
  echo "$commitid" > commit-id
  tag="burninator:local-${commitid}-mod"
  tagl="burninator:latest"
fi

env

if [ "$localbuild" == "" ]; then
  npm install
fi

# CI=true npm run test
npm run build

docker build -t "$tag" .
docker tag "$tag" "$tagl"

if [ "$localbuild" == "" ]; then
  eval $(aws ecr get-login --no-include-email --region us-west-1)
  docker push "$tag"
  docker push "$tagl"
fi
