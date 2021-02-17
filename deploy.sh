#!/usr/bin/env bash

PROJECT_DIR="/apps/apisuite-be"

SSH_HOST=$SSH_HOST_DEV
if [ "$CIRCLE_BRANCH" = "staging" ]; then
  SSH_HOST=$SSH_HOST_STG
fi

scp -o StrictHostKeyChecking=no ./docker-compose.yml $SSH_USER@$SSH_HOST_DEV:$PROJECT_DIR

ssh -o StrictHostKeyChecking=no $SSH_USER@$SSH_HOST_DEV "cd $PROJECT_DIR && docker-compose --env-file .env pull && docker-compose --env-file .env up -d"
