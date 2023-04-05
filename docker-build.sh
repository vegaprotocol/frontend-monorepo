#!/bin/bash -ex

export PATH="/app/node_modules/.bin:$PATH"

flags="--network-timeout 100000 --pure-lockfile"

if [[ ! -z "${ENV_NAME}" ]]; then
  flags="--env=${ENV_NAME} $flags"
fi

if [ "${APP}" = "trading" ]; then
  yarn nx export ${APP} $flags
  mv /app/dist/apps/trading/exported/ /app/tmp
  rm -rf /app/dist/apps/trading
  mv /app/tmp /app/dist/apps/trading
else
  yarn nx build ${APP} $flags
fi
