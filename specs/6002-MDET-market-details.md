# Market

As a trading platform user I want to see all possible information about market.
<i>IMPORTANT: Available entries may vary depending on market specifics (e.g. oracle related). Separate ACs may be created for more detailed information.</i>

## Market details

When I am on trading platform I **Must** see following market details summary on the top of trading page:
<i> Depending on the market data, tooltips may be available for some records when hovered on.</i>

- Market name (<a name="6002-MDET-001" href="#6002-MDET-001">6002-MDET-001</a>)
- Expiry (<a name="6002-MDET-002" href="#6002-MDET-002">6002-MDET-002</a>)
- Price (<a name="6002-MDET-003" href="#6002-MDET-003">6002-MDET-003</a>)
- Change (24h) (<a name="6002-MDET-004" href="#6002-MDET-004">6002-MDET-004</a>)
- Volume (24h) (<a name="6002-MDET-005" href="#6002-MDET-005">6002-MDET-005</a>)
- Trading mode (<a name="6002-MDET-006" href="#6002-MDET-006">6002-MDET-006</a>)
- Status (<a name="6002-MDET-007" href="#6002-MDET-007">6002-MDET-007</a>)
- Settlement asset (<a name="6002-MDET-008" href="#6002-MDET-008">6002-MDET-008</a>)
- Liquidity supplied (<a name="6002-MDET-009" href="#6002-MDET-009">6002-MDET-009</a>)

## Market data

When I look into market info I **Must** see following data:

- Current fees: (<a name="6002-MDET-101" href="#6002-MDET-101">6002-MDET-101</a>)
  - Maker Fee
  - Infrastracture Fee
  - Liquidity Fee
  - Total Fees
- Market price: (<a name="6002-MDET-102" href="#6002-MDET-102">6002-MDET-102</a>)
  - Mark Price
  - Best Bid Price
  - Best Offer Price
  - Quote Unit
- Market volume: (<a name="6002-MDET-103" href="#6002-MDET-103">6002-MDET-103</a>)
  - 24 Hour Volume
  - Open Interest
  - Best Bid Volume
  - Best Offer Volume
  - Best Static Bid Volume
  - Best Static Offer Volume
- Insurance pool: (<a name="6002-MDET-104" href="#6002-MDET-104">6002-MDET-104</a>)
  - Balance

## Market specification

When I look into market info I **Must** see following specification:

- Key details: (<a name="6002-MDET-201" href="#6002-MDET-201">6002-MDET-201</a>)
  - Name
  - Market ID
  - Trading Mode
  - Market Decimal Places
  - Position Decimal Places
  - Settlement Asset Decimal Places
- Instrument: (<a name="6002-MDET-202" href="#6002-MDET-202">6002-MDET-202</a>)
  - Market Name
  - Code
  - Product Type
  - Quote Name
- Oracle: (<a name="6002-MDET-203" href="#6002-MDET-203">6002-MDET-203</a>)
  - <i>content may vary</i>
- Settlement oracle: (<a name="6002-MDET-204" href="#6002-MDET-204">6002-MDET-204</a>)
  - <i>content may vary</i>
- Termination oracle: (<a name="6002-MDET-205" href="#6002-MDET-205">6002-MDET-205</a>)
  - <i>optional. only for futures. content may vary</i>
- Settlement schedule oracle: (<a name="6002-MDET-206" href="#6002-MDET-206">6002-MDET-206</a>)
  - <i>optional. only for perpetuals. content may vary</i>
- Settlement asset: (<a name="6002-MDET-207" href="#6002-MDET-207">6002-MDET-207</a>)
  - ID
  - Type
  - Name
  - Symbol
  - Decimals
  - Quantum
  - Status
  - Contract address (link)
  - Withdrawal threshold
  - Lifetime limit
  - Infrastracture fee account balance
  - Global reward pool account balance
- Metadata: (<a name="6002-MDET-208" href="#6002-MDET-208">6002-MDET-208</a>)
  - Expiry Date
  - Base
  - Quote
  - Class
  - Sector
  - Enactment
  - Settlement
- Risk model: (<a name="6002-MDET-209" href="#6002-MDET-209">6002-MDET-209</a>)
  - Tau
  - Risk Aversion Parameter
- Risk parameters: (<a name="6002-MDET-210" href="#6002-MDET-210">6002-MDET-210</a>)
  - Sigma
- Risk factors: (<a name="6002-MDET-211" href="#6002-MDET-211">6002-MDET-211</a>)
  - Short
  - Long
- price monitoring bounds <i>(multiple bounds possible)</i>: (<a name="6002-MDET-212" href="#6002-MDET-212">6002-MDET-212</a>)
  - Highest Price
  - Lowest Price
- Liquidity monitoring parameters: (<a name="6002-MDET-213" href="#6002-MDET-213">6002-MDET-213</a>)
  - Triggering Ratio
  - Time Window
  - Scaling Factor
- Liquidity: (<a name="6002-MDET-214" href="#6002-MDET-214">6002-MDET-214</a>)
  - Target Stake
  - Supplied Stake
  - link to liquidity provision table
- Liquidity price range: (<a name="6002-MDET-215" href="#6002-MDET-215">6002-MDET-215</a>)
  - Liquidity Price Range
  - Lowest Price
  - Highest Price

## Market governance

When I look into market info I **Must** see following governance information:

- Proposal: (<a name="6002-MDET-301" href="#6002-MDET-301">6002-MDET-301</a>)
  - link to governance proposal
  - link to propose a change to market
- Succession line: (<a name="6002-MDET-302" href="#6002-MDET-302">6002-MDET-302</a>):
  a list consisting of an origin market and all of its successors one-by-one.
  The list **Should** contain:

  - Market Code which links to the corresponding governance proposal
  - Market Name
  - Market ID

  When I look at the succession line list I **Should** easily distinguish which market is the currently viewed market so I can see the ancestor-descendant relations between the current and other markets on the list.

## Market successor

When I'm tranding on the market, I **Must** see there are:

- Market successor: (<a name="6002-MDET-401" href="#6002-MDET-401">6002-MDET-401</a>)
  - link to the successor market
  - 24 h volume of the successor market
  - Remaining time until parent market expires
- Proposal for the market successor : (<a name="6002-MDET-402" href="#6002-MDET-402">6002-MDET-402</a>)
  - link to governance proposal
  - name of the proposed market
