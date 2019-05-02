#!/usr/bin/env bash

aws --region us-west-1 acm request-certificate \
    --domain-name burninator.cj.dev \
    --subject-alternative-names burninator.tl.cjpowered.com \
    --validation-method DNS
