# Connect Vega wallet & select keys

## Connect wallet

When looking to use Vega via a user interface e.g. Dapp (Decentralized web App), I...

- If the app loads and already has a connection it can restore "eagerly" (without the user having to click connect) it **could** do so
- **must** select a connection method / wallet type: (<a name="0002-WCON-002" href="#0002-WCON-002">0002-WCON-002</a>)
- if Rest:

  - **must** have the option to input a non-default Wallet location (<a name="0002-WCON-003" href="#0002-WCON-003">0002-WCON-003</a>)
  - **must** submit attempt to connect to wallet (<a name="0002-WCON-005" href="#0002-WCON-005">0002-WCON-005</a>)

  - if the dapp DOES already have a permission with the wallet: **must** see that wallet is connected (<a name="0002-WCON-007" href="#0002-WCON-007">0002-WCON-007</a>) note: if the user want to connect to a different wallet to the one that they were previously connected with, they will have to hit logout.

    - if the app uses one key at a time: **should** show what key is active (re-use the last active key) (<a name="0002-WCON-008" href="#0002-WCON-008">0002-WCON-008</a>)

  - if the wallet does NOT have an existing permission with the wallet: **must** prompt user to check wallet app to approve the request to connect wallet: See [Connecting to Dapps](0002-WCON-connect_vega_wallet.md#connect-wallet) for what should happen in wallet app (<a name="0002-WCON-009" href="#0002-WCON-009">0002-WCON-009</a>)

  - if new keys are given permission: **must** show the user the keys have been approved (<a name="0002-WCON-010" href="#0002-WCON-010">0002-WCON-010</a>)

    - if the dapp uses one key at a time: **should** prompt me to select key. See [select/switch keys](#select-and-switch-keys). (<a name="0002-WCON-014" href="#0002-WCON-014">0002-WCON-014</a>)

  - if user rejects connection: **must** see a message saying that the request to connect was denied (<a name="0002-WCON-015" href="#0002-WCON-015">0002-WCON-015</a>)

  - if the dapp is unable to connect for technical reason (e.g. CORS): **must** see an explanation of the error, and a method of fixing the issue (<a name="0002-WCON-016" href="#0002-WCON-016">0002-WCON-016</a>)

- ~~Browser wallet~~ `not available yet`
- Fairground hosted wallet
  - **must** only be be shown this option if the dapp is connected to fairground (<a name="0002-WCON-039" href="#0002-WCON-039">0002-WCON-039</a>)
  - **must** input a wallet name (<a name="0002-WCON-017" href="#0002-WCON-017">0002-WCON-017</a>)
  - **must** input a password (<a name="0002-WCON-018" href="#0002-WCON-018">0002-WCON-018</a>)
  - if success: **must** see that the wallet is connected and details of connected key (<a name="0002-WCON-019" href="#0002-WCON-019">0002-WCON-019</a>)
  - if failure: **must** see reason for failure (<a name="0002-WCON-020" href="#0002-WCON-020">0002-WCON-020</a>)
  - _note: the fairground hosted wallet is configured to automatically approve connections from dapps so there is no need for key selection._
- **must** have the option to select a different method / wallet type if I change my mind (<a name="0002-WCON-021" href="#0002-WCON-021">0002-WCON-021</a>)

... so I can use the interface to read data about my key/party or request my wallet to broadcast transactions to a Vega network.

## Disconnect wallet

When wishing to disconnect my wallet, I...

- **must** see an option to disconnect wallet (<a name="0002-WCON-022" href="#0002-WCON-022">0002-WCON-022</a>)
- **must** see confirmation that wallet has been disconnected (<a name="0002-WCON-023" href="#0002-WCON-023">0002-WCON-023</a>)

... so that I can protect my wallet from malicious use or select a different wallet to connect to

## Select and switch keys

when looking to do something with a specific key (or set of keys) from my wallet, I...

- **must** see what key is currently selected (if any) (<a name="0002-WCON-025" href="#0002-WCON-025">0002-WCON-025</a>)
- **must** see a list of keys that are approved from the connected wallet (<a name="0002-WCON-026" href="#0002-WCON-026">0002-WCON-026</a>)

- for each key:

  - **must** see the first and last 6 digits of the [public key](DATA-data_display.md#public-keys). (<a name="0002-WCON-027" href="#0002-WCON-027">0002-WCON-027</a>)
  - **must** be able to copy to clipboard the whole public key (<a name="0002-WCON-029" href="#0002-WCON-029">0002-WCON-029</a>)
  - **must** see the key name/alias (meta data) (<a name="0002-WCON-030" href="#0002-WCON-030">0002-WCON-030</a>)

- **must** see the option to trigger a re-authenticate so I can use newly created keys (<a name="0002-WCON-035" href="#0002-WCON-035">0002-WCON-035</a>)

...so that I can select the key(s) that I want to use.
