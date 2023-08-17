# Find markets

## Closed Markets

- **Must** see market's instrument code (<a name="6001-MARK-001" href="#6001-MARK-001">6001-MARK-001</a>)
- **Must** see product type of market's instrument near to instrument code (of Market and Successor market both, if there are present) (<a name="6001-MARK-071" href="#6001-MARK-071">6001-MARK-071</a>)
- **Must** see market's instrument name (sometimes labelled 'description') (<a name="6001-MARK-002" href="#6001-MARK-002">6001-MARK-002</a>)
- **Must** see status (<a name="6001-MARK-003" href="#6001-MARK-003">6001-MARK-003</a>)
- **Must** see the settlement date (<a name="6001-MARK-004" href="#6001-MARK-004">6001-MARK-004</a>)
  - **Must** use `marketTimestamps.closed` field if market is indeed closed (<a name="6001-MARK-005" href="#6001-MARK-005">6001-MARK-005</a>)
  - **Must** fallback to using the `settlement-expiry-date:<date>` if market is not fully settled but trading is terminated (<a name="6001-MARK-006" href="#6001-MARK-006">6001-MARK-006</a>)
  - **Must** indicate if the date shown is 'expected' (metadata value) or if it is the true closed datetime (`marketTimestamps.closed`) (<a name="6001-MARK-007" href="#6001-MARK-007">6001-MARK-007</a>)
  - **Must** show the date formatted for the user's locale (<a name="6001-MARK-008" href="#6001-MARK-008">6001-MARK-008</a>)
  - **Must** link to the trading termination oracle spec (<a name="6001-MARK-009" href="#6001-MARK-009">6001-MARK-009</a>)
  - **Could** show the settlement date as words relative to now (E.G. '2 days ago') (<a name="6001-MARK-010" href="#6001-MARK-010">6001-MARK-010</a>)
- **Must** show the last best bid price (<a name="6001-MARK-011" href="#6001-MARK-011">6001-MARK-011</a>)
- **Must** show the last best offer price (<a name="6001-MARK-012" href="#6001-MARK-012">6001-MARK-012</a>)
- **Must** show the final mark price (<a name="6001-MARK-013" href="#6001-MARK-013">6001-MARK-013</a>)
- **Must** show the settlement price (<a name="6001-MARK-014" href="#6001-MARK-014">6001-MARK-014</a>)
  - **Must** link to the settlement data oracle spec (<a name="6001-MARK-015" href="#6001-MARK-015">6001-MARK-015</a>)
  - **Must** retrieve settlement data from corresponding oracle spec (<a name="6001-MARK-016" href="#6001-MARK-016">6001-MARK-016</a>)
- **Must** show the settlement asset (<a name="6001-MARK-018" href="#6001-MARK-018">6001-MARK-018</a>)
  - **Must** be able to view full asset details (<a name="6001-MARK-019" href="#6001-MARK-019">6001-MARK-019</a>)
- **Must** provide a way to copy the market ID (<a name="6001-MARK-020" href="#6001-MARK-020">6001-MARK-020</a>)
- **Must** show when a closed market has a successor market (<a name="6001-MARK-068" href="#6001-MARK-068">6001-MARK-068</a>)
- **Must** get to a successor market from a closed market i.e. there is a link (<a name="6001-MARK-069" href="#6001-MARK-069">6001-MARK-069</a>)

- if there is no markets:
  - **Must** show No markets info (<a name="6001-MARK-034" href="#6001-MARK-034">6001-MARK-034</a>)

## Market Selector

- **Must** see market's instrument code (<a name="6001-MARK-021" href="#6001-MARK-021">6001-MARK-021</a>)
- **Must** see market's instrument name (sometimes labelled 'description') (<a name="6001-MARK-022" href="#6001-MARK-022">6001-MARK-022</a>)
- **Must** see 24hr price change (<a name="6001-MARK-023" href="#6001-MARK-023">6001-MARK-023</a>)
- **Must** see current price (<a name="6001-MARK-024" href="#6001-MARK-024">6001-MARK-024</a>)
- **Must** price movements over last 24hr (sparkline) (<a name="6001-MARK-025" href="#6001-MARK-025">6001-MARK-025</a>)
- **Must** be linked to all markets page (<a name="6001-MARK-026" href="#6001-MARK-026">6001-MARK-026</a>)
- **Must** be able to filter by product type (<a name="6001-MARK-027" href="#6001-MARK-027">6001-MARK-027</a>)
- **Must** be able to filter by settlement asset (<a name="6001-MARK-028" href="#6001-MARK-028">6001-MARK-028</a>)
- **Must** be able to search by instrument code and instrument name (<a name="6001-MARK-029" href="#6001-MARK-029">6001-MARK-029</a>)
- **Must** be able to sort
  - by top gaining market (<a name="6001-MARK-030" href="#6001-MARK-030">6001-MARK-030</a>)
  - by top losing market (<a name="6001-MARK-031" href="#6001-MARK-031">6001-MARK-031</a>)
  - by newest markets (opening timestamp) (<a name="6001-MARK-032" href="#6001-MARK-032">6001-MARK-032</a>)
- **Must** be able to close and open the market selector (<a name="6001-MARK-066" href="#6001-MARK-066">6001-MARK-066</a>)
- **Must** must change color and have + or negative suffix of the price change and change color for the sparkline (<a name="6001-MARK-067" href="#6001-MARK-067">6001-MARK-067</a>)
- **Must** be default tab "All" where there's no filtering by product. (<a name="6001-MARK-070" href="#6001-MARK-070">6001-MARK-070</a>)
- If tab "All" is selected **Must** see product type of market's instrument near to instrument code (<a name="6001-MARK-072" href="#6001-MARK-072">6001-MARK-072</a>)

## All Markets

- **Must** see market's instrument code (<a name="6001-MARK-035" href="#6001-MARK-035">6001-MARK-035</a>)
- **Must** see product type of market's instrument near to instrument code (of Market and Successor market both, if there are present) (<a name="6001-MARK-073" href="#6001-MARK-073">6001-MARK-073</a>)
- **Must** see market's instrument name (sometimes labelled 'description') (<a name="6001-MARK-036" href="#6001-MARK-036">6001-MARK-036</a>)
- **Must** see Trading mode (<a name="6001-MARK-037" href="#6001-MARK-037">6001-MARK-037</a>)
- **Must** see status (<a name="6001-MARK-038" href="#6001-MARK-038">6001-MARK-038</a>)
- **Must** show the last best bid price (<a name="6001-MARK-039" href="#6001-MARK-039">6001-MARK-039</a>)
- **Must** show the last best offer price (<a name="6001-MARK-040" href="#6001-MARK-040">6001-MARK-040</a>)
- **Must** show the final mark price (<a name="6001-MARK-041" href="#6001-MARK-041">6001-MARK-041</a>)
- **Must** show the settlement asset (<a name="6001-MARK-042" href="#6001-MARK-042">6001-MARK-042</a>)
  - **Must** be able to view full asset details (<a name="6001-MARK-043" href="#6001-MARK-043">6001-MARK-043</a>)
- **Must** see status action menu (<a name="6001-MARK-044" href="#6001-MARK-044">6001-MARK-044</a>)

  - **Must** provide a way to copy the market ID (<a name="6001-MARK-045" href="#6001-MARK-045">6001-MARK-045</a>)
  - **Must** provide a way to view on Explorer (<a name="6001-MARK-046" href="#6001-MARK-046">6001-MARK-046</a>)
  - **Must** provide a way to view asset (<a name="6001-MARK-047" href="#6001-MARK-047">6001-MARK-047</a>)
  - **Must** be able to sort each column by asc and dsc (<a name="6001-MARK-064" href="#6001-MARK-064">6001-MARK-064</a>)
  - **Must** be able to drag and drop column names to re order (<a name="6001-MARK-065" href="#6001-MARK-065">6001-MARK-065</a>)

- if there is no markets:
  - **Must** show No markets info (<a name="6001-MARK-048" href="#6001-MARK-048">6001-MARK-048</a>)

## Proposed markets

- **Must** see market's instrument code (<a name="6001-MARK-049" href="#6001-MARK-049">6001-MARK-049</a>)
- **Must** see product type of market's instrument near to instrument code (of Market and Successor market both, if there are present) (<a name="6001-MARK-074" href="#6001-MARK-074">6001-MARK-074</a>)
- **Must** see market's instrument name (sometimes labelled 'description') (<a name="6001-MARK-050" href="#6001-MARK-050">6001-MARK-050</a>)
- **Must** show the settlement asset (<a name="6001-MARK-051" href="#6001-MARK-051">6001-MARK-051</a>)
- **Must** see state (<a name="6001-MARK-052" href="#6001-MARK-052">6001-MARK-052</a>)
  - **Must** see if proposal is set to pass or fail (<a name="6001-MARK-053" href="#6001-MARK-053">6001-MARK-053</a>)
- **Must** see voting (<a name="6001-MARK-054" href="#6001-MARK-054">6001-MARK-054</a>)
  - **Must** see if proposal has enough votes (<a name="6001-MARK-055" href="#6001-MARK-055">6001-MARK-055</a>)
- **Must** see closing date (<a name="6001-MARK-056" href="#6001-MARK-056">6001-MARK-056</a>)
- **Must** see enactment date (<a name="6001-MARK-057" href="#6001-MARK-057">6001-MARK-057</a>)
- **Must** see status action menu (<a name="6001-MARK-058" href="#6001-MARK-058">6001-MARK-058</a>)
  - **Must** provide a way to view proposal (<a name="6001-MARK-059" href="#6001-MARK-059">6001-MARK-059</a>)
- **Must** provide a way to propose a new market (<a name="6001-MARK-060" href="#6001-MARK-060">6001-MARK-060</a>)
- **Must** be able to sort each column by asc and dsc (<a name="6001-MARK-062" href="#6001-MARK-062">6001-MARK-062</a>)
- **Must** be able to drag and drop column names to re order (<a name="6001-MARK-063" href="#6001-MARK-063">6001-MARK-063</a>)

- if there is no markets:
  - **Must** show No data info (<a name="6001-MARK-061" href="#6001-MARK-061">6001-MARK-061</a>)
