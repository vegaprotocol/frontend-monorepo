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
- [Mainnet-mirror](./.env.mainnet-mirror)
- [Devnet](./.env.devnet)
- [Testnet](./.env.testnet)

For convenience, you can boot the app injecting one of the configurations above by running:

```bash
yarn env-cmd -f .\apps\token\.env.{env} yarn nx run token:serve # e.g. stagnet1
```

There are a few different configuration options offered for this app:

The network configuration for the app

| **Flag**                   | **Purpose**                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------- |
| `NX_VEGA_ENV`              | The name of the currently connected vega environment                                                     |
| `NX_VEGA_CONFIG_URL`       | The network configuration for the app                                                                    |
| `NX_VEGA_URL`              | The GraphQL query endpoint of a [Vega data node](https://github.com/vegaprotocol/networks#data-node)     |
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
