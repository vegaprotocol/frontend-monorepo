# Collateral

## Collateral Data Grid

- **Must** be shown grouped by [asset](9001-DATA-data_display.md#asset-balances) (<a name="7001-COLL-001" href="#7001-COLL-001">7001-COLL-001</a>)
- For each asset:
  - **Must** show used [amount](9001-DATA-data_display.md#asset-balances), which is the total of all Margin and Liquidity bond accounts (<a name="7001-COLL-002" href="#7001-COLL-002">7001-COLL-002</a>)
  - **Must** show available [amount](9001-DATA-data_display.md#asset-balances), which is the total of your General account (<a name="7001-COLL-003" href="#7001-COLL-003">7001-COLL-003</a>)
  - **Must** show total [amount](9001-DATA-data_display.md#asset-balances), which is the sum of your General account and all Margin accounts (<a name="7001-COLL-004" href="#7001-COLL-004">7001-COLL-004</a>)
  - **Must** show amounts formatted by quantum (<a name="7001-COLL-012" href="#7001-COLL-012">7001-COLL-012</a>)
  - **Must** provide a method for depositing asset (<a name="7001-COLL-005" href="#7001-COLL-005">7001-COLL-005</a>)
  - **Must** provide a method for withdrawing asset (<a name="7001-COLL-006" href="#7001-COLL-006">7001-COLL-006</a>)
  - **Must** show the asset symbol (<a name="7001-COLL-007" href="#7001-COLL-007">7001-COLL-007</a>)
  - **Must** provide a way to see the [full asset details](6501-ASSE-assets.md) (<a name="7001-COLL-008" href="#7001-COLL-008">7001-COLL-008</a>)
  - **Must** provide a way to see all accounts, their type, and their balance for a single asset (<a name="7001-COLL-009" href="#7001-COLL-009">7001-COLL-009</a>)
  - **Could** have default sort order (<a name="7001-COLL-010" href="#7001-COLL-010">7001-COLL-010</a>)
    - General
    - Margin
    - Bond
    - Fees - Maker
    - Fees - Liquidity
    - Rewards - Maker Paid
    - Rewards - Maker Received
    - Rewards - Liquidity Provision Received Fees
    - Rewards - Market Proposers

## Accounts breakdown

- **Must** be able to see a breakdown of accounts for a single asset (<a name="7001-COLL-013" href="#7001-COLL-013">7001-COLL-013</a>)
- **Must** be able to see the total amount of the selected asset (<a name="7001-COLL-014" href="#7001-COLL-014">7001-COLL-014</a>)
- **Must** be able to see market code of margin account (<a name="7001-COLL-015" href="#7001-COLL-015">7001-COLL-015</a>)
- **Must** be able to see product type of the margin account's associated market (<a name="7001-COLL-016" href="#7001-COLL-016">7001-COLL-016</a>)
- **Must** be able to see account type (<a name="7001-COLL-017" href="#7001-COLL-017">7001-COLL-017</a>)
- **Must** be able to see account balance (<a name="7001-COLL-018" href="#7001-COLL-018">7001-COLL-018</a>)
- **Must** be able to see what percentage of that assets total is used by a margin account (<a name="7001-COLL-019" href="#7001-COLL-019">7001-COLL-019</a>)
- **Must** be able to see margin health if its a margin account (<a name="7001-COLL-020" href="#7001-COLL-020">7001-COLL-020</a>)

### Margin health

TODO

## Deal Ticket

- **Must** see your current total margin (General balance + Margin balance - Maintenance level) available (<a name="7001-COLL-011" href="#7001-COLL-011">7001-COLL-011</a>)
