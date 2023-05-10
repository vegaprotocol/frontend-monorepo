#!/bin/bash -e
yarn --pure-lockfile
app=${1:-trading}
flags="--env=${2:-mainnet}"
yarn install
if [ "${app}" = "trading" ]; then
  yarn nx export trading $flags
  DIST_LOCATION=dist/apps/trading/exported
else
  yarn nx build ${app} $flags
  DIST_LOCATION=dist/apps/${app}
fi
cp -r $DIST_LOCATION dist-result
