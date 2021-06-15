#!/usr/bin/env bash

OUT_FILE=$1

grep -m1 version package.json | awk -F: '{ print $2 }' | sed 's/[", ]//g' > $OUT_FILE