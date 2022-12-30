# Vega Explorer E2E tests

To run the UI automation tests with Vega Capsule, run:

```bash
yarn nx run explorer-e2e:e2e
```

To open Cypress and run in interactive mode, run:

```bash
yarn nx run explorer-e2e:e2e --watch
```

## Vega Capsule Setup

The e2e tests run against a locally running instance of the Vega network, managed and controlled by [Vega Capsule](https://github.com/vegaprotocol/vegacapsule). Vega Capsule will:

- Bootstrap and start up a Vega network
- Start up [Ganache](https://trufflesuite.com/ganache/) for a local Ethereum network
- Install the required Vega smart contracts
- Set up DataNodes with a running GraphQL and REST APIs.

Refer to the [Vega Capsule readme](https://github.com/vegaprotocol/vegacapsule#readme) for setting up and running Capsule. You will need [Go 1.19 or later](https://go.dev/doc/install) and [Docker](https://docs.docker.com/get-docker/) installed.

### Troubleshooting

- You may need to run `vegacapsule nodes unsafe-reset-all` to get a clean network state

## Vega Wallet Setup

Start by [downloading the Vega wallet software here](https://github.com/vegaprotocol/vega/releases).

You can then refer to (or run) `vegacapsule/setup-vegawallet.sh`. This will initialise and configure your wallet to have the correct public keys and network config to run against capsule.
