#!/bin/bash -e
yarn --pure-lockfile
app=${1:-trading}

envCmd="yarn -f ./apps/${app}/.env.${2:-mainnet}"

yarn install

if [ "${app}" = "trading" ]; then
  # Execute the command stored in envCmd and then run the nx export command
  $envCmd && yarn nx export trading
  DIST_LOCATION=dist/apps/trading/exported/
else
  # Execute the command stored in envCmd and then run the nx build command
  $envCmd && yarn nx build ${app}
  DIST_LOCATION=dist/apps/${app}
fi

cp -r $DIST_LOCATION dist-result
