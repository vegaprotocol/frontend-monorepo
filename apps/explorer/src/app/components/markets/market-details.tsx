import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
  getMarketExpiryDateFormatted,
  t,
} from '@vegaprotocol/react-helpers';
import type { MarketInfoNoCandlesQuery } from '@vegaprotocol/market-info';
import { MarketInfoTable } from '@vegaprotocol/market-info';
import pick from 'lodash/pick';
import {
  MarketStateMapping,
  MarketTradingModeMapping,
} from '@vegaprotocol/types';
import { AssetDetailsTable, useAssetDataProvider } from '@vegaprotocol/assets';
import { Splash } from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

export const MarketDetails = ({
  market,
}: {
  market: MarketInfoNoCandlesQuery['market'];
}) => {
  const assetSymbol =
    market?.tradableInstrument.instrument.product?.settlementAsset.symbol;
  const assetId = useMemo(
    () => market?.tradableInstrument.instrument.product?.settlementAsset.id,
    [market]
  );
  const { data: asset } = useAssetDataProvider(assetId ?? '');

  if (!market) return null;

  const keyDetails = {
    ...pick(market, 'decimalPlaces', 'positionDecimalPlaces', 'tradingMode'),
    state: MarketStateMapping[market.state],
  };
  const assetDecimals =
    market.tradableInstrument.instrument.product.settlementAsset.decimals;

  const panels = [
    {
      title: t('Key details'),
      content: (
        <MarketInfoTable
          noBorder={false}
          data={{
            name: market.tradableInstrument.instrument.name,
            marketID: market.id,
            tradingMode:
              keyDetails.tradingMode &&
              MarketTradingModeMapping[keyDetails.tradingMode],
            marketDecimalPlaces: market.decimalPlaces,
            positionDecimalPlaces: market.positionDecimalPlaces,
            settlementAssetDecimalPlaces: assetDecimals,
          }}
        />
      ),
    },
    {
      title: t('Instrument'),
      content: (
        <MarketInfoTable
          noBorder={false}
          data={{
            marketName: market.tradableInstrument.instrument.name,
            code: market.tradableInstrument.instrument.code,
            productType:
              market.tradableInstrument.instrument.product.__typename,
            ...market.tradableInstrument.instrument.product,
          }}
        />
      ),
    },
    {
      title: t('Settlement asset'),
      content: asset ? (
        <AssetDetailsTable
          asset={asset}
          inline={true}
          noBorder={false}
          dtClassName="text-black dark:text-white text-ui !px-0 !font-normal"
          ddClassName="text-black dark:text-white text-ui !px-0 !font-normal max-w-full"
        />
      ) : (
        <Splash>{t('No data')}</Splash>
      ),
    },
    {
      title: t('Metadata'),
      content: (
        <MarketInfoTable
          noBorder={false}
          data={{
            expiryDate: getMarketExpiryDateFormatted(
              market.tradableInstrument.instrument.metadata.tags
            ),
            ...market.tradableInstrument.instrument.metadata.tags
              ?.map((tag) => {
                const [key, value] = tag.split(':');
                return { [key]: value };
              })
              .reduce((acc, curr) => ({ ...acc, ...curr }), {}),
          }}
        />
      ),
    },
    {
      title: t('Risk model'),
      content: (
        <MarketInfoTable
          noBorder={false}
          data={market.tradableInstrument.riskModel}
          unformatted={true}
          omits={[]}
        />
      ),
    },
    {
      title: t('Risk parameters'),
      content: (
        <MarketInfoTable
          noBorder={false}
          data={market.tradableInstrument.riskModel.params}
          unformatted={true}
          omits={[]}
        />
      ),
    },
    {
      title: t('Risk factors'),
      content: (
        <MarketInfoTable
          noBorder={false}
          data={market.riskFactors}
          unformatted={true}
          omits={['market', '__typename']}
        />
      ),
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
            decimalPlaces={assetDecimals}
          />
        </>
      ),
    })),
    {
      title: t('Liquidity monitoring parameters'),
      content: (
        <MarketInfoTable
          noBorder={false}
          data={{
            triggeringRatio:
              market.liquidityMonitoringParameters.triggeringRatio,
            ...market.liquidityMonitoringParameters.targetStakeParameters,
          }}
        />
      ),
    },
    {
      title: t('Liquidity price range'),
      content: (
        <MarketInfoTable
          noBorder={false}
          data={{
            liquidityPriceRange: formatNumberPercentage(
              new BigNumber(market.lpPriceRange).times(100)
            ),
            LPVolumeMin:
              market.data?.midPrice &&
              `${addDecimalsFormatNumber(
                new BigNumber(1)
                  .minus(market.lpPriceRange)
                  .times(market.data.midPrice)
                  .toString(),
                market.decimalPlaces
              )} ${assetSymbol}`,
            LPVolumeMax:
              market.data?.midPrice &&
              `${addDecimalsFormatNumber(
                new BigNumber(1)
                  .plus(market.lpPriceRange)
                  .times(market.data.midPrice)
                  .toString(),
                market.decimalPlaces
              )} ${assetSymbol}`,
          }}
        ></MarketInfoTable>
      ),
    },
    {
      title: t('Oracle'),
      content: (
        <MarketInfoTable
          noBorder={false}
          data={
            market.tradableInstrument.instrument.product.dataSourceSpecBinding
          }
        >
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
        </MarketInfoTable>
      ),
    },
  ];

  return (
    <>
      {panels.map((p) => (
        <div className="mb-3">
          <h2 className="font-alpha text-xl">{p.title}</h2>
          {p.content}
        </div>
      ))}
    </>
  );
};
