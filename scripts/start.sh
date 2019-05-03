#!/usr/bin/env bash

PWD=$(pwd)

mkdir -p logs

export NODE_OPTIONS="--max-old-space-size=3172"

npm install && \
npm run build && \
forever start \
    --id "burninator" \
    -l "${PWD}/logs/burn.log"  \
    -e "${PWD}/logs/burn.err"  \
    -c "npm run prod"  \
    -a \
    ./

forever list

