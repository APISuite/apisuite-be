#!/usr/bin/env bash

cmp -s .orig_version .new_version
CMP=$?

if [ $CMP -eq 0 ]; then
  exit 0
fi

echo ${DOCKER_PASS} | docker login --username ${DOCKER_USER} --password-stdin

HASH=$(git rev-parse --short HEAD)

LATEST=latest

if [ "$CIRCLE_BRANCH" = "staging" ]; then
  LATEST=stg-latest
fi

if [ "$CIRCLE_BRANCH" = "develop" ]; then
  LATEST=dev-latest
fi

docker build \
  -t cloudokihub/apisuite-be:$HASH \
  -t cloudokihub/apisuite-be:$LATEST .

docker push cloudokihub/apisuite-be:$HASH
docker push cloudokihub/apisuite-be:$LATEST


if [ "$CIRCLE_BRANCH" = "production" ]; then
  VERSION=$(cat package.json | grep version | head -1 | awk -F ": " '{ print $2 }' | sed 's/[",]//g')

  docker build -t cloudokihub/apisuite-be:$VERSION .
  docker push cloudokihub/apisuite-be:$VERSION
fi
