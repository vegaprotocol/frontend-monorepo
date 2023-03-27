#!/bin/bash
set -e

# Recreate config file
env_file=/usr/share/nginx/html/assets/env-config.js
mkdir -p $(dirname $env_file)
rm -rf $env_file || echo "no file to delete"
touch $env_file

env_vars_file=/usr/share/nginx/html/.env
sed -i '/^#/d' $env_vars_file # remove comment lines
sed -i '/^$/d' $env_vars_file # remove empty lines

# Add assignment
echo "window._env_ = {" >> $env_file

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
    echo "  $varname: \"$value\"," >> $env_file
  fi
done < $env_vars_file

rm $env_vars_file

echo "}" >> $env_file

# start serving
nginx -g 'daemon off;'
