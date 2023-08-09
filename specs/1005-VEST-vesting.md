# Vesting

Some governance tokens may be held by a Vesting contract. This means that can be "owned" by an Ethereum key but not freely transferred until a vesting terms are complete.

## list of tranches

When looking to understand to overall vesting schedule for tokens, I...

- **must** see a list of tranches <a name="1005-VEST-001" href="#1005-VEST-001">1005-VEST-001</a>
- **should** see a visualization of the vesting schedule with a break down of the type of token holders (e.g. team, investors, community) <a name="1005-VEST-002" href="#1005-VEST-002">1005-VEST-002</a>

For each tranche:

- **must** see a tranche number <a name="1005-VEST-003" href="#1005-VEST-003">1005-VEST-003</a>
- **could** see any annotation of what this tranche is about (e.g. community schedule A)
- **must** see a sum of tokens in the tranche <a name="1005-VEST-005" href="#1005-VEST-005">1005-VEST-005</a>
  - **must** see how many tokens in the tranche are locked <a name="1005-VEST-006" href="#1005-VEST-006">1005-VEST-006</a>
  - **must** see how how many tokens in the tranche are redeemable <a name="1005-VEST-007" href="#1005-VEST-007">1005-VEST-007</a>
- **must** see the vesting terms for each tranche (when unlocking stats and ends) <a name="1005-VEST-008" href="#1005-VEST-008">1005-VEST-008</a>

... so I can understand how circulating supply could change over time.

## Details of a tranche

When looking into a specific tranche, I...

- **must** see all the same details as the [list of tranches](#details-of-a-tranche)
- **should** see a list of ethereum wallets with tokens in this tranche

for each ethereum wallet:

- **should** see the full eth address of the wallet
- **should** see the total tokens this address holds in this tranche
  - **should** see how many tokens in the tranche are locked
  - **should** see how how many tokens in the tranche are redeemable

... so I can see the details of how tokens are distributed in this tranche

## See summary for a given Ethereum key

When looking to see how many tokens I have in total, and how many I might be able to redeem, I...

- **must** be able to [Connect and ethereum wallet](0004-EWAL-connect_ethereum_wallet.md) <a name="1005-VEST-018" href="#1005-VEST-018">1005-VEST-018</a>
- **should** be able input an ethereum address

for the a given Ethereum wallet/address/key:

- **must** see a total of tokens across all tranches <a name="1005-VEST-020" href="#1005-VEST-020">1005-VEST-020</a>
  - **must** see how many tokens across all tranches are locked <a name="1005-VEST-021" href="#1005-VEST-021">1005-VEST-021</a>
  - **must** see how many tokens across all tranches are redeemable <a name="1005-VEST-022" href="#1005-VEST-022">1005-VEST-022</a>
- **must** see a list of tranches this key has tokens in <a name="1005-VEST-023" href="#1005-VEST-023">1005-VEST-023</a>
- **must** see a total of tokens in each tranche <a name="1005-VEST-024" href="#1005-VEST-024">1005-VEST-024</a>
  - **must** see how many tokens in each tranche are locked <a name="1005-VEST-025" href="#1005-VEST-025">1005-VEST-025</a>
  - **must** see how many tokens in each tranche are redeemable <a name="1005-VEST-026" href="#1005-VEST-026">1005-VEST-026</a>
  - **must** see an option to redeem from tranche <a name="1005-VEST-027" href="#1005-VEST-027">1005-VEST-027</a>
  - **must** be warned if amount that can be redeemed from that tranche is greater than the un-associated balance for that Eth key (because this will cause the redeem function to fail) <a name="1005-VEST-028" href="#1005-VEST-028">1005-VEST-028</a>
  - **should** see how many tokens I'd need to disassociate to be able to run the redeem function (this should be rounded up to avoid the transaction failing due to more tokens having unlocked since the user looked at the form)
  - **should** see link to [disassociate](1004-ASSO-associate.md)

... so I can easily see how many tokens I have, and can redeem.

## Redeem tokens from a tranche

Note: it is not possible to choose how many tokens you redeem from a tranche, instead you select a tranche and the smart contract will attempt to redeem all. However, it will fail if some of the amount it attempts to redeem have been associated to a Vega key. Therefore the job of this page is to help the user work out how many tokens to disassociate before they can successfully redeem.

When looking to redeem tokens, I...

- **must** [connect the ethereum wallet](0004-EWAL-connect_ethereum_wallet.md) that holds tokens <a name="1005-VEST-029" href="#1005-VEST-029">1005-VEST-029</a>
- must see see all tranches that you have tokens in (including tranche 0) <a name="1005-VEST-036" href="#1005-VEST-036">1005-VEST-036</a>
- must see a total of tokens across all tranches (including tranche 0) <a name="1005-VEST-037" href="#1005-VEST-037">1005-VEST-037</a>
- **must** select a tranche to redeem from <a name="1005-VEST-030" href="#1005-VEST-030">1005-VEST-030</a>
- **must** see the number of tokens that can be redeemed <a name="1005-VEST-031" href="#1005-VEST-031">1005-VEST-031</a>
- **must** be warned if the number of tokens you would be attempting to redeem is greater than you have unassociated <a name="1005-VEST-035" href="#1005-VEST-035">1005-VEST-035</a>
  - **should** tell you how many tokens to disassociate for the redeem function to work (should round up to create a buffer for the tokens that may unlock between now and when the user gets to the disassociate form)
  - **should** see a link to disassociate
- **must** submit the redeem from tranche [ethereum transaction](0005-ETXN-submit_ethereum_transaction.md) <a name="1005-VEST-032" href="#1005-VEST-032">1005-VEST-032</a>
- **must** get feedback on the progress of the Ethereum transaction <a name="1005-VEST-033" href="#1005-VEST-033">1005-VEST-033</a>
- **must** see updated balances (in the trance and my eth wallet) after redemption <a name="1005-VEST-034" href="#1005-VEST-034">1005-VEST-034</a>

... so that I can use this tokens more generally on Ethereum (transfer to another key etc)
