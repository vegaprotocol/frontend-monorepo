# Vega front-end monorepo

The front-end monorepo provides a toolkit for building apps that interact with Vega, as well as the apps themselves.

This repository is managed using [Nx](https://nx.dev).

# 🔎 Applications in this repo

### [Block explorer](./apps/explorer)

The Vega block explorer provides an interface that allows users to search for and see transactions, blocks, parties, assets, markets and more on the Vega chain.

### [Trading UI](./apps/trading)

The trading interface built based on a component toolkit. It will provide a way for participants to interact with markets and provide resources for others to build additional open-source user interfaces.

### [Token](./apps/token)

The utlity dApp for interacting with the Vega token and using its' utility. This includes; delegation, nomination, governance and redemption of tokens.

### [Explorer](./apps/explorer)

The block explorer for the Vega network, showing details of raw chain states and the state of markets on the Vega network.

### [Stats](./apps/stats)

An application for the status of the Vega network. Showing block height and other network activity.

### [Static](./apps/static)

Hosting for static content being shared across apps, for example fonts.

# 🧱 Libraries in this repo

### [UI toolkit](./libs/ui-toolkit)

The UI toolkit contains a set of components used to build interfaces that can interact with the Vega protocol, and follow the design style of the project.
It contains a storybook that can be served with `yarn nx run ui-toolkit:storybook`.

### [Tailwind CSS config](./libs/tailwindcss-config)

The Tailwind CSS config contains theme that align default config with Vega design system.

### [Cypress](./libs/cypress)

For shared Cypress logic, commands and steps.

### [Web3](./libs/web3)

A ulitity library for connecting to the Ethereum network and interacting with Vega Web3 contracts.

### [React Helpers](./libs/react-helpers)

Generic react helpers that can be used across multilpe applications, along with other utilties.

# 💻 Develop

### Set up

Check you have the correct version of Node. You can [install NVM to switch between node versions](https://github.com/nvm-sh/nvm#installing-and-updating). Then `NVM install`.
Before you build you will need to `yarn install` in the root directory.
The repository includes a number of template .env files for different networks. Copy from these to the .env file before `serve` to launch app with different network. You can serve any application with `yarn nx run <name-of-app>:serve`.

### Build

Run `nx build my-app` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

Run `nx serve my-app` for a dev server. Navigate to the port specified in `app/<project-name>/project.json`. The app will automatically reload if you change any of the source files.

### Running tests

Run `yarn nx run <my-app>-e2e:e2e` to execute the e2e tests with [cypress](https://docs.cypress.io/), or `nx affected:e2e` will execute just the end-to-end tests affected by a change. You can use the `--watch` flag to open the cypress tests UI in watch mode, see [cypress executor](https://nx.dev/packages/cypress/executors/cypress) for all CLI flags.

Run `nx test my-app` to execute the unit tests with [Jest](https://jestjs.io), or `nx affected:test` to execute just unit tests affected by a change. You can also use `--watch` with these test to run jest in watch mode, see [Jest executor](https://nx.dev/packages/jest/executors/jest) for all CLI flags.

#### Trading app E2E tests

To run tests locally using your own wallets you can add the following environment variables to `cypress.json`

1. Change `TRADING_TEST_VEGA_WALLET_NAME` to your Vega wallet name
2. Add `TRADING_TEST_VEGA_WALLET_PASSPHRASE` as your wallet passphrase
3. Add `ETH_WALLET_MNEMONIC` as your Ethereum wallet mnemonic

### Formatting

In CI linting, formatting and also run. These checks can be seen in the [CI workflow file](.github/workflows//test.yml).

- To fix linting errors locally run `yarn nx lint --fix`
- To fix formatting errors local run `yarn nx format`
- For either command you may use `--all` to run across the entire repository

### Further help with Nx

Visit the [Nx Documentation](https://nx.dev/getting-started/intro) to learn more.

# Vegacapsule

## Explorer

Follow the following steps to start using a local network with the Vega Explorer:

1. Prepare vegacapsule. Follow the [Vegacapsule instructions](https://github.com/vegaprotocol/vegacapsule#quick-start)
2. Build the explorer frontend application
3. Start the explorer frontend application with the `.env.vegacapsule` env file
4. Go to [http://localhost:3000](http://localhost:3000) in your browser

If you simply want to run Explorer locally, without using a local network:

```bash
cd apps/explorer && cp .env.testnet .env.local
yarn nx run explorer:serve
```

# 📑 License

[MIT](./LICENSE)
