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
  commitid="$CODEBUILD_RESOLVED_SOURCE_VERSION"
  echo "$commitid" > commit-id
else
  commitid="$(git rev-parse HEAD)"
  echo "$commitid" > commit-id
  tag="burninator:local-${commitid}-mod"
  tagl="burninator:latest"
fi

if [ -f ".env" ]; then
    echo using exisiting .env
else
    ./scripts/decrypt.sh
    echo using decrypted .env
fi


env

if [ "$localbuild" == "" ]; then
  npm install
fi

# CI=true npm run test
npm run build:aws

docker build -t "$tag" .
docker tag "$tag" "$tagl"

if [ "$localbuild" == "" ]; then
  eval $(aws ecr get-login --no-include-email --region us-west-1)
  docker push "$tag"
  docker push "$tagl"
fi

echo "cluster: $ECS_CLUSTER"
echo "service: $ECS_SERVICE"
aws --region us-west-1 ecs update-service \
    --cluster ${ECS_CLUSTER} \
    --service ${ECS_SERVICE} \
    --force-new-deployment
