import { t } from '@vegaprotocol/i18n';
import type { MarketInfoWithData } from '@vegaprotocol/markets';
import {
  LiquiditySLAParametersInfoPanel,
  PriceMonitoringBoundsInfoPanel,
  SuccessionLineInfoPanel,
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
  RiskParametersInfoPanel,
  SettlementAssetInfoPanel,
} from '@vegaprotocol/markets';
import { MarketInfoTable } from '@vegaprotocol/markets';
import type { DataSourceDefinition } from '@vegaprotocol/types';
import isEqual from 'lodash/isEqual';

export const MarketDetails = ({ market }: { market: MarketInfoWithData }) => {
  if (!market) return null;

  const settlementData =
    market.tradableInstrument.instrument.product.__typename === 'Future' ||
    market.tradableInstrument.instrument.product.__typename === 'Perpetual'
      ? (market.tradableInstrument.instrument.product
          .dataSourceSpecForSettlementData.data as DataSourceDefinition)
      : undefined;
  const terminationData =
    market.tradableInstrument.instrument.product.__typename === 'Future'
      ? (market.tradableInstrument.instrument.product
          .dataSourceSpecForTradingTermination.data as DataSourceDefinition)
      : undefined;

  const getSigners = (data: DataSourceDefinition) => {
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
    settlementData &&
    terminationData &&
    isEqual(getSigners(settlementData), getSigners(terminationData));

  const headerClassName = 'font-alpha calt text-xl mt-4 border-b-2 pb-2';

  return (
    <div>
      <h2 className={headerClassName}>{t('Key details')}</h2>
      <KeyDetailsInfoPanel market={market} />
      <h2 className={headerClassName}>{t('Instrument')}</h2>
      <InstrumentInfoPanel market={market} />
      <h2 className={headerClassName}>{t('Settlement asset')}</h2>
      <SettlementAssetInfoPanel market={market} />
      <h2 className={headerClassName}>{t('Metadata')}</h2>
      <MetadataInfoPanel market={market} />
      <h2 className={headerClassName}>{t('Risk model')}</h2>
      <RiskModelInfoPanel market={market} />
      <h2 className={headerClassName}>{t('Risk parameters')}</h2>
      <RiskParametersInfoPanel market={market} />
      <h2 className={headerClassName}>{t('Risk factors')}</h2>
      <RiskFactorsInfoPanel market={market} />
      {(market.data?.priceMonitoringBounds || []).map((trigger, i) => (
        <>
          <h2 className={headerClassName}>
            {t('Price monitoring bounds %s', [(i + 1).toString()])}
          </h2>
          <PriceMonitoringBoundsInfoPanel
            market={market}
            triggerIndex={i + 1}
          />
        </>
      ))}
      {(market.priceMonitoringSettings?.parameters?.triggers || []).map(
        (trigger, i) => (
          <>
            <h2 className={headerClassName}>
              {t('Price monitoring settings %s', [(i + 1).toString()])}
            </h2>
            <MarketInfoTable data={trigger} key={i} />
          </>
        )
      )}
      <h2 className={headerClassName}>{t('Liquidity monitoring')}</h2>
      <LiquidityMonitoringParametersInfoPanel market={market} />
      <h2 className={headerClassName}>{t('Liquidity SLA Parameters')}</h2>
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
      <h2 className={`${headerClassName} mb-4`}>{t('Succession line')}</h2>
      <SuccessionLineInfoPanel market={market} />
    </div>
  );
};
