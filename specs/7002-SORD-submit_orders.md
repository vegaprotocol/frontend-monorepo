# Submit order

As a user I want change my exposure on a market (e.g. open a position, increase or decrease my open volume), I want to submit an order with instructions for how my order should be executed so I have some control over the price that I get, as well as if when/my order should stay on the book. See [specs about orders](../protocol#orders) for more info.

## Before seeing a "deal ticket"

When looking at a market, I...

- **must** see/select the [Market](./9001-DATA-data_display.md#market) I am submitting the order for (<a name="7002-SORD-001" href="#7002-SORD-001">7002-SORD-001</a>)
- **must** see the current `status` of the market (<a name="7002-SORD-061" href="#7002-SORD-061">7002-SORD-061</a>)

  if the market is in a state of `rejected`, `canceled` or `closed`:

  - **must** see that the market is not accepting orders and never will be (<a name="7002-SORD-062" href="#7002-SORD-062">7002-SORD-062</a>)

  if the market is in a state of `tradingTerminated`:

  - **must** see that the market is not accepting orders and never will be (<a name="7002-SORD-063" href="#7002-SORD-063">7002-SORD-063</a>)
  - **should** see the [price](9001-DATA-data_display.md#quote-price) that was used to settle the market
  - **should** see a link to oracle spec and data

  if the market is in a state of `settled`:

  - **must** see that the market is not accepting orders and never will be (<a name="7002-SORD-066" href="#7002-SORD-066">7002-SORD-066</a>)
  - **should** see the oracle events that terminated the market
  - **should** see a link to oracle spec and data

  if the market is in a state of `suspended`:

  - **should** see what suspended the market
  - **should** see the conditioned required for the auction to end
  - **should** see the current data values that the auction end is measured against (e.g. Supplied stake)

...so I know if the market is accepting orders.

The rest of this document only applies if the state of the market is `pending`, `active` or `suspended`:

## Deal ticket

When populating a deal ticket I...

- **must** see the current market trading mode (Continuous, Auction etc) (<a name="7002-SORD-002" href="#7002-SORD-002">7002-SORD-002</a>)

- If I have a 0 total balance of the settlement asset: **must** be warned that I have insufficient collateral (but also allow you to populate ticket because I might want to try before I deposit) (<a name="7002-SORD-003" href="#7002-SORD-003">7002-SORD-003</a>)

  - **should** have a way to easily deposit the required collateral

- **must** select a side/direction e.g. long/short (note: some implementations may do this with two different submit buttons long/short rather than a toggle) (<a name="7002-SORD-004" href="#7002-SORD-004">7002-SORD-004</a>)

- **must** be able to select the [order type](../protocol/0014-ORDT-order_types.md) that I wish to submit (<a name="7002-SORD-005" href="#7002-SORD-005">7002-SORD-005</a>)

  - **must** see limit order (<a name="7002-SORD-006" href="#7002-SORD-006">7002-SORD-006</a>)
  - **must** see market order (<a name="7002-SORD-007" href="#7002-SORD-007">7002-SORD-007</a>)
  - **must** see stop limit order (<a name="7002-SORD-008" href="#7002-SORD-008">7002-SORD-008</a>)
  - **must** see stop market order (<a name="7002-SORD-009" href="#7002-SORD-009">7002-SORD-009</a>)

- **must** see on an submit button: order type, size and price (<a name="7002-SORD-010" href="#7002-SORD-010">7002-SORD-010</a>)

- **must** see warning abut a limit of 4 active stop orders per market (<a name="7002-SORD-011" href="#7002-SORD-011">7002-SORD-011</a>)

## Order size

...need to select a size, when selecting a size for my order, I...

- **must** input an order [size](9001-DATA-data_display.md#size) (aka amount or contracts) (<a name="7002-SORD-010" href="#7002-SORD-010">7002-SORD-010</a>)
  - **should** have the previous value for the selected market available e.g. pre-populated (last submitted or last changed)
  - **should** be able to quickly change the size by the market's min-contract size e.g. hit up/down on the keyboard to increase
    - **should** be able to use modifier keys (SHIFT, ALT etc) to increase/decrease in larger increments with arrows
    - **would** like to be able to enter a number followed be "k" or "m" or "e2" etc. to make it thousands or millions or hundreds, etc.
- **must** be warned (pre-submit) if input has too many digits after the decimal place for the market's ["position" decimal places](9001-DATA-data_display.md#size) (<a name="7002-SORD-016" href="#7002-SORD-016">7002-SORD-016</a>)

... so I get the size of exposure (open volume) that I want

## Price - Limit order

... if wanting to place a limit on the price that I trade at, I...

- **must** enter a [price](9001-DATA-data_display.md#quote-price). (<a name="7002-SORD-017" href="#7002-SORD-017">7002-SORD-017</a>)
- **must** see the price unit (as defined in market) (<a name="7002-SORD-018" href="#7002-SORD-018">7002-SORD-018</a>)
  - **should** be able quickly pre-populate the price with the current mark price (if there is one, 0 if not) e.g. by focusing the input and hitting up/down
  - **should** have the previous value for the selected market pre-populated (last submitted or last changed)
  - **should** be able to hit up/down on the keyboard to increase the price by the market's tick size (if set, or smallest increment)
    - **should** be able to use modifier keys (SHIFT, ALT etc) to increase/decrease in larger increments with arrows
    - **would** like to be able to enter a number followed be "k" or "m" or "e2" etc. to make it thousands or millions or hundreds, etc.
- **must** be warned (pre-submit) if the input price has too many digits after the decimal place for the market ["quote"](9001-DATA-data_display.md#quote-price) (<a name="7002-SORD-059" href="#7002-SORD-059">7002-SORD-059</a>)

... so that my order only trades at up/down to a particular price

## Price - Limit stop order

... if wanting to place a stop limit on the price that I trade at, I...

- **must** enter a price (<a name="7002-SORD-020" href="#7002-SORD-020">7002-SORD-020</a>)
- **must** see the price unit (as defined in market) (<a name="7002-SORD-021" href="#7002-SORD-021">7002-SORD-021</a>)
  - **must** have the previous value for the selected market pre-populated (last submitted or last changed) (<a name="7002-SORD-022" href="#7002-SORD-022">7002-SORD-022</a>)
  - **must** be able to hit up/down on the keyboard to increase the price by the market's tick size (if set, or smallest increment) (<a name="7002-SORD-029" href="#7002-SORD-029">7002-SORD-029</a>)
- **must** be warned (pre-submit) if the input price has too many digits after the decimal place for the market "quote" (<a name="7002-SORD-032" href="#7002-SORD-032">7002-SORD-032</a>)
- **must** select a trigger direction (<a name="7002-SORD-033" href="#7002-SORD-033">7002-SORD-033</a>)
  - **must** see rises above (<a name="7002-SORD-034" href="#7002-SORD-034">7002-SORD-034</a>)
  - **must** see falls below (<a name="7002-SORD-035" href="#7002-SORD-035">7002-SORD-035</a>)
  - if the user has not set a preference: trigger direction **must** default to `rises above` (<a name="7002-SORD-036" href="#7002-SORD-036">7002-SORD-036</a>)
- **must** enter a trigger value (<a name="7002-SORD-037" href="#7002-SORD-037">7002-SORD-037</a>)
- **must** select a trigger type (<a name="7002-SORD-038" href="#7002-SORD-038">7002-SORD-038</a>)
  - **must** see a trigger price (<a name="7002-SORD-049" href="#7002-SORD-049">7002-SORD-049</a>)
  - **must** see a trigger trailing percent offset (<a name="7002-SORD-050" href="#7002-SORD-050">7002-SORD-050</a>)
  - if the user has not set a preference: trigger type **must** default to `price` (<a name="7002-SORD-051" href="#7002-SORD-051">7002-SORD-051</a>)

... so that my order only trades after reaching the trigger and at up/down to a particular price - it is reduce only order

## Market order

... if wanting to trade regardless of price (or assuming that the market is liquid enough that the current best prices are enough of an indication of the price I'll get)...

- **must not** see a price input (<a name="7002-SORD-019" href="#7002-SORD-019">7002-SORD-019</a>)
- **should** be warning if the market is in auction and the market order may be rejected

... so I can quickly submit an order without populating the ticket with elements I don't care about

## Market stop order

... if wanting to trade regardless of price with trigger (or assuming that the market is liquid enough that the current best prices are enough of an indication of the price I'll get)...

- **must not** see a price input (<a name="7002-SORD-052" href="#7002-SORD-052">7002-SORD-052</a>)
- **must** see a price input (<a name="7002-SORD-054" href="#7002-SORD-054">7002-SORD-054</a>)
- **must** select a trigger direction (<a name="7002-SORD-055" href="#7002-SORD-055">7002-SORD-055</a>)
  - **must** see rises above (<a name="7002-SORD-056" href="#7002-SORD-056">7002-SORD-056</a>)
  - **must** see falls below (<a name="7002-SORD-057" href="#7002-SORD-057">7002-SORD-057</a>)
  - **must** enter a trigger value (<a name="7002-SORD-058" href="#7002-SORD-058">7002-SORD-058</a>)
  - **must** select a trigger price (<a name="7002-SORD-064" href="#7002-SORD-064">7002-SORD-064</a>)
  - **must** select a trigger trailing percent offset (<a name="7002-SORD-065" href="#7002-SORD-065">7002-SORD-065</a>)
  - **must** copy a trigger value to the price field (<a name="7002-SORD-067" href="#7002-SORD-067">7002-SORD-067</a>)

... so that my order only trades after reaching the trigger and with market price - it is reduce only order

## Pegged

... submit an order where the price is offset from a price in system (best bid etc)

- TODO

... so my order will move with the market

## Time in force

... should to select a time in force, when selecting a time in force, I...

- **must** select a time in force
  - Good till canceled `GTC` - not applicable to Market orders (<a name="7002-SORD-023" href="#7002-SORD-023">7002-SORD-023</a>)
  - Good till time `GTT` - not applicable to Market orders (<a name="7002-SORD-024" href="#7002-SORD-024">7002-SORD-024</a>)
  - Fill or kill `FOK` (<a name="7002-SORD-025" href="#7002-SORD-025">7002-SORD-025</a>)
  - Immediate or cancel `IOC` (<a name="7002-SORD-026" href="#7002-SORD-026">7002-SORD-026</a>)
  - Good for normal trading only `GFN` - not applicable to Market orders (<a name="7002-SORD-027" href="#7002-SORD-027">7002-SORD-027</a>)
  - Good for auction only `GFA` - not applicable to Market orders (<a name="7002-SORD-028" href="#7002-SORD-028">7002-SORD-028</a>)
- **should** only be warned if the time in force is not applicable to the order type I have selected
- **should** only be warned if the time in force is not applicable to current period's trading mode
- if the user has not set a preference: market orders **must** default to `IOC` (<a name="7002-SORD-030" href="#7002-SORD-030">7002-SORD-030</a>)
- if the user has not set a preference: limit orders **must** default to `GTC` (<a name="7002-SORD-031" href="#7002-SORD-031">7002-SORD-031</a>)
- if it is stop order limit or stop order market then **must** select
  - Fill or kill `FOK` (<a name="7002-SORD-068" href="#7002-SORD-068">7002-SORD-068</a>)
  - Immediate or cancel `IOC` (<a name="7002-SORD-069" href="#7002-SORD-069">7002-SORD-069</a>)
  - if the user has not set a preference: market orders **must** default to `FOK` (<a name="7002-SORD-070" href="#7002-SORD-070">7002-SORD-070</a>)

... so I can control if and how my order stays on the order book

## Execution flags

... could select some execution flags. When selecting execution flags (aka order conditions)...

- **must** see an option to select "Post only" (<a name="7003-SORD-054" href="#7003-SORD-054">7003-SORD-054</a>)

  - **should** see explanation of what Post only is/does
  - **must** see the post only option is unselected and disabled (can not be checked) if the time in force is set to IOC or FOK (<a name="7003-SORD-055" href="#7003-SORD-055">7003-SORD-055</a>)
    - **must** see an explanation of why the option is disabled (<a name="7003-SORD-056" href="#7003-SORD-056">7003-SORD-056</a>)

- **must** see an option to select "Reduce only" (<a name="7003-SORD-057" href="#7003-SORD-057">7003-SORD-057</a>)

  - **should** see explanation of what Reduce only is/does (<a name="7003-SORD-058" href="#7003-SORD-058">7003-SORD-058</a>)

- **must** see that selecting "Post only" or "reduce only" de-select the other (if selected). As is it not possibly to apply them both to an order (<a name="7003-SORD-059" href="#7003-SORD-059">7003-SORD-059</a>)

- **must** see an option to select expire for stop order limit and market (<a name="7002-SORD-071" href="#7002-SORD-071">7002-SORD-071</a>)

  - **must** select strategy for stop order limit and market (<a name="7002-SORD-072" href="#7002-SORD-072">7002-SORD-072</a>)
    - **must** see strategy submit (<a name="7002-SORD-073" href="#7002-SORD-073">7002-SORD-073</a>)
      if it is oco then submit strategy is not available (<a name="7002-SORD-081" href="#7002-SORD-081">7002-SORD-081</a>)
    - **must** see strategy cancel (<a name="7002-SORD-074" href="#7002-SORD-074">7002-SORD-074</a>)
  - **must** see expiry time/date (<a name="7002-SORD-075" href="#7002-SORD-075">7002-SORD-075</a>)

- **must** see an option to select oco for stop order limit and market (<a name="7002-SORD-082" href="#7002-SORD-082">7002-SORD-082</a>)
  - **must** see a type to select market or limit (<a name="7002-SORD-083" href="#7002-SORD-083">7002-SORD-083</a>)
  - **must** see for market type
    - **must** see rises above (<a name="7002-SORD-084" href="#7002-SORD-084">7002-SORD-084</a>)
    - **must** see falls below (<a name="7002-SORD-085" href="#7002-SORD-085">7002-SORD-085</a>)
    - **must** enter a trigger value (<a name="7002-SORD-086" href="#7002-SORD-086">7002-SORD-086</a>)
    - **must** select a trigger price (<a name="7002-SORD-087" href="#7002-SORD-087">7002-SORD-087</a>)
    - **must** select a trigger trailing percent offset (<a name="7002-SORD-088" href="#7002-SORD-088">7002-SORD-088</a>)
  - **must** see for limit type
    - **must** enter a price (<a name="7002-SORD-089" href="#7002-SORD-089">7002-SORD-089</a>)
    - **must** select a trigger direction (<a name="7002-SORD-090" href="#7002-SORD-090">7002-SORD-090</a>)
    - **must** see rises above (<a name="7002-SORD-099" href="#7002-SORD-099">7002-SORD-099</a>)
    - **must** see falls below (<a name="7002-SORD-091" href="#7002-SORD-091">7002-SORD-091</a>)
    - if the user has not set a preference: trigger direction **must** default to `opposite to the one selected in the stop order` (<a name="7002-SORD-092" href="#7002-SORD-092">7002-SORD-092</a>)
    - **must** enter a trigger value (<a name="7002-SORD-093" href="#7002-SORD-093">7002-SORD-093</a>)
    - **must** select a trigger type (<a name="7002-SORD-094" href="#7002-SORD-094">7002-SORD-094</a>)
    - **must** see a trigger price (<a name="7002-SORD-095" href="#7002-SORD-095">7002-SORD-095</a>)
    - **must** see a trigger trailing percent offset (<a name="7002-SORD-096" href="#7002-SORD-096">7002-SORD-096</a>)
  - if the user has not set a preference: trigger type **must** default to `price` (<a name="7002-SORD-097" href="#7002-SORD-097">7002-SORD-097</a>)
  - if the trigger price is already met on submission, **must** warn the user that the stop order will be triggered immediately (<a name="7002-SORD-098" href="#7002-SORD-098">7002-SORD-098</a>)

... so I can control in more detail how my order is executed

## Auto Populating a deal ticket non-manual methods

- TODO Populate by selecting a size/price in the order book
- TODO Populate by selecting a size/price in the chart
- TODO Populate by selecting a size/price in the depth chart
- TODO Input price as a % of account, given the current price field
- **should** be able to determine how much leverage I'd like (given general balance, and other inputs)

## See the potential consequences of an order before it is submit

... based on the current inputs I'd like an indication of the consequences of my order based on my position and the state of the market, I...

- **could** see my resulting open volume
- **could** see the amount this order might move the market in percentage terms
- **could** see what the new best prices of the market would be after placing this order (assuming my order moves the market)
- **could** see new volume weighted average entry price if not 0
- **could** see and indication the volume weighted price that this particular order
- **could** see an indication of how much of the order will trade when it hits the book and how much might remain passive
- **could** see a new liquidation level
- **could** see an estimate of the fees that will be paid (if any)
- **could** see my "position leverage" TODO - define this
- **could** see my "account leverage" TODO - define this
- **could** see an amount of realized Profit / Loss
- **could** see any change in margin requirements (if more or less margin will be required)
- **could** see the notional value of my order

... so that I can adjust my inputs before submitting

## Submit an order

... need to submit my order, when submitting my order, I...

- if not already connected: **must** see a prompt to [connect a Vega wallet](0002-WCON-connect_vega_wallet.md)

- **must** submit the [Vega submit order transaction](0013-WTXN-submit_vega_transaction.md). (<a name="7002-SORD-039" href="#7002-SORD-039">7002-SORD-039</a>)
- **must** always be able to submit regardless of market state, trading mode or account balances (<a name="7002-SORD-060" href="#7002-SORD-060">7002-SORD-060</a>)

- **must** see feedback on my order [status](https://docs.vega.xyz/docs/mainnet/grpc/vega/vega.proto#orderstatus) (not just transaction status above) (<a name="7002-SORD-040" href="#7002-SORD-040">7002-SORD-040</a>)
  - Active (aka Open) (<a name="7002-SORD-041" href="#7002-SORD-041">7002-SORD-041</a>)
  - Expired (<a name="7002-SORD-042" href="#7002-SORD-042">7002-SORD-042</a>)
  - Cancelled. see the txn that cancelled it and a link to the block explorer, if cancelled by a user transaction. (<a name="7002-SORD-043" href="#7002-SORD-043">7002-SORD-043</a>)
  - Stopped. see an explanation of why stopped (<a name="7002-SORD-044" href="#7002-SORD-044">7002-SORD-044</a>)
  - Partially filled. **must** see how much of the [size](9001-DATA-data_display.md#size) if filled/remaining (<a name="7002-SORD-045" href="#7002-SORD-045">7002-SORD-045</a>)
  - Filled. Must be able to see/link to all trades that were created from this order. (<a name="7002-SORD-046" href="#7002-SORD-046">7002-SORD-046</a>)
  - Rejected: **must** see the reason it was rejected (<a name="7002-SORD-047" href="#7002-SORD-047">7002-SORD-047</a>)
  - Parked: **must** see an explanation of why parked orders happen (<a name="7002-SORD-048" href="#7002-SORD-048">7002-SORD-048</a>)
- All feedback must be a subscription so is updated as the status changes (<a name="7002-SORD-053" href="#7002-SORD-053">7002-SORD-053</a>)
- **could** repeat the values that were submitted (order type + all fields)

... so that I am aware of the status of my order before seeing it in the [orders table](6002-MORD-manage_orders.md).

... so I get the sort of order, and price, I wish.

## Manage positions and order

After submitting orders I'll want to [manage orders](7003-MORD-manage_orders.md). If my orders resulted in a position I may wish to [manage positions](7004-POSI-positions.md)).

---

# Typical order scenarios to design/test for

Market in continuous trading:

- Limit order, Long, GTC, with a price that is lower than the current price
- Limit order, Short, GFN, that crosses the book but only gets a partial fill when order is processed
- Market order, IOC, that increases open volume (aka size of position)
- a limit order GFA when market is in Auction
- an limit that reduces exposure from something to 0
- a limit order, FOK, that squares and reverses e.g. I'm long 10, I short 20 to end short 10

Market in auction:

- Attempt Market order in Auction mode: should warn order is invalid
- Attempt limit order GFN when market is normally Continuous (but currently in auction), should warn that GFN will not work
