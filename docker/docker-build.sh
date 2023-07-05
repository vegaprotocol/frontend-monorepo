#!/bin/bash -ex

export PATH="/app/node_modules/.bin:$PATH"

flags="--network-timeout 100000 --pure-lockfile"
envCmd=""

if [[ ! -z "${ENV_NAME}" ]]; then
  if [[ "${ENV_NAME}" != "ops-vega" ]]; then
    envCmd="envCmd="yarn env-cmd -f ./apps/${APP}/.env.${ENV_NAME}"
  fi
fi

if [ "${APP}" = "trading" ]; then
  $envCmd yarn nx export ${APP} $flags
  mv /app/dist/apps/trading/exported/ /app/tmp
  rm -rf /app/dist/apps/trading
  mv /app/tmp /app/dist/apps/trading
else
  $envCmd yarn nx build ${APP} $flags
fi
