# Vega front-end monorepo

The front-end monorepo provides a toolkit for building apps that interact with Vega, as well as the apps themselves.

This repository is managed using [Nx](https://nx.dev).

# 🔎 Applications in this repo

### [Block explorer](https://github.com/vegaprotocol/frontend-monorepo/tree/master/apps/explorer)

The Vega block explorer provides an interface that allows users to search for and see transactions, blocks, parties, assets, markets and more on the Vega chain.

### [Trading UI](https://github.com/vegaprotocol/frontend-monorepo/tree/master/apps/trading)

The trading interface built based on a component toolkit. It will provide a way for participants to interact with markets and provide resources for others to build additional open-source user interfaces.

# 🧱 Libraries in this repo

### [UI toolkit](https://github.com/vegaprotocol/frontend-monorepo/tree/master/libs/ui-toolkit)

The UI toolkit contains a set of components used to build interfaces that can interact with the Vega protocol, and follow the design style of the project.

### [Tailwind CSS config](https://github.com/vegaprotocol/frontend-monorepo/tree/master/libs/tailwindcss-config)

The Tailwind CSS config contains theme that align default config with Vega design system.

# 💻 Develop

### Build

Run `nx build my-app` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

Run `nx serve my-app` for a dev server. Navigate to http://localhost:4200/. The app will automatically reload if you change any of the source files.

### Running tests

Run `nx test my-app` to execute the unit tests with [Jest](https://jestjs.io), or `nx affected:test` to execute just unit tests affected by a change.

Similarly `nx e2e my-app` will execute the end-to-end tests with [Cypress](https://www.cypress.io)., and `nx affected:e2e` will execute just the end-to-end tests affected by a change.

### Further help with Nx

Visit the [Nx Documentation](https://nx.dev/getting-started/intro) to learn more.

# Vegacapsule

## Explorer

Follow the following steps to start using a local network with the Vega Explorer:

1. Prepare vegacapsule. Follow the [Vegacapsule instructions](https://github.com/vegaprotocol/vegacapsule#quick-start)
1. Build the explorer frontend application
1. Start the explorer frontend application with the `.env.vegacapsule` env file
1. Go to [http://localhost:3000](http://localhost:3000) in your browser

# 📑 License

[MIT](./LICENSE)
