import { t } from '@vegaprotocol/i18n';
import type { MarketInfoWithData } from '@vegaprotocol/markets';
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

  const oraclePanels = isEqual(
    getSigners(settlementData),
    getSigners(terminationData)
  )
    ? [
        {
          title: t('Settlement Oracle'),
          content: (
            <OracleInfoPanel
              noBorder={false}
              market={market}
              type="settlementData"
            />
          ),
        },
        {
          title: t('Termination Oracle'),
          content: (
            <OracleInfoPanel
              noBorder={false}
              market={market}
              type="termination"
            />
          ),
        },
      ]
    : [
        {
          title: t('Oracle'),
          content: (
            <OracleInfoPanel
              noBorder={false}
              market={market}
              type="settlementData"
            />
          ),
        },
      ];

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
            data={{
              maxValidPrice: trigger.maxValidPrice,
              minValidPrice: trigger.minValidPrice,
            }}
            decimalPlaces={market.decimalPlaces}
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
    ...oraclePanels,
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
