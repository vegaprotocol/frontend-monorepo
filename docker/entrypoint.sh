#!/bin/sh

daemon="${1:-nginx}"

if [[ "$daemon" = "nginx" ]]; then
  nginx -s 'deamon off;'
elif [[ "$daemon" = "ipfs" ]]; then
  ipfs config --json Addresses.Gateway '"/ip4/127.0.0.1/tcp/80"'
  ipfs daemon 
fi
