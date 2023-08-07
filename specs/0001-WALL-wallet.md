# Wallet

A Vega wallet is required to prepare and submit transaction on Vega (place, cancel, orders etc). See the [wallet docs](https://docs.vega.xyz/docs/mainnet/concepts/vega-wallet) for more on how "crypto" wallets work.

A wallet can contain many public/private key pairs. The public part of each key pair is known the [Party](../protocol/0017-PART-party.md) sometimes just referred to as a key or public key.

The primary job(s) of a wallet is to [sign/encrypt transaction](../protocol/0022-AUTH-auth.md) (so the network can be sure they were sent by a given party) and to broadcast these transactions to a node on the network.

## Set up wallet / Restore wallet

When opening the wallet for the first time, I...

- if the wallet sends telemetry/analytics: **must** be prompted to opt into (or stay out of) analytics (<a name="0001-WALL-003" href="#0001-WALL-003">0001-WALL-003</a>)
- I can restore a wallet from a seed phrase (<a name="0001-WALL-004" href="#0001-WALL-004">0001-WALL-004</a>)
- I can create a new wallet (<a name="0001-WALL-005" href="#0001-WALL-005">0001-WALL-005</a>)
  - I can view the back up phrase (<a name="0001-WALL-006" href="#0001-WALL-006">0001-WALL-006</a>)
  - I can see the first key without having to "add key". (i.e. The wallet auto generates the first key from the seed phrase) (<a name="0001-WALL-008" href="#0001-WALL-008">0001-WALL-008</a>)

...so I can sign transactions

## Configure network

When using the wallet on a network, I...

- I can have Mainnet and Fairground (testnet) pre-configured (with Mainnet being the default network) (<a name="0001-WALL-009" href="#0001-WALL-009">0001-WALL-009</a>)
- I can create a new network configuration (<a name="0001-WALL-010" href="#0001-WALL-010">0001-WALL-010</a>)
- I can refine the configuration for existing networks (including the ones that come pre-configured) (<a name="0001-WALL-011" href="#0001-WALL-011">0001-WALL-011</a>)
- I can remove networks (<a name="0001-WALL-013" href="#0001-WALL-013">0001-WALL-013</a>)

...so I can broadcast transactions to, and read information from a vega network in my wallet

## Update wallet

When using an older version of a Vega wallet than the current official release, I...

- I am warned if the version I am using is not compatible with the version of Vega on the selected network, and I am given a link to get latest compatible version on github (<a name="0001-WALL-015" href="#0001-WALL-015">0001-WALL-015</a>)

... so the version of the wallet app I am using works with the network I am using

## Log in to a wallet

When using a given wallet, I...

- I can select a wallet and enter the passphrase only once per "session" (<a name="0001-WALL-016" href="#0001-WALL-016">0001-WALL-016</a>)

... so that other users of my machine can not use my wallet, and I am not asked to re-enter frequently

## Connecting to Dapps

When a dapp requests use of a wallet, I...

- I am prompted to either select a wallet or dismiss the prompt (<a name="0001-WALL-017" href="#0001-WALL-017">0001-WALL-017</a>)
  - I can select whole wallet (so that new keys are automatically shared) (<a name="0001-WALL-019" href="#0001-WALL-019">0001-WALL-019</a>)
- I can enter wallet passphrase before wallet details are shared (assuming a password has not recently been entered)(<a name="0001-WALL-022" href="#0001-WALL-022">0001-WALL-022</a>)
- I can retrospectively revoke Dapp's access to a Wallet (<a name="0001-WALL-023" href="#0001-WALL-023">0001-WALL-023</a>)

... so that I can control what public keys are shared with a dapp and what dapps can prompt me to sign transactions

## Approving transactions

When a dapp sends a transaction to the wallet for signing and broadcast, I...

- I am prompted to confirm, reject or ignore the transaction (if auto-confirm is not on) (<a name="0001-WALL-024" href="#0001-WALL-024">0001-WALL-024</a>)
- I can see the details of the transaction. See [details of transaction](#transaction-detail). (<a name="0001-WALL-025" href="#0001-WALL-025">0001-WALL-025</a>)

... so I can verify that the transaction being sent is the one I want

## Transaction log

When thinking about a recent or specific transaction, I ...

- I can find a single list of all transactions, completed and ongoing, from all keys and wallets, from my current desktop session and network (<a name="0001-WALL-034" href="#0001-WALL-034">0001-WALL-034</a>)
- I can see transactions that were confirmed by the wallet user (me) (<a name="0001-WALL-035" href="#0001-WALL-035">0001-WALL-035</a>)
- I can see transactions that were rejected by the wallet user (me) (<a name="0001-WALL-036" href="#0001-WALL-036">0001-WALL-036</a>)
- If I switch network, transactions list changes to show the transactions for that network (<a name="0001-WALL-037" href="#0001-WALL-037">0001-WALL-037</a>)
- I can click a transaction in the list to see the transaction details (<a name="0001-WALL-038" href="#0001-WALL-038">0001-WALL-038</a>)
- I can see empty state when there are no transactions for this session (<a name="0001-WALL-039" href="#0001-WALL-039">0001-WALL-039</a>)

... so that I can ensure my wallet is being used appropriately and find transaction I made

## Transaction details

when looking at a specific transaction...

- I can see details of specific transactions I opened (<a name="0001-WALL-041" href="#0001-WALL-041">0001-WALL-041</a>)
- I can find my way to the transaction on block explorer (<a name="0001-WALL-042" href="#0001-WALL-042">0001-WALL-042</a>)
- I can find my way to the complete transaction history for that key on block explorer (<a name="0001-WALL-043" href="#0001-WALL-043">0001-WALL-043</a>)

- I can see [status of broadcasted transactions](0003-WTXN-submit_vega_transaction.md#track-transaction-on-network)

.. so I can find all the information about what has happened with mined and un-mined transactions

## Key management

When using a Vega wallet, I...

- I can create new keys (derived from the source of wallet) (<a name="0001-WALL-052" href="#0001-WALL-052">0001-WALL-052</a>)
- I can see full public key or be able to copy it to clipboard (<a name="0001-WALL-054" href="#0001-WALL-054">0001-WALL-054</a>)
- I can change key name/alias (<a name="0001-WALL-055" href="#0001-WALL-055">0001-WALL-055</a>)

... so I can manage risk (e.g. isolate margin), mitigate the damage of a key being compromised, or use multiple trading strategies

## Taint keys

When protecting myself from use of keys that may be compromised, I..

- I can select a key I wish to taint (<a name="0001-WALL-057" href="#0001-WALL-057">0001-WALL-057</a>)
- I am prompted to enter wallet password to taint key (<a name="0001-WALL-058" href="#0001-WALL-058">0001-WALL-058</a>)
- I can see tainted keys flagged as tainted (<a name="0001-WALL-060" href="#0001-WALL-060">0001-WALL-060</a>)

... so that tainted keys must not be used

When I have accidentally tainted a key I...

- I can select a key to un-taint and be required to enter wallet password (<a name="0001-WALL-061" href="#0001-WALL-061">0001-WALL-061</a>)

...so that I must use the key again

## Manually sign a message

When wishing to use my wallet to sign arbitrary messages, I...

- I can enter content to be signed with key (<a name="0001-WALL-062" href="#0001-WALL-062">0001-WALL-062</a>)
- I can submit/sign the content (<a name="0001-WALL-065" href="#0001-WALL-065">0001-WALL-065</a>)
  - I can [track progress](0003-WTXN-submit_vega_transaction.md#track-transaction-on-network) of broadcast transaction either by being given a hash that I can use in block explorer, or see the transaction status

.. so I can control of the message being signed, and can use the message elsewhere (for example to prove I own a wallet)

## Wallet management

When seeking to reduce risk of compromise I...

- I can create multiple wallets (<a name="0001-WALL-066" href="#0001-WALL-066">0001-WALL-066</a>)
- I can switch between wallets (<a name="0001-WALL-067" href="#0001-WALL-067">0001-WALL-067</a>)
- I can remove a wallet (<a name="0001-WALL-068" href="#0001-WALL-068">0001-WALL-068</a>)
- I can change wallet name (<a name="0001-WALL-069" href="#0001-WALL-069">0001-WALL-069</a>)

... so that I must administrate my wallets
