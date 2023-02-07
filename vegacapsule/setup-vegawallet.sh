#!/bin/bash

# Generate api tokens for validator wallets
vega wallet api-token init --home ~/.vegacapsule/testnet/vega/node0 --passphrase-file  ~/.vegacapsule/testnet/vega/node0/vega-wallet-pass.txt
echo "API token for Node 0 wallet"
vega wallet api-token generate --wallet-name created-wallet --tokens-passphrase-file ~/.vegacapsule/testnet/vega/node0/vega-wallet-pass.txt  --wallet-passphrase-file ~/.vegacapsule/testnet/vega/node0/vega-wallet-pass.txt --home ~/.vegacapsule/testnet/vega/node0

# Node 1 wallet
vega wallet api-token init --home ~/.vegacapsule/testnet/vega/node1 --passphrase-file  ~/.vegacapsule/testnet/vega/node1/vega-wallet-pass.txt
echo "API token for Node 1 wallet"
vega wallet api-token generate --wallet-name created-wallet --tokens-passphrase-file ~/.vegacapsule/testnet/vega/node1/vega-wallet-pass.txt  --wallet-passphrase-file ~/.vegacapsule/testnet/vega/node1/vega-wallet-pass.txt --home ~/.vegacapsule/testnet/vega/node1

# Initialise wallet
vega wallet init -f --home ~/.vegacapsule/testnet/wallet

# Import wallet
vega wallet import -w capsule_wallet --recovery-phrase-file ./recovery -p ./passphrase --home ~/.vegacapsule/testnet/wallet

# Generate public key
vega wallet key generate -w capsule_wallet -p ./passphrase --home ~/.vegacapsule/testnet/wallet

# Import network
vega wallet network import --force --from-file ./wallet-config.toml --home ~/.vegacapsule/testnet/wallet

# Initialise api-token
vega wallet api-token init --home ~/.vegacapsule/testnet/wallet --passphrase-file passphrase

# Generate api-token
vega wallet api-token generate --wallet-name capsule_wallet --tokens-passphrase-file passphrase  --wallet-passphrase-file passphrase --home ~/.vegacapsule/testnet/wallet

# Wallet service run
vega wallet service run -n DV --load-tokens --tokens-passphrase-file passphrase --no-version-check --automatic-consent --home ~/.vegacapsule/testnet/wallet
