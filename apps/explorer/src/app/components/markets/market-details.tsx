import { t } from '@vegaprotocol/i18n';
import type { MarketInfoWithData } from '@vegaprotocol/market-info';
import { LiquidityInfoPanel } from '@vegaprotocol/market-info';
import { LiquidityMonitoringParametersInfoPanel } from '@vegaprotocol/market-info';
import {
  InstrumentInfoPanel,
  KeyDetailsInfoPanel,
  LiquidityPriceRangeInfoPanel,
  MetadataInfoPanel,
  OracleInfoPanel,
  RiskFactorsInfoPanel,
  RiskModelInfoPanel,
  RiskParametersInfoPanel,
  SettlementAssetInfoPanel,
} from '@vegaprotocol/market-info';
import { MarketInfoTable } from '@vegaprotocol/market-info';
import { Link } from 'react-router-dom';

export const MarketDetails = ({ market }: { market: MarketInfoWithData }) => {
  if (!market) return null;

  const panels = [
    {
      title: t('Key details'),
      content: <KeyDetailsInfoPanel noBorder={false} market={market} />,
    },
    {
      title: t('Instrument'),
      content: <InstrumentInfoPanel noBorder={false} market={market} />,
    },
    {
      title: t('Settlement asset'),
      content: <SettlementAssetInfoPanel market={market} noBorder={false} />,
    },
    {
      title: t('Metadata'),
      content: <MetadataInfoPanel noBorder={false} market={market} />,
    },
    {
      title: t('Risk model'),
      content: <RiskModelInfoPanel noBorder={false} market={market} />,
    },
    {
      title: t('Risk parameters'),
      content: <RiskParametersInfoPanel noBorder={false} market={market} />,
    },
    {
      title: t('Risk factors'),
      content: <RiskFactorsInfoPanel noBorder={false} market={market} />,
    },
    ...(market.priceMonitoringSettings?.parameters?.triggers || []).map(
      (trigger, i) => ({
        title: t(`Price monitoring trigger ${i + 1}`),
        content: <MarketInfoTable noBorder={false} data={trigger} />,
      })
    ),
    ...(market.data?.priceMonitoringBounds || []).map((trigger, i) => ({
      title: t(`Price monitoring bound ${i + 1}`),
      content: (
        <>
          <MarketInfoTable
            noBorder={false}
            data={trigger}
            decimalPlaces={market.decimalPlaces}
            omits={['referencePrice', '__typename']}
          />
          <MarketInfoTable
            noBorder={false}
            data={{ referencePrice: trigger.referencePrice }}
            decimalPlaces={
              market.tradableInstrument.instrument.product.settlementAsset
                .decimals
            }
          />
        </>
      ),
    })),
    {
      title: t('Liquidity monitoring parameters'),
      content: (
        <LiquidityMonitoringParametersInfoPanel
          noBorder={false}
          market={market}
        />
      ),
    },
    {
      title: t('Liquidity'),
      content: <LiquidityInfoPanel market={market} noBorder={false} />,
    },
    {
      title: t('Liquidity price range'),
      content: (
        <LiquidityPriceRangeInfoPanel market={market} noBorder={false} />
      ),
    },
    {
      title: t('Oracle'),
      content: (
        <OracleInfoPanel noBorder={false} market={market}>
          <Link
            className="text-xs hover:underline"
            to={`/oracles#${market.tradableInstrument.instrument.product.dataSourceSpecForSettlementData.id}`}
          >
            {t('View settlement data oracle specification')}
          </Link>
          <Link
            className="text-xs hover:underline"
            to={`/oracles#${market.tradableInstrument.instrument.product.dataSourceSpecForTradingTermination.id}`}
          >
            {t('View termination oracle specification')}
          </Link>
        </OracleInfoPanel>
      ),
    },
  ];

  return (
    <>
      {panels.map((p) => (
        <div key={p.title} className="mb-3">
          <h2 className="font-alpha calt text-xl">{p.title}</h2>
          {p.content}
        </div>
      ))}
    </>
  );
};
