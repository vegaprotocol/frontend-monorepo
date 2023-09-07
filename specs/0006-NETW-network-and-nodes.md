# Select network and nodes

## Startup

- **Must** automatically select a node from the environments network config stored in the [networks repo](https://github.com/vegaprotocol/networks) (<a name="0006-NETW-001" href="#0006-NETW-001">0006-NETW-001</a>)

## Network switcher

- **Must** see current network (<a name="0006-NETW-002" href="#0006-NETW-002">0006-NETW-002</a>)
- **Must** be able to change network (<a name="0006-NETW-003" href="#0006-NETW-003">0006-NETW-003</a>)

## Node health

- **Must** see node status
  - Operational if node is less than 3 blocks behind (<a name="0006-NETW-004" href="#0006-NETW-004">0006-NETW-004</a>)
  - Warning if greater than 3 blocks behind (<a name="0006-NETW-005" href="#0006-NETW-005">0006-NETW-005</a>)
  - Warning if vega time is 3 seconds behind current time (<a name="0006-NETW-006" href="#0006-NETW-006">0006-NETW-006</a>)
  - Prominent error if vega time is 10 seconds behind current time (<a name="0006-NETW-007" href="#0006-NETW-007">0006-NETW-007</a>)
- **Must** see current connected node (<a name="0006-NETW-008" href="#0006-NETW-008">0006-NETW-008</a>)
- **Must** see current block height (<a name="0006-NETW-009" href="#0006-NETW-009">0006-NETW-009</a>)
- **Must** see block height progressing (<a name="0006-NETW-010" href="#0006-NETW-010">0006-NETW-010</a>)
- **Must** see link to status and incidents site (<a name="0006-NETW-011" href="#0006-NETW-011">0006-NETW-011</a>)

## Node switcher

- **Must** be able to click on current node to open node switcher dialog (<a name="0006-NETW-012" href="#0006-NETW-012">0006-NETW-012</a>)
- In the node dialog

  - **Must** must see all nodes provided by the [network config](https://github.com/vegaprotocol/networks) (<a name="0006-NETW-013" href="#0006-NETW-013">0006-NETW-013</a>)
  - For each node
    - **Must** see the response time of the node (<a name="0006-NETW-014" href="#0006-NETW-014">0006-NETW-014</a>)
    - **Must** see the current block height (<a name="0006-NETW-015" href="#0006-NETW-015">0006-NETW-015</a>)
    - **Must** see if subscriptions are working for that node (<a name="0006-NETW-016" href="#0006-NETW-016">0006-NETW-016</a>)
  - **Must** be able to select and connect to any node, regardless of response time, block height or subscription status (<a name="0006-NETW-017" href="#0006-NETW-017">0006-NETW-017</a>)
  - **Must** be able to select 'other' to input a node address and connect to it (<a name="0006-NETW-018" href="#0006-NETW-018">0006-NETW-018</a>)
  - **Must** have disabled connect button if 'other' is selected but no url has been entered (<a name="0006-NETW-019" href="#0006-NETW-019">0006-NETW-019</a>)
  - **Must** have disabled connect button if selected node is the current node (<a name="0006-NETW-020" href="#0006-NETW-020">0006-NETW-020</a>)

  ## Block Explorer

  - **Must** show all possible network parameters (<a name="0006-NETW-021" href="#0006-NETW-021">0006-NETW-021</a>)
  - **Must** I can see network parameters grouped by type (<a name="0006-NETW-022" href="#0006-NETW-022">0006-NETW-022</a>)
  - **Must** Network parameter headings act as linkable anchors i.e. a third party website can link directly to a "section" of the network parameter page (<a name="0006-NETW-023" href="#0006-NETW-023">0006-NETW-022</a>)
