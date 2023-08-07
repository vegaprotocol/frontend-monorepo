# Submit Ethereum transaction

## Know what transaction I'm signing

When about to click to prompt Ethereum wallet to sign a transaction, I...

- **should** see the contract address I am about to interact with
- **should** see the function name I am about to interact with

...so I know what to expect when my wallet asks me to sign

## Track transactions to wallet

after clicking to submit an eth transaction to a connected wallet, I...

- **could** see an estimate for gas prices compared to a recent history
- **could** see an estimated gas price for the function in question
- **must** see prompt to check Ethereum wallet to approve transactions

... so I know I need to go to my wallet app to approve the transaction

## ERC20 approval/permit

> The approval/permit step is part of the [ERC20 standard](https://ethereum.org/en/developers/docs/standards/tokens/erc-20/). It's intention is to provide additional security when interacting with smart contracts / using Dapps. It sets a maximum amount that the given eth key can send to a given address. It means that before end "spend" of ERC20 tokens I will have need to submit a "approve" transaction to tell the network how much is approved. An attempt to spend more than the approved amount will fail.
> For example: In my approve transaction, I approve 10, I then spend 5. In my next transaction I attempt to spend 6, this will fail as my approve amount was reduced by the first transaction.
> It is common for dapps to have a approve button that simply asks to approve a massive amount and leave it up to the wallet UI (e.g. metamask) to ask the user if they would like to change this.
> Some ERC20 contracts have an additional function that runs both the approve and deposit function in one, but this is not standard.

If the transaction in question requires an ERC20 approval, I...

- if the current approved amount is less than the amount being "spent": **must** see be prompt to approve
- **could** see the current approved amount
- **must** be able to set the amount to be approved (in case the connected wallet does not handle this) (<a name="0005-ETXN-006" href="#0005-ETXN-006">0005-ETXN-006</a>)
- **must** send an approve transaction with either a user specified amount or a very large number (<a name="0005-ETXN-001" href="#0005-ETXN-001">0005-ETXN-001</a>)
- **must** see feedback of the state of approve transaction see "tracking ethereum transactions" below. (<a name="0005-ETXN-002" href="#0005-ETXN-002">0005-ETXN-002</a>)

... so I can control the maximum permitted transfer to the contract in question

## Tracking Ethereum transactions on network

After approving a transaction in my wallet app, I...

- **should** see link to the transaction on etherscan
- **must** see the transactions status (Pending, confirmed, etc) on Ethereum by reading Ethereum (via connected wallet or the back up node specified in the app) (<a name="0005-ETXN-003" href="#0005-ETXN-003">0005-ETXN-003</a>)
- if failed: **must** see why the transaction failed (e.g. didn't pay enough gas) (<a name="0005-ETXN-004" href="#0005-ETXN-004">0005-ETXN-004</a>)
- if success: **should** see how many blocks ago the transaction was confirmed by the eth node being read

... so I can see the status of the transaction and debug as appropriate

## Tracking Ethereum transactions having their affect on Vega

Note: it is common for inter-blockchain applications to wait a certain amount of blocks before crediting money, as this reduces the risk of double spend in the case of forks or chain roll backs. There is a Vega environment variable the defines how long Vega waits.

If the ethereum transaction I've just submitted changes the state of the Vega network (e.g. a deposit from eth appearing as credited to my vega key on vega), I...

- **should** see how many Ethereum blocks Vega needs to wait before changing the state of Vega
- **should** see how many blocks have passed or remain until the required number has been met
- **must** see whether the expect action has taken place on Vega (e.g. credited Vega key) (<a name="0005-ETXN-005" href="#0005-ETXN-005">0005-ETXN-005</a>)

... so I know vega has been updated as appropriate
