import type { MarketInfoWithData } from '@vegaprotocol/markets';
import { PriceMonitoringBoundsInfoPanel } from '@vegaprotocol/markets';
import {
  LiquidityInfoPanel,
  LiquidityMonitoringParametersInfoPanel,
  InstrumentInfoPanel,
  KeyDetailsInfoPanel,
  LiquidityPriceRangeInfoPanel,
  MetadataInfoPanel,
  OracleInfoPanel,
  RiskFactorsInfoPanel,
  RiskModelInfoPanel,
  RiskParametersInfoPanel,
  SettlementAssetInfoPanel,
} from '@vegaprotocol/markets';
import { MarketInfoTable } from '@vegaprotocol/markets';
import type { DataSourceDefinition } from '@vegaprotocol/types';
import isEqual from 'lodash/isEqual';

export const MarketDetails = ({ market }: { market: MarketInfoWithData }) => {
  if (!market) return null;

  const settlementData = market.tradableInstrument.instrument.product
    .dataSourceSpecForSettlementData.data as DataSourceDefinition;
  const terminationData = market.tradableInstrument.instrument.product
    .dataSourceSpecForTradingTermination.data as DataSourceDefinition;

  const getSigners = (data: DataSourceDefinition) => {
    if (data.sourceType.__typename === 'DataSourceDefinitionExternal') {
      const signers = data.sourceType.sourceType.signers || [];

      return signers.map(({ signer }, i) => {
        return (
          (signer.__typename === 'ETHAddress' && signer.address) ||
          (signer.__typename === 'PubKey' && signer.key)
        );
      });
    }
    return [];
  };

  const showTwoOracles = isEqual(
    getSigners(settlementData),
    getSigners(terminationData)
  );

  return (
    <div>
      <KeyDetailsInfoPanel noBorder={false} showTitle={true} market={market} />
      <InstrumentInfoPanel noBorder={false} showTitle={true} market={market} />
      <SettlementAssetInfoPanel
        noBorder={false}
        showTitle={true}
        market={market}
      />
      <MetadataInfoPanel noBorder={false} showTitle={true} market={market} />
      <RiskModelInfoPanel noBorder={false} showTitle={true} market={market} />
      <RiskParametersInfoPanel
        noBorder={false}
        showTitle={true}
        market={market}
      />
      <RiskFactorsInfoPanel
        noBorder={false}
        showTitle={true}
        market={{ riskFactors: market.riskFactors }}
      />
      {(market.data?.priceMonitoringBounds || []).map((trigger, i) => (
        <PriceMonitoringBoundsInfoPanel
          noBorder={false}
          showTitle={true}
          market={market}
          triggerIndex={i + 1}
        />
      ))}
      {(market.priceMonitoringSettings?.parameters?.triggers || []).map(
        (trigger, i) => (
          <MarketInfoTable noBorder={false} data={trigger} key={i} />
        )
      )}
      <LiquidityMonitoringParametersInfoPanel
        noBorder={false}
        showTitle={true}
        market={market}
      />
      <LiquidityInfoPanel market={market} noBorder={false} showTitle={true} />
      <LiquidityPriceRangeInfoPanel
        market={market}
        noBorder={false}
        showTitle={true}
      />
      {showTwoOracles ? (
        <>
          <OracleInfoPanel
            noBorder={false}
            showTitle={true}
            market={market}
            type="settlementData"
          />
          <OracleInfoPanel
            noBorder={false}
            showTitle={true}
            market={market}
            type="termination"
          />
        </>
      ) : (
        <OracleInfoPanel
          noBorder={false}
          showTitle={true}
          market={market}
          type="settlementData"
        />
      )}
    </div>
  );
};
