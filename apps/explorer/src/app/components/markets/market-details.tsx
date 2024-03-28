import { t } from '@vegaprotocol/i18n';
import type { MarketInfoWithData } from '@vegaprotocol/markets';
import {
  BaseAssetInfoPanel,
  LiquidationStrategyInfoPanel,
  LiquidityPriceRangeInfoPanel,
  LiquiditySLAParametersInfoPanel,
  MarginScalingFactorsPanel,
  PriceMonitoringBoundsInfoPanel,
  PriceMonitoringSettingsInfoPanel,
  QuoteAssetInfoPanel,
  SuccessionLineInfoPanel,
  getDataSourceSpecForSettlementData,
  getDataSourceSpecForTradingTermination,
  isSpot,
} from '@vegaprotocol/markets';
import {
  LiquidityInfoPanel,
  LiquidityMonitoringParametersInfoPanel,
  InstrumentInfoPanel,
  KeyDetailsInfoPanel,
  MetadataInfoPanel,
  OracleInfoPanel,
  RiskFactorsInfoPanel,
  RiskModelInfoPanel,
  SettlementAssetInfoPanel,
} from '@vegaprotocol/markets';
import type { DataSourceFragment } from '@vegaprotocol/markets';
import isEqual from 'lodash/isEqual';

export const MarketDetails = ({ market }: { market: MarketInfoWithData }) => {
  if (!market) return null;
  const { product } = market.tradableInstrument.instrument;
  const settlementDataSource = getDataSourceSpecForSettlementData(product);
  const terminationDataSource = getDataSourceSpecForTradingTermination(product);

  const getSigners = ({ data }: DataSourceFragment) => {
    if (data.sourceType.__typename === 'DataSourceDefinitionExternal') {
      const signers =
        ('signers' in data.sourceType.sourceType &&
          data.sourceType.sourceType.signers) ||
        [];

      return signers.map(({ signer }, i) => {
        return (
          (signer.__typename === 'ETHAddress' && signer.address) ||
          (signer.__typename === 'PubKey' && signer.key)
        );
      });
    }
    return [];
  };

  const showTwoOracles =
    settlementDataSource &&
    terminationDataSource &&
    isEqual(
      getSigners(settlementDataSource),
      getSigners(terminationDataSource)
    );

  const headerClassName = 'font-alpha calt text-xl mt-4 border-b-2 pb-2';

  return (
    <div>
      <h2 className={headerClassName}>{t('Key details')}</h2>
      <KeyDetailsInfoPanel market={market} />
      <h2 className={headerClassName}>{t('Instrument')}</h2>
      <InstrumentInfoPanel market={market} />
      {!isSpot(product) && (
        <>
          <h2 className={headerClassName}>{t('Settlement asset')}</h2>
          <SettlementAssetInfoPanel market={market} />
        </>
      )}
      {isSpot(product) && (
        <>
          <h2 className={headerClassName}>{t('Base asset')}</h2>
          <BaseAssetInfoPanel market={market} />
          <h2 className={headerClassName}>{t('Quote asset')}</h2>
          <QuoteAssetInfoPanel market={market} />
        </>
      )}
      <h2 className={headerClassName}>{t('Metadata')}</h2>
      <MetadataInfoPanel market={market} />
      {!isSpot(product) && (
        <>
          <h2 className={headerClassName}>{t('Risk model')}</h2>
          <RiskModelInfoPanel market={market} />
          <h2 className={headerClassName}>{t('Margin scaling factors')}</h2>
          <MarginScalingFactorsPanel market={market} />
          <h2 className={headerClassName}>{t('Risk factors')}</h2>
          <RiskFactorsInfoPanel market={market} />
        </>
      )}
      <h2 className={headerClassName}>{t('Price monitoring bounds')}</h2>
      <div className="mt-3">
        <PriceMonitoringBoundsInfoPanel market={market} />
      </div>
      <h2 className={headerClassName}>{t('Price monitoring settings')}</h2>
      <div className="mt-3">
        <PriceMonitoringSettingsInfoPanel market={market} />
      </div>
      {!isSpot(product) && (
        <>
          <h2 className={headerClassName}>{t('Liquidation strategy')}</h2>
          <LiquidationStrategyInfoPanel market={market} />
        </>
      )}
      <h2 className={headerClassName}>{t('Liquidity monitoring')}</h2>
      <LiquidityMonitoringParametersInfoPanel market={market} />
      <h2 className={headerClassName}>{t('Liquidity price range')}</h2>
      <LiquidityPriceRangeInfoPanel market={market} />
      <h2 className={headerClassName}>{t('Liquidity SLA protocol')}</h2>
      <LiquiditySLAParametersInfoPanel market={market} />
      <h2 className={headerClassName}>{t('Liquidity')}</h2>
      <LiquidityInfoPanel market={market} />
      {showTwoOracles ? (
        <>
          <h2 className={headerClassName}>{t('Settlement oracle')}</h2>
          <OracleInfoPanel market={market} type="settlementData" />
          <h2 className={headerClassName}>{t('Termination oracle')}</h2>
          <OracleInfoPanel market={market} type="termination" />
        </>
      ) : (
        <>
          <h2 className={headerClassName}>{t('Oracle')}</h2>
          <OracleInfoPanel market={market} type="settlementData" />
        </>
      )}
      {!isSpot(product) && (
        <>
          <h2 className={`${headerClassName} mb-4`}>{t('Succession line')}</h2>
          <SuccessionLineInfoPanel market={market} />
        </>
      )}
    </div>
  );
};
