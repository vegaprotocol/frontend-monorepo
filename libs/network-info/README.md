# network-info

This library was generated with [Nx](https://nx.dev).

## Prerequisites

The environment variables needed to be present for any app consuming this library.

`NX_API_NODE` OR `NX_VEGA_CONFIG_URL` - either the network configuration url or a url to a node to directly connect to

`NX_VEGA_NETWORKS` - JSON object with key-value pairs for environments and their deployed URLs

`NX_GITHUB_FEEDBACK_URL` - the repository's feedback URL to point to

`NX_ETHEREUM_PROVIDER_URL` - the Ethereum provider url

For examples, see Block Explorer's .env files [here](../../apps/explorer)

## Running unit tests

Run `nx test network-info` to execute the unit tests via [Jest](https://jestjs.io).
