#!/usr/bin/env bash

#cmp -s .orig_version .new_version
#CMP=$?
#
#if [ $CMP -eq 0 ]; then
#  exit 0
#fi

echo ${DOCKER_PASS} | docker login --username ${DOCKER_USER} --password-stdin

VERSION=$(cat package.json | grep version | head -1 | awk -F ": " '{ print $2 }' | sed 's/[",]//g')

docker build \
  -t cloudokihub/apisuite-be:$VERSION \
  -t cloudokihub/apisuite-be:latest .

docker push cloudokihub/apisuite-be:$VERSION
docker push cloudokihub/apisuite-be:latest
