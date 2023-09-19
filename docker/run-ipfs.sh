#!/bin/sh
ipfs config profile apply server
ipfs config --json Addresses.Gateway '"/ip4/127.0.0.1/tcp/80"'
ipfs daemon
