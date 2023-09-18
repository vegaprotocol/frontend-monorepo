#!/bin/sh

entrypoint="${1:-nginx}"

if [[ "$entrypoint" = "nginx" ]]; then
  nginx -g 'daemon off;'
elif [[ "$entrypoint" = "ipfs" ]]; then
  ipfs config profile apply server
  ipfs config --json Addresses.Gateway '"/ip4/127.0.0.1/tcp/80"'
  ipfs daemon
elif [[ "-c" ]]; then
  shift
  /bin/sh -c "$@"
fi
