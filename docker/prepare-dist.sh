#!/bin/bash -e
yarn --pure-lockfile
app=${1:-trading}
envCmd="envCmd="yarn env-cmd -f ./apps/${app}/.env.${2:-mainnet}"
yarn install
if [ "${app}" = "trading" ]; then
  $envCmd yarn nx export trading
  DIST_LOCATION=dist/apps/trading/exported
else
  $envCmd yarn nx build ${app}
  DIST_LOCATION=dist/apps/${app}
fi
cp -r $DIST_LOCATION dist-result
