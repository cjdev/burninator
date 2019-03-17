#!/usr/bin/env bash

PWD=$(pwd)

mkdir -p logs

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

