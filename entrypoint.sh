#!/bin/bash

# Recreate config file
mkdir assets
rm -rf /usr/share/nginx/html/assets/env-config.js
touch /usr/share/nginx/html/assets/env-config.js

# Add assignment
echo "window._env_ = {" >> /usr/share/nginx/html/assets/env-config.js

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
    echo "  $varname: \"$value\"," >> /usr/share/nginx/html/assets/env-config.js
  fi
done < .env

echo "}" >> /usr/share/nginx/html/assets/env-config.js

# start serving
nginx -g 'daemon off;'
