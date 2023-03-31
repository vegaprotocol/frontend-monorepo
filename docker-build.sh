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

env_vars_file=${2:-"/app/dist/apps/${APP}/.env"}
sed -i '/^#/d' $env_vars_file # remove comment lines
sed -i '/^$/d' $env_vars_file # remove empty lines

# Recreate config file
dist_env_file=${3:-"/app/dist/apps/${APP}/assets/env-config.js"}
mkdir -p $(dirname $dist_env_file)
rm -rf $dist_env_file || echo "no file to delete"
touch $dist_env_file


# Add assignment
echo "window._env_ = {" >> $dist_env_file

# Read each line in .env file
# Each line represents key=value pairs
while read -r line || [[ -n "$line" ]];
do
  # Split env variables by character `=`
  if printf '%s\n' "$line" | grep -q -e '='; then
    varname=$(printf '%s\n' "$line" | sed -e 's/=.*//')
    varvalue=$(printf '%s\n' "$line" | sed -e 's/^[^=]*=//')
  fi

  # Read value of current variable if exists as Environment variable
  value=$(printf '%s\n' "${!varname}")
  # Otherwise use value from .env file
  [[ -z $value ]] && value=${varvalue}

  # Append configuration property to JS file if non-empty
  if [ ! -z "$varname" ]; then
    echo "  $varname: \"$value\"," >> $dist_env_file
  fi
done < $env_vars_file

echo "}" >> $dist_env_file

rm $env_vars_file
