# Vote

Background: [Governance spec](../protocol/0028-GOVE-governance.md)
and [docs](https://s.vega.xyz/s/mainnet/concepts/vega-protocol#governance).

There are a few things that can be governed on Vega...

- Network parameters (variables used by the network)
- Markets (creation and changes to existing)
- Assets (creation on changes to existing)
- "Freeform", which has no affect on the network but can be used to to measure token holders views

To make proposal: a user will require an amount of the Governance token [associated](1004-ASSO-associate.md) with their key.

To vote: a user will require [associated](1004-ASSO-associate.md) Governance tokens (or in the case of market change proposals they could have an active liquidity provision).

Each vote has a weight behind it based on the number of associate tokens or the liquidity provision's equity like share at the point in time that the vote closes.

Each proposal type will have a majority required (vote weight in favour) and a participation required (the turn out for the vote needs to be sufficient to be valid).

A proposal has a life cycle and various statuses to track it's progress. proposals that accept votes can have a few different statuses. A short hand is used in these ACs:

- Open = Accepting votes (includes `waitingForNodeVote`)
- To enact = passed but not yet enacted (`pending)
- Closed = was accepting votes but deadline has passed (e.g. `passed`, `rejected` etc)
- `Failed` = did not get to the point of accepting votes.

## list of proposals

When looking for a particular proposal or wanting to see what proposals are open, soon to enact or closed, I...

- **must** see link to details on how governance works in docs (<a name="3001-VOTE-001" href="#3001-VOTE-001">3001-VOTE-001</a>)
- **must** see link(s) to make proposals (<a name="3001-VOTE-002" href="#3001-VOTE-002">3001-VOTE-002</a>)
- **must** if there are no proposals, see that there have been no proposals since the last chain checkpoint restore (<a name="3001-VOTE-003" href="#3001-VOTE-003">3001-VOTE-003</a>)
- **must** see open proposals (and ones due for enactment) distinct from others (e.g grouped by "open", "to enact" "closed") (note: freeform proposals do not enact so should be shown as "closed" when "passed") (<a name="3001-VOTE-004" href="#3001-VOTE-004">3001-VOTE-004</a>)
- **should** see proposals sorted with the ones closest to enactment first (within each group)
- **must** see a history of all "closed" proposals (<a name="3001-VOTE-006" href="#3001-VOTE-006">3001-VOTE-006</a>)
- can search for a proposal by:
  - **should** be able to search by proposal ID
  - **should** be able to search by public key of the proposer
  - **should** be abel to search by market ID/name/code (ID may be the same as proposal ID)
  - **should** be able to search by asset name/symbol
  - **should** be able to search by network parameter
  - **should** be able to search by content of proposal description
- **must** see how long is left to vote (<a name="3001-VOTE-018" href="#3001-VOTE-018">3001-VOTE-018</a>)
- **must** see colourful / shouty things that prompt me to vote urgently on things "CLOSING SOON" (<a name="3001-VOTE-019" href="#3001-VOTE-019">3001-VOTE-019</a>)
- **must** see the current voting status and whether it will pass (<a name="3001-VOTE-020" href="#3001-VOTE-020">3001-VOTE-020</a>)
- **must** see the current participation and whether it will pass (<a name="3001-VOTE-021" href="#3001-VOTE-021">3001-VOTE-021</a>)

for each proposal:

- **must** see the proposal ID (<a name="3001-VOTE-008" href="#3001-VOTE-008">3001-VOTE-008</a>)
- **must** see who the proposer is (e.g. their public address) (<a name="3001-VOTE-009" href="#3001-VOTE-009">3001-VOTE-009</a>)
- **must** see the type of proposal (<a name="3001-VOTE-007" href="#3001-VOTE-007">3001-VOTE-007</a>)
- **must** see the proposal title (<a name="3001-VOTE-097" href="#3001-VOTE-097">3001-VOTE-097</a>)
- **should** see a summary of what the type of proposed change is, without looking at details (network, new market etc)
  - for network parameters: **should** see what parameter is being changed and new value
  - for network parameters: **could** see what the current values are for that parameter
  - for network parameters: **could** see if there are other open proposals for the same parameter
  - for new markets: **should** see the type of market (e.g. Future)
  - for new markets: **could** see the type trading mode of the market (e.g. auction, continuous)
  - for new markets: **should** see the name of the new market
  - for new markets: **should** see the code of the new market
  - for new markets: **should** see the settlement asset of the new market (not just asset ID but asset Symbol)
  - for new markets: **could** see a summary of the oracle used for settlement
  - for market changes: **should** see the name of the market being changed
  - for market changes: **should** see a summary of what parameters are being changed
  - for market changes: **should** see a the proposed values for parameters
  - for market changes: **should** see a the current values for that parameter
  - for market changes: **could** see if there are other open proposals for the same market
  - for new assets: **must** see the name of the new asset (<a name="3001-VOTE-026" href="#3001-VOTE-026">3001-VOTE-026</a>)
  - for new assets: **must** see the code of the new asset (<a name="3001-VOTE-027" href="#3001-VOTE-027">3001-VOTE-027</a>)
  - for new assets: **must** see the source of the new asset (e.g. ERC20) (<a name="3001-VOTE-028" href="#3001-VOTE-028">3001-VOTE-028</a>)
  - for new assets (if source is ERC20): **must** see contract address (<a name="3001-VOTE-095" href="#3001-VOTE-095">3001-VOTE-095</a>)
  - for new assets (if source is ERC20): **must** see if the Asset has been whitelisted on the bridge (<a name="3001-VOTE-096" href="#3001-VOTE-096">3001-VOTE-096</a>)
  - for asset changes: **must** see name of asset being changed (<a name="3001-VOTE-029" href="#3001-VOTE-029">3001-VOTE-029</a>)
  - for asset changes: **must** see the parameter(s) being changed (<a name="3001-VOTE-030" href="#3001-VOTE-030">3001-VOTE-030</a>)
  - for asset changes; **must** see the new value for the parameters being changed (<a name="3001-VOTE-031" href="#3001-VOTE-031">3001-VOTE-031</a>)
  - for asset changes: **could** see if there are other open proposals for the same parameter(s)
  - for asset changes: **should** see the current values for these parameters
  - for freeform: **must** see a summary of the proposal (suggest the first x characters of the proposal blob)
- **must** see the proposal status e.g. passed, open, waiting for node to vote) (<a name="3001-VOTE-035" href="#3001-VOTE-035">3001-VOTE-035</a>)
  - for new asset proposals: **must** see if an asset has not yet been whitelisted on the bridge (<a name="3001-VOTE-036" 
    href="#3001-VOTE-036">3001-VOTE-036</a>)
- **must** see the proposal's terms in JSON
  (<a name="3001-VOTE-010" href="#3001-VOTE-010">3001-VOTE-010</a>)
- for open proposals: **must** see a summary of how the vote count stands and if it looks like proposal will pass or not (note some of these are repeated in more details in the [details section](#details-of-a-proposal)) (<a name="3001-VOTE-037" href="#3001-VOTE-037">3001-VOTE-037</a>)
  - if the proposal failed (had the status of "failed", because it was an invalid on submission) they **should not** appear in the list (instead the proposer will see this after submission)
  - if the proposal looks like it will fail due to insufficient participation: **should** see "participation not reached"
  - else if: proposal looks like it might fail due to insufficient majority (and is not a market change proposal): **should** see "Majority not reached"
  - else if (is a market change proposal) and is likely to pass because of liquidity providers vote: **should** see "set to pass by Liquidity provider vote"
  - else if: proposal is likely to pass: **should** see "set to pass"
  - **must** see when (date/time) voting closes on proposal (<a name="3001-VOTE-043" href="#3001-VOTE-043">3001-VOTE-043</a>)
- for (non-freefrom) proposals that have passed but not enacted: **must** see when they will enact (<a name="3001-VOTE-044" href="#3001-VOTE-044">3001-VOTE-044</a>)
- for (non-freefrom) proposals that have passed but not enacted: **should** see when (date/time) voting closed
- for (non-freeform) proposals that enacted: **must** see when they enacted (<a name="3001-VOTE-046" href="#3001-VOTE-046">3001-VOTE-046</a>)
- for freeform proposals that have passed: **must** see when they passed (<a name="3001-VOTE-047" href="#3001-VOTE-047">3001-VOTE-047</a>)
- for proposals that did not pass due to lack of participation: **must** see "Participation not reached" (<a name="3001-VOTE-048" href="#3001-VOTE-048">3001-VOTE-048</a>)
- for proposals that did not pass due to lack of majority: **must** see "Majority not reached" (<a name="3001-VOTE-049" href="#3001-VOTE-049">3001-VOTE-049</a>)
- for proposals that did not pass due to failure: **must** see "Failed" (<a name="3001-VOTE-050" href="#3001-VOTE-050">3001-VOTE-050</a>)
- for proposals that I ([connected Vega](./0002-WCON-connect_vega_wallet.md) key) have voted on: **should** see my vote (for or against)

...so I can see select one to view and vote, or view outcome.

## Details of a proposal

When looking at a particular proposal, I...

- see [the same details in the list of proposals](#list-of-proposals) and:
- **must** have option to see raw JSON of proposal (<a name="3001-VOTE-052" href="#3001-VOTE-052">3001-VOTE-052</a>)
- **should** display the proposed change details displayed in a human readable format (e.g. with market id, shown along with that market name)

- **must** see the rationale title (<a name="3001-VOTE-054" href="#3001-VOTE-054">3001-VOTE-054</a>)
- **must** see the full rationale description if there is one (<a name="3001-VOTE-055" href="#3001-VOTE-055">3001-VOTE-055</a>)
- **must** see rationale description rendered with markdown (<a name="3001-VOTE-101" href="#3001-VOTE-101">3001-VOTE-101</a>)

For open proposals:

- **must** show a summary of vote status (base on the current total amount associated tokens, note this could change before the vote ends) (<a name="3001-VOTE-057" href="#3001-VOTE-057">3001-VOTE-057</a>)
- **must** see if the token vote has met a required participation threshold (<a name="3001-VOTE-058" href="#3001-VOTE-058">3001-VOTE-058</a>)
- **must** see the sum of tokens that have voted so far (<a name="3001-VOTE-059" href="#3001-VOTE-059">3001-VOTE-059</a>)
- **must** see sum of tokens that have voted as a percentage of total voted (<a name="3001-VOTE-011" href="#3001-VOTE-011">3001-VOTE-011</a>)
- **should** see what the participation threshold is for this proposal (note this is set per proposal once the proposal hits the chain based on the current network params, incase a proposal is set to enact that changes threshold)
- **must** see if the Token vote has met the required majority threshold (<a name="3001-VOTE-062" href="#3001-VOTE-062">3001-VOTE-062</a>)
- **must** see the sum of tokens that have voted in favour of the proposal (<a name="3001-VOTE-064" href="#3001-VOTE-064">3001-VOTE-064</a>)
- **should** see sum of tokens that have votes in favour of proposal as percentage of total associated
- **should** see what the majority threshold is for this proposal (note this is see per proposal, incase a proposal is set to enact that changes threshold)

For open market change proposals, all of the above and:

- **must** show a summary of vote status (base on the current equality like share, note this could change before the vote ends) (<a name="3001-VOTE-067" href="#3001-VOTE-067">3001-VOTE-067</a>)
- **must** see if the equity like share vote has met the required participation threshold (<a name="3001-VOTE-068" href="#3001-VOTE-068">3001-VOTE-068</a>)
- **must** see the equity like share % that has voted so far (<a name="3001-VOTE-069" href="#3001-VOTE-069">3001-VOTE-069</a>)
- **should** see what the equity like share threshold is for this proposal (note this is see per proposal, incase a proposal is set to enact that changes threshold)
- **must** see if the equity like share vote has met the required majority threshold (<a name="3001-VOTE-071" href="#3001-VOTE-071">3001-VOTE-071</a>)
- **must** see the equity like share as percentage that has voted in favour of the proposal (<a name="3001-VOTE-072" href="#3001-VOTE-072">3001-VOTE-072</a>)
- **must** see what the majority threshold is for this proposal (note this is see per proposal, incase a proposal is set to enact that changes threshold) (<a name="3001-VOTE-073" href="#3001-VOTE-073">3001-VOTE-073</a>)

For update market proposals:

- As a liquidity provider, **must** be able to participate in a liquidity vote on an update market proposal, when the token vote has not reached required participation level in time (<a name="3001-VOTE-015" href="#3001-VOTE-015">3001-VOTE-015</a>)
- **must** be able to to understand why a liquidity vote has been incurred (<a name="3001-VOTE-016" href="#3001-VOTE-016">3001-VOTE-016</a>)
- **must** be able to to understand that the result in the end may differ (as the outcome of the vote is based on the number of tokens held by the voters at time of vote close) (<a name="3001-VOTE-017" href="#3001-VOTE-017">3001-VOTE-017</a>)

For `closed` market change proposals, all of the above and:

- **must** see all of above but values at time of vote close (<a name="3001-VOTE-074" href="#3001-VOTE-074">3001-VOTE-074</a>)

... so I can see what I am voting for and the status of the vote.

## Can vote on an open proposals

When looking to vote on the proposal, I...

- **must** see an option to [connect to a Vega wallet/key](./0002-WCON-connect_vega_wallet.md) (<a name="3001-VOTE-075" href="#3001-VOTE-075">3001-VOTE-075</a>)
- **must** be [connected to a Vega wallet/key](./0002-WCON-connect_vega_wallet.md) (<a name="3001-VOTE-076" href="#3001-VOTE-076">3001-VOTE-076</a>)
  - **must** see sum of tokens I have [associated](1027-ASSO-associate.md) (<a name="3001-VOTE-100" href="#3001-VOTE-100">3001-VOTE-100</a>)
  - **should** see what percentage of the total [associated](1027-ASSO-associate.md) tokens I hold
    - **must**, if I have 0 tokens, see link to [associate](1027-ASSO-associate.md) (<a name="3001-VOTE-012" href="#3001-VOTE-012">3001-VOTE-012</a>)
  - **must** see my current vote for, against, or not voted (<a name="3001-VOTE-079" href="#3001-VOTE-079">3001-VOTE-079</a>)
  - **must** see option to vote for or against (<a name="3001-VOTE-080" href="#3001-VOTE-080">3001-VOTE-080</a>)
    - **must** trigger a transaction that needs to be confirmed in users wallet (<a name="3001-VOTE-013" href="#3001-VOTE-013">3001-VOTE-013</a>)
    - **must** see that I need to confirm the transaction in my wallet to continue (<a name="3001-VOTE-014" href="#3001-VOTE-014">3001-VOTE-014</a>)
  - **must** see option to change my vote (vote again in same or different direction) (<a name="3001-VOTE-090" href="#3001-VOTE-090">3001-VOTE-090</a>)
  - **must** see two vote status bars, one showing majority voting yes/no, and the other showing participation progress. The maximum value for the progress bar should be the threshold for that proposal type. (<a name="3001-VOTE-023" href="#3001-VOTE-023">3001-VOTE-023</a>)
  - **must** see when the participation bar reaches 100% (i.e. the network param threshold is met) the indicator text on top of it reads "[network param]% participation threshold met". Otherwise it says "[network param]% participation threshold not met". (<a name="3001-VOTE-024" href="#3001-VOTE-024">3001-VOTE-024</a>)

For open market change proposals, all of the above and:

- **must** see your equity like share on the market you are voting on (<a name="3001-VOTE-092" href="#3001-VOTE-092">3001-VOTE-092</a>)

for both:

- **must** see feedback of my vote [Vega transaction](0003-WTXN-submit_vega_transaction.md) (<a name="3001-VOTE-093" href="#3001-VOTE-093">3001-VOTE-093</a>)

...so that I can cast my vote and see the impact it might have.
