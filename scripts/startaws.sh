#!/usr/bin/env bash

set -e

config() {
  if [ -f ".env" ]; then
    echo using exisiting .env
  else
    ./scripts/decrypt.sh
    echo using decrypted .env
  fi
}


cd "$(dirname "$0")"

config

npm run prod:aws

