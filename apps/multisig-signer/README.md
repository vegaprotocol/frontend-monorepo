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

For convenience, you can boot the app injecting one of the configurations above by running:

```bash
yarn env-cmd -f .\apps\multisig-signer\.env.{env} yarn nx run multisig-signer:serve # e.g. stagnet1
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
