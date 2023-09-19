# Deposit

The Vega network has no native assets. All settlement assets exist on another chain and are "bridged" to Vega in one way or another.

In the case of [ERC20 tokens](https://ethereum.org/en/developers/docs/standards/tokens/erc-20/) there is a smart contract on the Ethereum network that acts as a vault (aka bridge) for the tokens that are deposited to Vega. The Vega network then reads the information from this vault about what Vega key to credit these tokens to. While in the Vault the Vega key that owns them (and consequently the ethereum key) may change. The vault then manages how much each ethereum key is able to withdraw from the vault given then changes in ownership that may have happened on Vega. The keys to this vault and managed by the different nodes that make up the Vega network. They verify the the appropriate amounts can be withdrawn by each Ethereum key. At time of writing only ERC20 tokens have been implemented but the pattern is likely the same for other assets/networks.

## ERC20 deposits

Note: ERC20 assets require an approval transaction to be finalised before funds can be credited to another key. Read more about approvals [link 1](https://medium.com/ethex-market/erc20-approve-allow-explained-88d6de921ce9), [link 2](https://hackernoon.com/erc20-infinite-approval-a-battle-between-convenience-and-security-lk60350r).

When making to deposit ERC20 assets to an Vega key, I...

- **should** be able to follow a link from an asset (e.g. on a market page) to the deposit form pre-populated with the given asset
- **must** see a link to [connect an ethereum wallet](0004-EWAL-connect_ethereum_wallet.md) that I want to deposit from (<a name="1001-DEPO-001" href="#1001-DEPO-001">1001-DEPO-001</a>)
- **must** select the [asset](9001-DATA-data_display.md#asset) that I want to deposit (<a name="1001-DEPO-002" href="#1001-DEPO-002">1001-DEPO-002</a>)
  - **should** easily see the assets that I have a non-zero balance for (in the connected eth wallet)
  - **should** see the ERC20 token address of the asset
  - **should** see the [Vega asset symbol](9001-DATA-data_display.md#asset-symbol)
  - **should** see the [Vega asset name](9001-DATA-data_display.md#asset-name)
- **must** select the [amount of the asset](9001-DATA-data_display.md#asset-balances) that I want to deposit (<a name="1001-DEPO-003" href="#1001-DEPO-003">1001-DEPO-003</a>)
  - **should** see an ability to populate the input with the full balance in the connected wallet
  - **must** be warned if the amount being deposited is greater than the balance of the token in the connected Eth wallet (<a name="1001-DEPO-004" href="#1001-DEPO-004">1001-DEPO-004</a>)
- **must** select the [Vega key](9001-DATA-data_display.md#public-keys) that I wish to deposit to (<a name="1001-DEPO-005" href="#1001-DEPO-005">1001-DEPO-005</a>)
  - **should** be able to [connect to a Vega wallet and select a key](0002-WCON-connect_vega_wallet.md#select-and-switch-keys)
  - **should** be easily (if not automatically) pre-populated with a [currently connected and active Vega key](0002-WCON-connect_vega_wallet.md#select-and-switch-keys)
  - **should** be able to input a Vega key other than one I am connected with (even without being connected)
  - if approved amount is less than deposit:
    - **must** see that an approval is needed and be prompted to approve more (<a name="1001-DEPO-006" href="#1001-DEPO-006">1001-DEPO-006</a>)
    - **should** see the approved [asset amount](9001-DATA-data_display.md#asset-balances)
    - **should** be able to input an amount to approve
    - **must** [submit eth transaction to approve](0005-ETXN-submit_ethereum_transaction.md) (<a name="1001-DEPO-007" href="#1001-DEPO-007">1001-DEPO-007</a>)
    - **must** see feedback for the approve transaction
  - if approved amount is more than deposit amount:
    - **could** see the approved [asset amount](9001-DATA-data_display.md#asset-balances)
    - **could** set a submit a new [eth transaction to approve more or less](0005-ETXN-submit_ethereum_transaction.md)
    - **must** submit the Deposit [eth transaction](0005-ETXN-submit_ethereum_transaction.md) (<a name="1001-DEPO-008" href="#1001-DEPO-008">1001-DEPO-008</a>)
    - **must** see feedback on the deposit [ETH transaction](0003-WTXN-submit_vega_transaction.md) (<a name="1001-DEPO-009" href="#1001-DEPO-009">1001-DEPO-009</a>)
    - **must** see feedback that the deposit has or has not been credited to the Vega key (<a name="1001-DEPO-010" href="#1001-DEPO-010">1001-DEPO-010</a>)

...so that my Vega key can use these assets on Vega

### Deposit page

- Visiting the page with a query param `?assetId=XYZ` should load the page with that asset selected if that asset exists (<a name="1001-DEPO-011" href="#1001-DEPO-011">1001-DEPO-011</a>)
