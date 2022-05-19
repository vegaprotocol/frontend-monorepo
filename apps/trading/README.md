## Trading

## Development

First copy the configuration of the application you are starting:

```bash
cp .env.[environment] .env.local
```

Starting the app:

```bash
yarn nx serve explorer
```

### Configuration

Example configurations are provided here:

- [Mainnet](./.env.mainnet)
- [Devnet](./.env.devnet)
- [Testnet](./.env.testnet)
- [Stagnet1](./.env.stagnet1)
- [Stagnet2](./.env.stagnet2)

For convenience, you can boot the app injecting one of the configurations above by running:

```bash
yarn nx run explorer:serve-{env} # e.g. serve-stagnet1
```

There are a few different configuration options offered for this app:

| **Flag**                   | **Purpose**                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------- |
| `NX_VEGA_ENV`              | The name of the currently connected vega environment                                                     |
| `NX_VEGA_URL`              | The GraphQL query endpoint of a [Vega data node](https://github.com/vegaprotocol/networks#data-node)     |
| `NX_ETHEREUM_CHAIN_ID`     | The ID of the Ethereum chain the currently connected Vega Network uses. E.g. Ropsten (3) for testnet     |
| `NX_ETHEREUM_PROVIDER_URL` | The Ethereum Provider URL for getting data from the Ethereum network, for example Infura or a local node |
| `NX_ETHERSCAN_URL`         | The Etherscan URL to link Ethereum transactions to                                                       |

## Testing

To run the minimal set of unit tests, run the following:

```bash
yarn nx test trading
```

To run the UI automation tests with a mocked API, run:

```bash
yarn nx run trading-e2e:e2e
```
