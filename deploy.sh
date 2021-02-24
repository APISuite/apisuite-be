#!/usr/bin/env bash

PROJECT_DIR="~/apisuite-setup"

ENV=dev

if [ "$CIRCLE_BRANCH" = "staging" ]; then
  ENV=stg
fi

if [ "$CIRCLE_BRANCH" = "production" ]; then
  ENV=prd
fi

echo -e "Running: ./update-apisuite-be.sh $ENV"
ssh -o StrictHostKeyChecking=no $SSH_USER@$SSH_HOST "cd $PROJECT_DIR && ./update-apisuite-be.sh $ENV"
