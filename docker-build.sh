#!/bin/sh -eux
export PATH="/app/node_modules/.bin:$PATH"
if [ "${APP}" = "trading" ]; then
  yarn nx export ${APP} --network-timeout 100000 --pure-lockfile
  mv /app/dist/apps/trading/exported/ /app/tmp
  rm -rf /app/dist/apps/trading
  mv /app/tmp /app/dist/apps/trading
else
  yarn nx build ${APP} --network-timeout 100000 --pure-lockfile
fi
