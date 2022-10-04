## Multisig-signer

## Development

First copy the configuration of the application you are starting:

```bash
cp .env.[environment] .env.local
```

Starting the app:

```bash
yarn nx serve multisig-signer
```

### Configuration

Example configurations are provided here:

- [Mainnet](./.env.mainnet)
- [Devnet](./.env.devnet)
- [Capsule](./.env.capsule)
- [Testnet](./.env.testnet)
- [Stagnet3](./.env.stagnet3)

For convenience, you can boot the app injecting one of the configurations above by running:

```bash
yarn nx run multisig-signer:serve --env={env} # e.g. stagnet3
```

There are a few different configuration options offered for this app:

| **Flag** | **Purpose** |
| -------------------------------- | ---------------------------------------------------------------------------------------------------- | --- | |
| `NX_VEGA_URL` | The GraphQl query endpoint of a [Vega data node](https://github.com/vegaprotocol/networks#data-node) |
| `NX_VEGA_ENV` | The name of the currently connected vega environment |

## Testing

To run the minimal set of unit tests, run the following:

```bash
yarn nx test multisig-signer
```
