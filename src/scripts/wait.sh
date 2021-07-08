#!/bin/bash

# NOTE: This script is used to ensure database is ready before running tests (see ci.yml)

WAIT_SLEEP=${WAIT_SLEEP:-1}
WAIT_COUNT=${WAIT_COUNT:-30}
WAIT_DEBUG=${WAIT_DEBUG:-0}

for ((i = 0; i < $WAIT_COUNT; i++)); do
  if [ $i != 0 ]; then
    sleep $WAIT_SLEEP
  fi
  if [ $WAIT_DEBUG == 0 ]; then
    ${@} >/dev/null 2>&1
  else
    echo "[wait.sh:$i] ${@}"
    ${@}
  fi
  if [ $? == 0 ]; then
    exit 0
  fi
done

exit 1
