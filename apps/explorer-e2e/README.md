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

1. Refer to the [Vega Capsule readme](https://github.com/vegaprotocol/vegacapsule#readme) for setting up and running Capsule - follow by Pre-start and Quick Start (points 1-2)
2. Bootstrap with auto-installed dependencies including wallet

```bash
vegacapsule network bootstrap --config-path=../frontend-monorepo/vegacapsule/config.hcl --force
```

### Troubleshooting

- You may need to run `vegacapsule nodes unsafe-reset-all` to get a clean network state

### Troubleshooting on the remove server

See this guide at [apps/governance-e2e/README.md](../governance-e2e/README.md)

## Vega Wallet Setup

You can then refer to (or run) `frontend-monorepo/vegacapsule/setup-vegawallet.sh`. This will initialise and configure your wallet to have the correct public keys and network config to run against capsule.

Go to the .env file in `apps/explorer-e2e` and set the `CYPRESS_VEGA_WALLET_API_TOKEN` environment variable by pasting in your wallets long lived api token
