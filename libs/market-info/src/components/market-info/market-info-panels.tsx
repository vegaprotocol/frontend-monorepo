import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import { AssetDetailsTable, useAssetDataProvider } from '@vegaprotocol/assets';
import { t } from '@vegaprotocol/i18n';
import {
  calcCandleVolume,
  totalFeesPercentage,
} from '@vegaprotocol/market-list';
import { Splash } from '@vegaprotocol/ui-toolkit';
import {
  addDecimalsFormatNumber,
  formatNumber,
  formatNumberPercentage,
  getMarketExpiryDateFormatted,
} from '@vegaprotocol/utils';
import type { Get } from 'type-fest';
import { MarketInfoTable } from './info-key-value-table';
import type {
  MarketInfo,
  MarketInfoWithData,
  MarketInfoWithDataAndCandles,
} from './market-info-data-provider';
import BigNumber from 'bignumber.js';
import { MarketTradingModeMapping } from '@vegaprotocol/types';

type PanelProps = Pick<
  ComponentProps<typeof MarketInfoTable>,
  'children' | 'noBorder'
>;

type MarketInfoProps = {
  market: MarketInfo;
};

type MarketInfoWithDataProps = {
  market: MarketInfoWithData;
};

type MarketInfoWithDataAndCandlesProps = {
  market: MarketInfoWithDataAndCandles;
};

export const CurrentFeesInfoPanel = ({
  market,
  ...props
}: MarketInfoProps & PanelProps) => (
  <>
    <MarketInfoTable
      data={{
        ...market.fees.factors,
        totalFees: totalFeesPercentage(market.fees.factors),
      }}
      asPercentage={true}
      {...props}
    />
    <p className="text-xs">
      {t(
        'All fees are paid by price takers and are a % of the trade notional value. Fees are not paid during auction uncrossing.'
      )}
    </p>
  </>
);

export const MarketPriceInfoPanel = ({
  market,
  ...props
}: MarketInfoWithDataProps & PanelProps) => {
  const assetSymbol =
    market?.tradableInstrument.instrument.product?.settlementAsset.symbol || '';
  const quoteUnit =
    market?.tradableInstrument.instrument.product?.quoteName || '';
  return (
    <>
      <MarketInfoTable
        data={{
          markPrice: market.data?.markPrice,
          bestBidPrice: market.data?.bestBidPrice,
          bestOfferPrice: market.data?.bestOfferPrice,
          quoteUnit: market.tradableInstrument.instrument.product.quoteName,
        }}
        decimalPlaces={market.decimalPlaces}
        {...props}
      />
      <p className="text-xs mt-4">
        {t(
          'There is 1 unit of the settlement asset (%s) to every 1 quote unit (%s).',
          [assetSymbol, quoteUnit]
        )}
      </p>
    </>
  );
};

export const MarketVolumeInfoPanel = ({
  market,
  ...props
}: MarketInfoWithDataAndCandlesProps & PanelProps) => {
  const last24hourVolume = market.candles && calcCandleVolume(market.candles);

  const dash = (value: string | undefined) =>
    value && value !== '0' ? value : '-';

  return (
    <MarketInfoTable
      data={{
        '24hourVolume': dash(last24hourVolume),
        openInterest: dash(market.data?.openInterest),
        bestBidVolume: dash(market.data?.bestBidVolume),
        bestOfferVolume: dash(market.data?.bestOfferVolume),
        bestStaticBidVolume: dash(market.data?.bestStaticBidVolume),
        bestStaticOfferVolume: dash(market.data?.bestStaticOfferVolume),
      }}
      decimalPlaces={market.positionDecimalPlaces}
      {...props}
    />
  );
};

export const InsurancePoolInfoPanel = ({
  market,
  account,
  ...props
}: {
  account: NonNullable<
    Get<MarketInfoWithData, 'accountsConnection.edges[0].node'>
  >;
} & MarketInfoProps &
  PanelProps) => {
  const assetSymbol =
    market?.tradableInstrument.instrument.product?.settlementAsset.symbol || '';
  return (
    <MarketInfoTable
      data={{
        balance: account.balance,
      }}
      assetSymbol={assetSymbol}
      decimalPlaces={
        market.tradableInstrument.instrument.product.settlementAsset.decimals
      }
      {...props}
    />
  );
};

export const KeyDetailsInfoPanel = ({
  market,
}: MarketInfoProps & PanelProps) => {
  const assetDecimals =
    market.tradableInstrument.instrument.product.settlementAsset.decimals;
  return (
    <MarketInfoTable
      data={{
        name: market.tradableInstrument.instrument.name,
        marketID: market.id,
        tradingMode:
          market.tradingMode && MarketTradingModeMapping[market.tradingMode],
        marketDecimalPlaces: market.decimalPlaces,
        positionDecimalPlaces: market.positionDecimalPlaces,
        settlementAssetDecimalPlaces: assetDecimals,
      }}
    />
  );
};

export const InstrumentInfoPanel = ({
  market,
  ...props
}: MarketInfoProps & PanelProps) => (
  <MarketInfoTable
    data={{
      marketName: market.tradableInstrument.instrument.name,
      code: market.tradableInstrument.instrument.code,
      productType: market.tradableInstrument.instrument.product.__typename,
      ...market.tradableInstrument.instrument.product,
    }}
    {...props}
  />
);

export const SettlementAssetInfoPanel = ({
  market,
  noBorder = true,
}: MarketInfoProps & PanelProps) => {
  const assetSymbol =
    market?.tradableInstrument.instrument.product?.settlementAsset.symbol || '';
  const quoteUnit =
    market?.tradableInstrument.instrument.product?.quoteName || '';
  const assetId = useMemo(
    () => market?.tradableInstrument.instrument.product?.settlementAsset.id,
    [market]
  );
  const { data: asset } = useAssetDataProvider(assetId ?? '');
  return asset ? (
    <>
      <AssetDetailsTable
        asset={asset}
        inline={true}
        noBorder={noBorder}
        dtClassName="text-black dark:text-white text-ui !px-0 !font-normal"
        ddClassName="text-black dark:text-white text-ui !px-0 !font-normal max-w-full"
      />
      <p className="text-xs mt-4">
        {t(
          'There is 1 unit of the settlement asset (%s) to every 1 quote unit (%s).',
          [assetSymbol, quoteUnit]
        )}
      </p>
    </>
  ) : (
    <Splash>{t('No data')}</Splash>
  );
};

export const MetadataInfoPanel = ({
  market,
  ...props
}: MarketInfoProps & PanelProps) => (
  <MarketInfoTable
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
    {...props}
  />
);

export const RiskModelInfoPanel = ({
  market,
  ...props
}: MarketInfoProps & PanelProps) => (
  <MarketInfoTable
    data={market.tradableInstrument.riskModel}
    unformatted={true}
    omits={[]}
    {...props}
  />
);

export const RiskParametersInfoPanel = ({
  market,
  ...props
}: MarketInfoProps & PanelProps) => (
  <MarketInfoTable
    data={market.tradableInstrument.riskModel.params}
    unformatted={true}
    omits={[]}
    {...props}
  />
);

export const RiskFactorsInfoPanel = ({
  market,
  ...props
}: MarketInfoProps & PanelProps) => (
  <MarketInfoTable
    data={market.riskFactors}
    unformatted={true}
    omits={['market', '__typename']}
    {...props}
  />
);

export const PriceMonitoringBoundsInfoPanel = ({
  market,
  triggerIndex,
  ...props
}: {
  triggerIndex: number;
} & MarketInfoWithDataProps &
  PanelProps) => {
  const quoteUnit =
    market?.tradableInstrument.instrument.product?.quoteName || '';
  const trigger =
    market.priceMonitoringSettings?.parameters?.triggers?.[triggerIndex];
  const bounds = market.data?.priceMonitoringBounds?.[triggerIndex];
  if (!trigger) {
    console.error(
      `Could not find data for trigger ${triggerIndex} (market id: ${market.id})`
    );
    return null;
  }
  return (
    <div className="text-xs">
      <div className="grid grid-cols-2 text-xs mb-4">
        <p className="col-span-1">
          {t('%s probability price bounds', [
            formatNumberPercentage(
              new BigNumber(trigger.probability).times(100)
            ),
          ])}
        </p>
        <p className="col-span-1 text-right">
          {t('Within %s seconds', [formatNumber(trigger.horizonSecs)])}
        </p>
      </div>
      <div className="pl-2 pb-0 text-xs border-l-2">
        {bounds && (
          <MarketInfoTable
            data={{
              highestPrice: bounds.maxValidPrice,
              lowestPrice: bounds.minValidPrice,
            }}
            decimalPlaces={market.decimalPlaces}
            assetSymbol={quoteUnit}
            {...props}
          />
        )}
      </div>
      <p className="mt-4">
        {t('Results in %s seconds auction if breached', [
          trigger.auctionExtensionSecs.toString(),
        ])}
      </p>
    </div>
  );
};

export const LiquidityMonitoringParametersInfoPanel = ({
  market,
  ...props
}: MarketInfoProps & PanelProps) => (
  <MarketInfoTable
    data={{
      triggeringRatio: market.liquidityMonitoringParameters.triggeringRatio,
      ...market.liquidityMonitoringParameters.targetStakeParameters,
    }}
    {...props}
  />
);

export const LiquidityInfoPanel = ({
  market,
  ...props
}: MarketInfoWithDataProps & PanelProps) => {
  const assetDecimals =
    market.tradableInstrument.instrument.product.settlementAsset.decimals;
  const assetSymbol =
    market?.tradableInstrument.instrument.product?.settlementAsset.symbol || '';
  return (
    <MarketInfoTable
      data={{
        targetStake: market.data && market.data.targetStake,
        suppliedStake: market.data && market.data?.suppliedStake,
        marketValueProxy: market.data && market.data.marketValueProxy,
      }}
      decimalPlaces={assetDecimals}
      assetSymbol={assetSymbol}
      {...props}
    />
  );
};

export const LiquidityPriceRangeInfoPanel = ({
  market,
  ...props
}: MarketInfoWithDataProps & PanelProps) => {
  const quoteUnit =
    market?.tradableInstrument.instrument.product?.quoteName || '';
  const liquidityPriceRange = formatNumberPercentage(
    new BigNumber(market.lpPriceRange).times(100)
  );
  return (
    <>
      <p className="text-xs mb-4">
        {`For liquidity orders to count towards a commitment, they must be
            within the liquidity monitoring bounds.`}
      </p>
      <p className="text-xs mb-4">
        {`The liquidity price range is a ${liquidityPriceRange} difference from the mid
            price.`}
      </p>
      <div className="pl-2 pb-0 text-xs border-l-2">
        <MarketInfoTable
          data={{
            liquidityPriceRange: `${liquidityPriceRange} of mid price`,
            lowestPrice:
              market.data?.midPrice &&
              `${addDecimalsFormatNumber(
                new BigNumber(1)
                  .minus(market.lpPriceRange)
                  .times(market.data.midPrice)
                  .toString(),
                market.decimalPlaces
              )} ${quoteUnit}`,
            highestPrice:
              market.data?.midPrice &&
              `${addDecimalsFormatNumber(
                new BigNumber(1)
                  .plus(market.lpPriceRange)
                  .times(market.data.midPrice)
                  .toString(),
                market.decimalPlaces
              )} ${quoteUnit}`,
          }}
        ></MarketInfoTable>
      </div>
    </>
  );
};

export const OracleInfoPanel = ({
  market,
  ...props
}: MarketInfoProps & PanelProps) => (
  <MarketInfoTable
    data={market.tradableInstrument.instrument.product.dataSourceSpecBinding}
    {...props}
  />
);
