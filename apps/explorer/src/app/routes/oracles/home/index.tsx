import compact from 'lodash/compact';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { RouteTitle } from '../../../components/route-title';
import { t } from '@vegaprotocol/i18n';
import { useDocumentTitle } from '../../../hooks/use-document-title';
import { useScrollToLocation } from '../../../hooks/scroll-to-location';
import { useExplorerOracleFormMarketsQuery } from '../__generated__/OraclesForMarkets';
import { MarketLink } from '../../../components/links';
import { OracleLink } from '../../../components/links/oracle-link/oracle-link';
import { useState } from 'react';
import { MarketStateMapping } from '@vegaprotocol/types';
import type { MarketState } from '@vegaprotocol/types';

const cellSpacing = 'px-3';

const Oracles = () => {
  const { data, loading, error } = useExplorerOracleFormMarketsQuery({
    errorPolicy: 'ignore',
  });

  useDocumentTitle(['Oracles']);
  useScrollToLocation();

  const [hoveredOracle, setHoveredOracle] = useState('');

  return (
    <section>
      <RouteTitle data-testid="oracle-specs-heading">{t('Oracles')}</RouteTitle>
      <AsyncRenderer
        data={data}
        loading={loading}
        error={error}
        loadingMessage={t('Loading oracle data...')}
        errorMessage={t('Oracle data could not be loaded')}
        noDataMessage={t('No oracles found')}
        noDataCondition={(data) =>
          !data?.oracleSpecsConnection?.edges ||
          data.oracleSpecsConnection.edges?.length === 0
        }
      >
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
                    .filter((o) => o.dataSourceSpec.spec.id === id)
                    .at(0);
                  if (
                    oracleInformation?.dataConnection.edges?.length &&
                    oracleInformation.dataConnection.edges.length > 0
                  ) {
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
                          ? 'bg-gray-100'
                          : ''
                      }
                      data-testid="oracle-details"
                      data-oracles={oracleList}
                    >
                      <td className={cellSpacing}>
                        <MarketLink id={id} />
                      </td>
                      <td className={cellSpacing}>
                        {
                          o.node.tradableInstrument.instrument.product
                            .__typename
                        }
                      </td>
                      <td className={cellSpacing}>
                        {MarketStateMapping[o.node.state as MarketState]}
                      </td>
                      <td className={cellSpacing}>
                        <OracleLink
                          id={settlementOracle}
                          status={settlementOracleStatus}
                          hasSeenOracleReports={hasSeenOracleReports}
                          onMouseOver={() => setHoveredOracle(settlementOracle)}
                          onMouseOut={() => setHoveredOracle('')}
                        />
                      </td>
                      <td className={cellSpacing}>
                        <OracleLink
                          id={terminationOracle}
                          status={terminationOracleStatus}
                          hasSeenOracleReports={hasSeenOracleReports}
                          onMouseOver={() =>
                            setHoveredOracle(terminationOracle)
                          }
                          onMouseOut={() => setHoveredOracle('')}
                        />
                      </td>
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
      </AsyncRenderer>
    </section>
  );
};

export default Oracles;
