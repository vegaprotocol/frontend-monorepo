# Connect Ethereum wallet

Dapps can connect to an Ethereum wallet to complete Ethereum transactions such as Deposits and withdraws to/from Vega, Association and more.

## Connecting wallet

When wanting or needing to write to Ethereum, I...

- will have seen a link to connect that opens connection options (this always happens in context so should be covered by WITH, DEPO, ASSO ACS)

- if first time:
  - **must** select a connection method / wallet type: (e.g. wallet connect, injected / metamask) (<a name="0004-EWAL-001" href="#0004-EWAL-001">0004-EWAL-001</a>)
  - **must** be prompt to check eth wallet (while the dapp waits for a response) (<a name="0004-EWAL-002" href="#0004-EWAL-002">0004-EWAL-002</a>)
  - **must** see an option to cancel the attempted connection (if the wallet fails to respond) (<a name="0004-EWAL-003" href="#0004-EWAL-003">0004-EWAL-003</a>)
  - if the app gets multiple keys: the user:
    - **should** be shown the keys returned and given a UI to select a key for use (but the pattern is often just to select the first in the array)
    - **should** be prompted to select one (in many cases Dapps default to key 0 in the array)
- after first use (if there is a connection to restore):
  - **must** prompt wallet to grant access (<a name="0004-EWAL-004" href="#0004-EWAL-004">0004-EWAL-004</a>)
  - **should** see previous connection has been recovered
  - **should** see a link to trigger a fresh connection / fetch new keys (in in the case where I now want to use a different wallet to the one I was connected with)
- once connected:
  - **must** see the connected ethereum wallet Public key (<a name="0004-EWAL-005" href="#0004-EWAL-005">0004-EWAL-005</a>)

... so I can sign and broadcast Ethereum transactions, use a key address as in input, or read data from ethereum via my connected wallet

## Disconnecting

When I'm finished using a connected Ethereum wallet I may wish to disconnect...

- **must** see a link to disconnect (<a name="0004-EWAL-006" href="#0004-EWAL-006">0004-EWAL-006</a>)
  - **must** destroy dapp -> ETH wallet session so that hitting connect again triggers the modal that asks what method you'd like to use to connect to an ETH wallet, (note: it is not possible to invalidate the permission the metamask wallet has granted the app, therefore users will need to know that if they want to connect to a new ETH key they will have to do so from the wallet) (<a name="0004-EWAL-007" href="#0004-EWAL-007">0004-EWAL-007</a>)

... so that I can use a different wallet, or ensure may wallet can not be used by other apps
