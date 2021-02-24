#!/usr/bin/env bash

PROJECT_DIR="~/apisuite-setup"

ENV=dev

if [ "$CIRCLE_BRANCH" = "staging" ]; then
  ENV=stg
fi

if [ "$CIRCLE_BRANCH" = "production" ]; then
  ENV=prd
fi

ssh -o StrictHostKeyChecking=no $SSH_USER@$SSH_HOST "cd $PROJECT_DIR && ./setup-apisuite.sh ${ENV}"
