import compact from 'lodash/compact';
import { MarketLink } from '../links';
import { type MarketState, MarketStateMapping } from '@vegaprotocol/types';
import OracleLink from '../links/oracle-link/oracle-link';
import type {
  ExplorerOracleForMarketQuery,
  ExplorerOracleFormMarketsQuery,
} from '../../routes/oracles/__generated__/OraclesForMarkets';
import { useState } from 'react';

export type OraclesTableProps = {
  data?: ExplorerOracleFormMarketsQuery | ExplorerOracleForMarketQuery;
};

const cellSpacing = 'px-3';

export function OraclesTable({ data }: OraclesTableProps) {
  const [hoveredOracle, setHoveredOracle] = useState('');

  return (
    <table className="text-left">
      <thead>
        <tr>
          <th className={cellSpacing}>Market</th>
          <th className={cellSpacing}>Type</th>
          <th className={cellSpacing}>State</th>
          <th className={cellSpacing}>Settlement</th>
          <th className={cellSpacing}>Termination</th>
        </tr>
      </thead>
      <tbody>
        {data?.marketsConnection?.edges
          ? data.marketsConnection.edges.map((o) => {
              let hasSeenOracleReports = false;
              let settlementOracle = '-';
              let settlementOracleStatus = '-';
              let terminationOracle = '-';
              let terminationOracleStatus = '-';

              const id = o?.node.id;
              if (!id) {
                return null;
              }

              if (
                o.node.tradableInstrument.instrument.product.__typename ===
                'Future'
              ) {
                settlementOracle =
                  o.node.tradableInstrument.instrument.product
                    .dataSourceSpecForSettlementData.id;
                terminationOracle =
                  o.node.tradableInstrument.instrument.product
                    .dataSourceSpecForTradingTermination.id;
                settlementOracleStatus =
                  o.node.tradableInstrument.instrument.product
                    .dataSourceSpecForSettlementData.status;
                terminationOracleStatus =
                  o.node.tradableInstrument.instrument.product
                    .dataSourceSpecForTradingTermination.status;
              } else if (
                o.node.tradableInstrument.instrument.product.__typename ===
                'Perpetual'
              ) {
                settlementOracle =
                  o.node.tradableInstrument.instrument.product
                    .dataSourceSpecForSettlementData.id;
                terminationOracle =
                  o.node.tradableInstrument.instrument.product
                    .dataSourceSpecForSettlementSchedule.id;
                settlementOracleStatus =
                  o.node.tradableInstrument.instrument.product
                    .dataSourceSpecForSettlementData.status;
                terminationOracleStatus =
                  o.node.tradableInstrument.instrument.product
                    .dataSourceSpecForSettlementSchedule.status;
              }
              const oracleInformationUnfiltered =
                data?.oracleSpecsConnection?.edges?.map((e) =>
                  e && e.node ? e.node : undefined
                ) || [];

              const oracleInformation = compact(oracleInformationUnfiltered)
                .filter(
                  (o) =>
                    o.dataConnection.edges &&
                    o.dataConnection.edges.length > 0 &&
                    (o.dataSourceSpec.spec.id === settlementOracle ||
                      o.dataSourceSpec.spec.id === terminationOracle)
                )
                .at(0);
              if (oracleInformation) {
                hasSeenOracleReports = true;
              }

              const oracleList = `${settlementOracle} ${terminationOracle}`;

              return (
                <tr
                  id={id}
                  key={id}
                  className={
                    hoveredOracle.length > 0 &&
                    oracleList.indexOf(hoveredOracle) > -1
                      ? 'bg-gray-100 dark:bg-gray-800'
                      : ''
                  }
                  data-testid="oracle-details"
                  data-oracles={oracleList}
                >
                  <td className={cellSpacing}>
                    <MarketLink id={id} />
                  </td>
                  <td className={cellSpacing}>
                    {o.node.tradableInstrument.instrument.product.__typename}
                  </td>
                  <td className={cellSpacing}>
                    {MarketStateMapping[o.node.state as MarketState]}
                  </td>
                  <td
                    className={
                      hoveredOracle.length > 0 &&
                      hoveredOracle === settlementOracle
                        ? `indent-1 ${cellSpacing}`
                        : cellSpacing
                    }
                  >
                    <OracleLink
                      id={settlementOracle}
                      status={settlementOracleStatus}
                      hasSeenOracleReports={hasSeenOracleReports}
                      onMouseOver={() => setHoveredOracle(settlementOracle)}
                      onMouseOut={() => setHoveredOracle('')}
                    />
                  </td>
                  <td
                    className={
                      hoveredOracle.length > 0 &&
                      hoveredOracle === terminationOracle
                        ? `indent-1 ${cellSpacing}`
                        : cellSpacing
                    }
                  >
                    <OracleLink
                      id={terminationOracle}
                      status={terminationOracleStatus}
                      hasSeenOracleReports={hasSeenOracleReports}
                      onMouseOver={() => setHoveredOracle(terminationOracle)}
                      onMouseOut={() => setHoveredOracle('')}
                    />
                  </td>
                </tr>
              );
            })
          : null}
      </tbody>
    </table>
  );
}
