#!/usr/bin/env bash
forever stop "burninator"
netstat -tulpn | grep ::30
