# Vega token website E2E tests

To run the UI automation tests with Vega Capsule, run:

```bash
yarn nx run governance-e2e:e2e
```

To open Cypress and run in interactive mode, run:

```bash
yarn nx run governance-e2e:e2e --watch
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

### Troubleshooting on the remote server

It is sometimes necessary to debug tests on the remote server(e.g: on the CI, etc...). It is very important to SSH into server with the `-X` flag to allow passing the X session(mandatory for the google chrome web UI for the cypress).

Example ssh command is:

```shell
ssh -X <USER>@<IP-OF-THE-SERVER>
```

Steps are the following:

```shell
# cleanup artifacts from previous run
rm -rf /home/<USER>/.vegacapsule/testnet/wallet;

# start new instance of nomad(in new terminal)
sudo pkill -9 nomad; GOBIN=/home/<USER>/go/bin/ vegacapsule nomad;

# switch to node v20
nvm install 20;
nvm use 20;

cd <WORKSPACE>/frontend-monorepo;

# build artifacts
yarn build;

# bootstrap a new network
vegacapsule network bootstrap --config-path ./vegacapsule/config.hcl --force --do-not-stop-on-failure;

# setup vegawallet
cd ./vegacapsule;
chmod a+x setup-vegawallet.sh;
./setup-vegawallet.sh;

# run tests
XDG_RUNTIME_DIR=$PATH:~/.cache/xdgr \
    yarn nx run governance-e2e:e2e  \
        --browser chrome \
        --env.grepTags="@smoke" \
        --verbose \
        --runner-ui \
        --headed \
        --spec "./apps/governance-e2e/src/integration/view/home.cy.ts" \
        --no-exit
```

## Vega Wallet Setup

You can then refer to (or run) `frontend-monorepo/vegacapsule/setup-vegawallet.sh`. This will initialise and configure your wallet to have the correct public keys and network config to run against capsule.

Go to the .env file in `apps/governance-e2e` and set the `CYPRESS_VEGA_WALLET_API_TOKEN` environment variable by pasting in your wallets long lived api token
