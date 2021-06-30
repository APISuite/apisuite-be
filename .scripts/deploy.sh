#!/usr/bin/env bash

#cmp -s .orig_version .new_version
#CMP=$?
#
#if [ $CMP -eq 0 ]; then
#  exit 0
#fi

PROJECT_DIR="~/apisuite-setup"

echo -e "Running: ./update-apisuite-be.sh"
ssh -o StrictHostKeyChecking=no $SSH_USER@$SSH_HOST "cd $PROJECT_DIR && ./update-apisuite-be.sh"
true