# User interface acceptance criteria

This folder contains descriptions of things that users do when interacting with Vega. The information they need and why they are doing them. These can be referenced in testing and used as input for building new interfaces.

The acceptance criteria are organized into files, with each file representing a high level user task. These have been listed with the most "upstream" being first, and grouped into similar tasks.

Each file contains blocks that relate to a low level user task. The block states what the user is trying to do or the context they are in, has a bullet for each thing they need, then states why they are doing it...

> When doing a thing, I...
>
> - **must** be able to see some particular number [0000-CODE-000] ...so I can decide if I want to continue.

Each bullet is worded so that it contains a **must**, **should**, **could**, or **would like to**. This gives app developers some indication of the priority of user needs. At the end of each bullet is a code that can be referenced in tests etc.

These acceptance criteria are not final or intended to be "the truth" but a useful tool, they will be improved over time as more people feedback on using Vega.

A user is normally interacting with at least 2 applications when doing tasks on Vega, A **Dapp** or interface designed to help users complete specific tasks and a **Wallet** that is only used to authenticate a user's actions and broadcast them to the network.

## `0000` Wallets, signing transactions and network selection

- `0001-WALL` [Get and use a Vega wallet](0001-WALL-wallet.md) (This mostly relates to use of a wallet app, for cryptography and broadcast to network)

These files contain generic user needs for interacting with wallets that are true for all types of interactions that require a wallet. More specific requirements are mentioned where these are referenced. They describe what the user needs from the dapp not the wallet.

- `0002-WCON` [Connect Vega wallet to a Dapp & select keys](0002-WCON-connect_vega_wallet.md)
- `0003-WTXN` [Submit Vega transaction](0003-WTXN-submit_vega_transaction.md)
- `0004-EWAL` [Connect Ethereum wallet to a Dapp](0004-EWAL-connect_ethereum_wallet.md)
- `0005-ETXN` [Submit Ethereum transaction](0005-ETXN-submit_ethereum_transaction.md)
- `0006-NETW` [Network and node selection](0006-NETW-network-and-nodes.md)

## `1000` Bridges, Transfers and Vesting

- `1001-DEPO` [Deposit](1001-DEPO-desposit.md)
- `1002-WITH` [Withdraw](1002-WITH-withdraw.md)
- `1003-TRAN` [Transfer](1003-TRAN-transfer.md)
- `1004-ASSO` [Associate governance token with a Vega key](1004-ASSO-associate.md)
- `1005-VEST` [View and redeem vested tokens](1005-VEST-vesting.md)

## `1101` Browser Wallet

The specs no longer exist in this repo and can be found [here](https://github.com/vegaprotocol/vegawallet-browser/tree/main/specs)

## `2000` Staking

- `2001-STKE` [Staking validators](2001-STKE-staking.md)
- `2002-SINC` [Review staking income](2002-SINC-staking-income.md)

## `3000` Governance

- `3001-VOTE` [See proposals and Vote on changes](3001-VOTE-vote.md)
- `3002-PROP` [Select proposal type](3002-PROP-propose.md)
- `3003-PMAN` [Propose new Market](3003-PMAN-propose_new_market.md)
- `3004-PMAC` [Propose change(s) to market](3004-PMAC-propose_market_change.md)
- `3005-PASN` [Propose new asset](3005-PASN-propose_new_asset.md)
- `3006-PASC` [Propose change(s) to asset](3006-PASC-propose_asset_change.md)
- `3007-PNEC` [Propose change to network parameter(s)](3007-PNEC-propose_network.md)
- `3008-PFRO` [Propose something "Freeform"](3008-PFRO-propose_freeform.md)

## `4000` Treasury

- `4001-TRES` [View treasury rewards](4001-TRES-view_treasury_rewards.md) `TODO`

## `5000` Liquidity provision

- `5001-LIQF` [Find and understand liquidity provision opportunities](5001-LIQF-liquidity_opportunities.md) `TODO`
- `5002-LIQP` [Provide liquidity](5002-LIQP-provide_liquidity.md) `TODO`
- `5003-LIQI` [View liquidity provision rewards](5003-LIQI-liquidity_income.md) `TODO`

## `6000` Markets and analysis

- `6001-MARK` [Find markets](6001-MARK-find_markets.md)
- `6002-MARD` [View market specification](6002-MDET-market-details.md) `TODO`
- `6003-ORDB` [Analyze Order book](6003-ORDB-order_book.md) `TODO`
- `6004-PHIS` [Analyze price history](6004-PHIS-price_history.md) `TODO`
- `6005-THIS` [Analyze trade history](6005-THIS-trade_history.md) `TODO`
- `6006-DEPC` [View depth chart](6006-DEPC-chart.md)
- `6007-CHAR` [View chart](6007-CHAR-chart.md)

## `7000` Collateral, Orders, Positions and Fills

- `7001-COLL` [View my collateral / accounts](7001-COLL-collateral.md)
- `7002-SORD` [Submit an order](7002-SORD-submit_orders.md)
- `7003-MORD` [Manage my orders](7003-MORD-manage_orders.md)
- `7004-POSI` [View my positions](7004-POSI-positions.md) `TODO`
- `7005-FILL` [View my trades/fills](7005-FILL-fills.md)
- `7006-FEES` [View my trading fees](7006-FEES-fees.md) `TODO`

## `8000` Understand transactions and blocks

- `8001-BLOX` [Transaction and block content](8001-BLOX-transaction_and_blocks.md) `TODO`
-

## Appendixes

- [Display display rules](9001-DATA-data_display.md)
