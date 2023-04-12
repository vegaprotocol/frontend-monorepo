import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import { AssetDetailsTable, useAssetDataProvider } from '@vegaprotocol/assets';
import { t } from '@vegaprotocol/i18n';
import {
  calcCandleVolume,
  totalFeesPercentage,
} from '@vegaprotocol/market-list';
import { ExternalLink, Splash } from '@vegaprotocol/ui-toolkit';
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
import type { DataSourceDefinition, SignerKind } from '@vegaprotocol/types';
import { ConditionOperatorMapping } from '@vegaprotocol/types';
import { MarketTradingModeMapping } from '@vegaprotocol/types';
import { useEnvironment } from '@vegaprotocol/environment';
import type { Provider } from '@vegaprotocol/oracles';
import { OracleBasicProfile, useOracleProofs } from '@vegaprotocol/oracles';

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
        />
      </div>
    </>
  );
};

export const OracleInfoPanel = ({
  market,
  ...props
}: MarketInfoProps & PanelProps) => {
  const product = market.tradableInstrument.instrument.product;
  const { VEGA_EXPLORER_URL, ORACLE_PROOFS_URL } = useEnvironment();
  const { data } = useOracleProofs(ORACLE_PROOFS_URL);

  return (
    <MarketInfoTable data={product.dataSourceSpecBinding} {...props}>
      <div
        className="flex flex-col gap-2 mt-4"
        data-testid="oracle-proof-links"
      >
        <DataSourceProof
          data={product.dataSourceSpecForSettlementData.data}
          providers={data}
          type="settlementData"
        />
        <DataSourceProof
          data={product.dataSourceSpecForTradingTermination.data}
          providers={data}
          type="termination"
        />
      </div>
      <div className="flex flex-col gap-2" data-testid="oracle-spec-links">
        <ExternalLink
          href={`${VEGA_EXPLORER_URL}/oracles#${product.dataSourceSpecForSettlementData.id}`}
        >
          {t('View settlement data specification')}
        </ExternalLink>
        <ExternalLink
          href={`${VEGA_EXPLORER_URL}/oracles#${product.dataSourceSpecForTradingTermination.id}`}
        >
          {t('View termination specification')}
        </ExternalLink>
      </div>
    </MarketInfoTable>
  );
};

export const DataSourceProof = ({
  data,
  providers,
  type,
}: {
  data: DataSourceDefinition;
  providers: Provider[] | undefined;
  type: 'settlementData' | 'termination';
}) => {
  if (data.sourceType.__typename === 'DataSourceDefinitionExternal') {
    const signers = data.sourceType.sourceType.signers || [];

    if (!providers?.length) {
      return <NoOracleProof type={type} />;
    }

    return (
      <div className="flex flex-col gap-2">
        {signers.map(({ signer }, i) => {
          return (
            <OracleLink
              key={i}
              providers={providers}
              signer={signer}
              type={type}
              index={i}
            />
          );
        })}
      </div>
    );
  }

  if (data.sourceType.__typename === 'DataSourceDefinitionInternal') {
    return (
      <div>
        <h3>{t('Internal conditions')}</h3>
        {data.sourceType.sourceType.conditions.map((condition, i) => {
          if (!condition) return null;
          return (
            <p key={i}>
              {ConditionOperatorMapping[condition.operator]} {condition.value}
            </p>
          );
        })}
      </div>
    );
  }

  return <div>{t('Invalid data source')}</div>;
};

const OracleLink = ({
  providers,
  signer,
  type,
  index,
}: {
  providers: Provider[];
  signer: SignerKind;
  type: 'settlementData' | 'termination';
  index: number;
}) => {
  const text =
    type === 'settlementData'
      ? t('View settlement oracle details')
      : t('View termination oracle details');
  const textWithCount = index > 0 ? `${text} (${index + 1})` : text;

  const provider = providers.find((p) => {
    if (signer.__typename === 'PubKey') {
      if (
        p.oracle.type === 'public_key' &&
        p.oracle.public_key === signer.key
      ) {
        return true;
      }
    }

    if (signer.__typename === 'ETHAddress') {
      if (
        p.oracle.type === 'eth_address' &&
        p.oracle.eth_address === signer.address
      ) {
        return true;
      }
    }

    return false;
  });

  if (!provider) {
    return <NoOracleProof type={type} />;
  }

  return (
    <>
      <p>
        <ExternalLink href={provider.github_link}>{textWithCount}</ExternalLink>
      </p>
      <OracleBasicProfile provider={provider}></OracleBasicProfile>
    </>
  );
};

const NoOracleProof = ({
  type,
}: {
  type: 'settlementData' | 'termination';
}) => {
  return (
    <p>
      {t(
        'No oracle proof for %s',
        type === 'settlementData' ? 'settlement data' : 'termination'
      )}
    </p>
  );
};
