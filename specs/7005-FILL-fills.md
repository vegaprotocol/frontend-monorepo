# Fills

## Fills Data Grid

- **Must** see the [market](9001-DATA-data_display.md#market) the fill occurred in (<a name="7005-FILL-001" href="#7005-FILL-001">7005-FILL-001</a>)
- **Must** see the [size](9001-DATA-data_display.md#size) of the fill (<a name="7005-FILL-002" href="#7005-FILL-002">7005-FILL-002</a>)
  - **Must** see indication if the current party was the buyer (<a name="7005-FILL-003" href="#7005-FILL-003">7005-FILL-003</a>)
  - **Must** see indication if the current party was the seller (<a name="7005-FILL-004" href="#7005-FILL-004">7005-FILL-004</a>)
- **Must** see the [price](9001-DATA-data_display.md#quote-price) of the fill (<a name="7005-FILL-005" href="#7005-FILL-005">7005-FILL-005</a>)
- **Could** see the notional value of the fill (<a name="7005-FILL-006" href="#7005-FILL-006">7005-FILL-006</a>)
- **Must** see the [fee](9001-DATA-data_display.md#asset-balances) that applies for current party for the fill (<a name="7005-FILL-007" href="#7005-FILL-007">7005-FILL-007</a>)

### Continuous Trading

- **Must** see the role of the user (taker, maker or n/a) (<a name="7005-FILL-008" href="#7005-FILL-008">7005-FILL-008</a>)

### Auction

TBD. Currently any trade made during auction will result in the both parties having the role of 'taker'. This may be incorrect and is being investigated.
