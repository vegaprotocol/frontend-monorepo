import isEqual from 'lodash/isEqual';
import type { ReactNode } from 'react';
import { Fragment, useMemo, useState } from 'react';
import { AssetDetailsTable, useAssetDataProvider } from '@vegaprotocol/assets';
import { t } from '@vegaprotocol/i18n';
import { marketDataProvider } from '../../market-data-provider';
import { totalFeesPercentage } from '../../market-utils';
import {
  ExternalLink,
  Intent,
  Lozenge,
  Splash,
  Tooltip,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
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
} from './market-info-data-provider';
import { Last24hVolume } from '../last-24h-volume';
import BigNumber from 'bignumber.js';
import type {
  DataSourceDefinition,
  MarketTradingMode,
  SignerKind,
} from '@vegaprotocol/types';
import {
  ConditionOperatorMapping,
  MarketTradingModeMapping,
} from '@vegaprotocol/types';
import {
  DApp,
  FLAGS,
  TOKEN_PROPOSAL,
  useEnvironment,
  useLinks,
} from '@vegaprotocol/environment';
import type { Provider } from '../../oracle-schema';
import { OracleBasicProfile } from '../../components/oracle-basic-profile';
import { useOracleProofs } from '../../hooks';
import { OracleDialog } from '../oracle-dialog/oracle-dialog';
import { useDataProvider } from '@vegaprotocol/data-provider';
import {
  useParentMarketIdQuery,
  useSuccessorMarketIdsQuery,
  useSuccessorMarketQuery,
} from '../../__generated__';
import { useSuccessorMarketProposalDetailsQuery } from '@vegaprotocol/proposals';
import classNames from 'classnames';
import compact from 'lodash/compact';

type MarketInfoProps = {
  market: MarketInfo;
  parentMarket?: MarketInfo;
  children?: ReactNode;
};

export const CurrentFeesInfoPanel = ({ market }: MarketInfoProps) => (
  <>
    <MarketInfoTable
      data={{
        makerFee: market.fees.factors.makerFee,
        infrastructureFee: market.fees.factors.infrastructureFee,
        liquidityFee: market.fees.factors.liquidityFee,
        totalFees: totalFeesPercentage(market.fees.factors),
      }}
      asPercentage={true}
    />
    <p className="text-xs">
      {t(
        'All fees are paid by price takers and are a % of the trade notional value. Fees are not paid during auction uncrossing.'
      )}
    </p>
  </>
);

export const MarketPriceInfoPanel = ({ market }: MarketInfoProps) => {
  const assetSymbol =
    market?.tradableInstrument.instrument.product?.settlementAsset.symbol || '';
  const quoteUnit =
    market?.tradableInstrument.instrument.product?.quoteName || '';
  const { data } = useDataProvider({
    dataProvider: marketDataProvider,
    variables: { marketId: market.id },
  });
  return (
    <>
      <MarketInfoTable
        data={{
          markPrice: data?.markPrice,
          bestBidPrice: data?.bestBidPrice,
          bestOfferPrice: data?.bestOfferPrice,
          quoteUnit: market.tradableInstrument.instrument.product.quoteName,
        }}
        decimalPlaces={market.decimalPlaces}
      />
      <p className="text-xs mt-2">
        {t(
          'There is 1 unit of the settlement asset (%s) to every 1 quote unit (%s).',
          [assetSymbol, quoteUnit]
        )}
      </p>
    </>
  );
};

export const MarketVolumeInfoPanel = ({ market }: MarketInfoProps) => {
  const { data } = useDataProvider({
    dataProvider: marketDataProvider,
    variables: { marketId: market.id },
  });

  const dash = (value: string | undefined) =>
    value && value !== '0' ? value : '-';

  return (
    <MarketInfoTable
      data={{
        '24hourVolume': (
          <Last24hVolume
            marketId={market.id}
            positionDecimalPlaces={market.positionDecimalPlaces}
          />
        ),
        openInterest: dash(data?.openInterest),
        bestBidVolume: dash(data?.bestBidVolume),
        bestOfferVolume: dash(data?.bestOfferVolume),
        bestStaticBidVolume: dash(data?.bestStaticBidVolume),
        bestStaticOfferVolume: dash(data?.bestStaticOfferVolume),
      }}
      decimalPlaces={market.positionDecimalPlaces}
    />
  );
};

export const InsurancePoolInfoPanel = ({
  market,
  account,
}: {
  account: NonNullable<
    Get<MarketInfoWithData, 'accountsConnection.edges[0].node'>
  >;
} & MarketInfoProps) => {
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
    />
  );
};

export const KeyDetailsInfoPanel = ({
  market,
  parentMarket,
}: MarketInfoProps) => {
  const { data: parentMarketIdData } = useParentMarketIdQuery({
    variables: {
      marketId: market.id,
    },
    skip: !FLAGS.SUCCESSOR_MARKETS,
  });

  const { data: successorProposalDetails } =
    useSuccessorMarketProposalDetailsQuery({
      variables: {
        proposalId: market.proposal?.id || '',
      },
      skip: !FLAGS.SUCCESSOR_MARKETS || !market.proposal?.id,
    });

  // The following queries are needed as the parent market could also have been a successor market.
  // Note: the parent market is only passed to this component if the successor markets flag is enabled,
  // so that check is not needed in the skip.
  const { data: grandparentMarketIdData } = useParentMarketIdQuery({
    variables: {
      marketId: parentMarket?.id || '',
    },
    skip: !parentMarket?.id,
  });

  const { data: parentSuccessorProposalDetails } =
    useSuccessorMarketProposalDetailsQuery({
      variables: {
        proposalId: parentMarket?.proposal?.id || '',
      },
      skip: !parentMarket?.proposal?.id,
    });

  const assetDecimals =
    market.tradableInstrument.instrument.product.settlementAsset.decimals;

  return (
    <MarketInfoTable
      data={
        FLAGS.SUCCESSOR_MARKETS
          ? {
              name: market.tradableInstrument.instrument.name,
              marketID: market.id,
              parentMarketID: parentMarketIdData?.market?.parentMarketID || '-',
              insurancePoolFraction:
                (successorProposalDetails?.proposal?.terms.change.__typename ===
                  'NewMarket' &&
                  successorProposalDetails.proposal.terms.change
                    .successorConfiguration?.insurancePoolFraction) ||
                '-',
              tradingMode:
                market.tradingMode &&
                MarketTradingModeMapping[market.tradingMode],
              marketDecimalPlaces: market.decimalPlaces,
              positionDecimalPlaces: market.positionDecimalPlaces,
              settlementAssetDecimalPlaces: assetDecimals,
            }
          : {
              name: market.tradableInstrument.instrument.name,
              marketID: market.id,
              tradingMode:
                market.tradingMode &&
                MarketTradingModeMapping[market.tradingMode],
              marketDecimalPlaces: market.decimalPlaces,
              positionDecimalPlaces: market.positionDecimalPlaces,
              settlementAssetDecimalPlaces: assetDecimals,
            }
      }
      parentData={
        parentMarket && {
          name: parentMarket?.tradableInstrument?.instrument?.name,
          marketID: parentMarket?.id,
          parentMarketID: grandparentMarketIdData?.market?.parentMarketID,
          insurancePoolFraction:
            parentSuccessorProposalDetails?.proposal?.terms.change
              .__typename === 'NewMarket' &&
            parentSuccessorProposalDetails.proposal.terms.change
              .successorConfiguration?.insurancePoolFraction,
          tradingMode:
            parentMarket?.tradingMode &&
            MarketTradingModeMapping[
              parentMarket.tradingMode as MarketTradingMode
            ],
          marketDecimalPlaces: parentMarket?.decimalPlaces,
          positionDecimalPlaces: parentMarket?.positionDecimalPlaces,
          settlementAssetDecimalPlaces:
            parentMarket?.tradableInstrument?.instrument?.product
              ?.settlementAsset?.decimals,
        }
      }
    />
  );
};

const SuccessionLineItem = ({
  marketId,
  isCurrent,
}: {
  marketId: string;
  isCurrent?: boolean;
}) => {
  const { data } = useSuccessorMarketQuery({
    variables: {
      marketId,
    },
  });

  const marketData = data?.market;
  const governanceLink = useLinks(DApp.Governance);
  const proposalLink = marketData?.proposal?.id
    ? governanceLink(TOKEN_PROPOSAL.replace(':id', marketData?.proposal?.id))
    : undefined;

  return (
    <div
      data-testid="succession-line-item"
      className={classNames(
        'rounded p-2 bg-vega-clight-700 dark:bg-vega-cdark-700',
        'font-alpha',
        'flex flex-col '
      )}
    >
      <div className="flex justify-between">
        <div>
          {marketData ? (
            proposalLink ? (
              <ExternalLink href={proposalLink}>
                {marketData.tradableInstrument.instrument.code}
              </ExternalLink>
            ) : (
              marketData.tradableInstrument.instrument.code
            )
          ) : (
            <span className="block w-20 h-4 mb-1 bg-vega-clight-500 dark:bg-vega-cdark-500 animate-pulse"></span>
          )}
        </div>
        {isCurrent && (
          <Tooltip description={t('This market')}>
            <div className="text-vega-clight-200 dark:text-vega-cdark-200 cursor-help">
              <VegaIcon name={VegaIconNames.BULLET} size={16} />
            </div>
          </Tooltip>
        )}
      </div>
      <div className="text-xs">
        {marketData ? (
          marketData.tradableInstrument.instrument.name
        ) : (
          <span className="block w-28 h-4 bg-vega-clight-500 dark:bg-vega-cdark-500 animate-pulse"></span>
        )}
      </div>
      <div
        data-testid="succession-line-item-market-id"
        className="text-xs truncate mt-1"
      >
        {marketId}
      </div>
    </div>
  );
};

const SuccessionLink = () => (
  <div className="text-center leading-none" aria-hidden>
    <VegaIcon name={VegaIconNames.ARROW_DOWN} size={12} />
  </div>
);

const buildSuccessionLine = (
  all: {
    id: string;
    successorMarketID?: string | null | undefined;
    parentMarketID?: string | null | undefined;
  }[],
  id: string
) => {
  let line = [id];
  const find = (id: string, dir?: 'up' | 'down') => {
    const item = all.find((a) => a.id === id);
    const anc = dir === 'up' && item?.parentMarketID;
    const des = dir === 'down' && item?.successorMarketID;
    if (anc) {
      line = [anc, ...line];
      find(anc, 'up');
    }
    if (des) {
      line = [...line, des];
      find(des, 'down');
    }
  };
  find(id, 'up');
  find(id, 'down');
  return line;
};
export const SuccessionLineInfoPanel = ({
  market,
}: {
  market: Pick<MarketInfo, 'id'>;
}) => {
  const { data } = useSuccessorMarketIdsQuery();
  const ids = compact(data?.marketsConnection?.edges.map((e) => e.node));
  const line = buildSuccessionLine(ids, market.id);

  return (
    <div className="flex flex-col gap-2">
      {line.map((id, i) => (
        <Fragment key={i}>
          {i > 0 && <SuccessionLink />}
          <SuccessionLineItem marketId={id} isCurrent={id === market.id} />
        </Fragment>
      ))}
    </div>
  );
};

export const InstrumentInfoPanel = ({
  market,
  parentMarket,
}: MarketInfoProps) => (
  <MarketInfoTable
    data={{
      marketName: market.tradableInstrument.instrument.name,
      code: market.tradableInstrument.instrument.code,
      productType: market.tradableInstrument.instrument.product.__typename,
      quoteName: market.tradableInstrument.instrument.product.quoteName,
    }}
    parentData={
      parentMarket && {
        marketName: parentMarket?.tradableInstrument?.instrument?.name,
        code: parentMarket?.tradableInstrument?.instrument?.code,
        productType:
          parentMarket?.tradableInstrument?.instrument?.product?.__typename,
        quoteName:
          parentMarket?.tradableInstrument?.instrument?.product?.quoteName,
      }
    }
  />
);

export const SettlementAssetInfoPanel = ({ market }: MarketInfoProps) => {
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
        noBorder={true}
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

const getMarketMetadata = (market: MarketInfo) =>
  market.tradableInstrument.instrument.metadata.tags
    ?.map((tag) => {
      const [key, value] = tag.split(':');
      return { [key]: value };
    })
    .reduce((acc, curr) => ({ ...acc, ...curr }), {});

export const MetadataInfoPanel = ({
  market,
  parentMarket,
}: MarketInfoProps) => (
  <MarketInfoTable
    data={{
      expiryDate: getMarketExpiryDateFormatted(
        market.tradableInstrument.instrument.metadata.tags
      ),
      ...(getMarketMetadata(market) || {}),
    }}
    parentData={
      parentMarket && {
        expiryDate: getMarketExpiryDateFormatted(
          parentMarket.tradableInstrument.instrument.metadata.tags
        ),
        ...(getMarketMetadata(parentMarket) || {}),
      }
    }
  />
);

export const RiskModelInfoPanel = ({
  market,
  parentMarket,
}: MarketInfoProps) => {
  if (market.tradableInstrument.riskModel.__typename !== 'LogNormalRiskModel') {
    return null;
  }

  const { tau, riskAversionParameter } = market.tradableInstrument.riskModel;

  let parentData;

  if (
    parentMarket?.tradableInstrument?.riskModel?.__typename ===
    'LogNormalRiskModel'
  ) {
    const {
      tau: parentTau,
      riskAversionParameter: parentRiskAversionParameter,
    } = market.tradableInstrument.riskModel;

    parentData = {
      tau: parentTau,
      riskAversionParameter: parentRiskAversionParameter,
    };
  }

  return (
    <MarketInfoTable
      data={{ tau, riskAversionParameter }}
      parentData={parentData}
      unformatted
    />
  );
};

export const RiskParametersInfoPanel = ({
  market,
  parentMarket,
}: MarketInfoProps) => {
  const marketType = market.tradableInstrument.riskModel.__typename;

  let data, parentData;

  if (marketType === 'LogNormalRiskModel') {
    const { r, sigma, mu } = market.tradableInstrument.riskModel.params;
    data = { r, sigma, mu };

    if (
      parentMarket?.tradableInstrument?.riskModel.__typename ===
      'LogNormalRiskModel'
    ) {
      const parentParams = parentMarket.tradableInstrument.riskModel.params;
      parentData = {
        r: parentParams.r,
        sigma: parentParams.sigma,
        mu: parentParams.mu,
      };
    }
  } else if (marketType === 'SimpleRiskModel') {
    const { factorLong, factorShort } =
      market.tradableInstrument.riskModel.params;
    data = { factorLong, factorShort };

    if (
      parentMarket?.tradableInstrument?.riskModel.__typename ===
      'SimpleRiskModel'
    ) {
      const parentParams = parentMarket.tradableInstrument.riskModel.params;
      parentData = {
        factorLong: parentParams.factorLong,
        factorShort: parentParams.factorShort,
      };
    }
  }

  if (!data) return null;

  return <MarketInfoTable data={data} parentData={parentData} unformatted />;
};

export const RiskFactorsInfoPanel = ({
  market,
  parentMarket,
}: MarketInfoProps) => {
  if (!market.riskFactors) {
    return null;
  }

  const { short, long } = market.riskFactors;

  let parentData;

  if (parentMarket?.riskFactors) {
    const parentShort = parentMarket.riskFactors.short;
    const parentLong = parentMarket.riskFactors.long;
    parentData = { short: parentShort, long: parentLong };
  }

  return (
    <MarketInfoTable
      data={{ short, long }}
      parentData={parentData}
      unformatted
    />
  );
};

export const PriceMonitoringBoundsInfoPanel = ({
  market,
  triggerIndex,
}: MarketInfoProps & {
  triggerIndex: number;
}) => {
  const { data } = useDataProvider({
    dataProvider: marketDataProvider,
    variables: { marketId: market.id },
  });

  const quoteUnit =
    market?.tradableInstrument.instrument.product?.quoteName || '';

  const trigger =
    market.priceMonitoringSettings?.parameters?.triggers?.[triggerIndex];

  const bounds = data?.priceMonitoringBounds?.[triggerIndex];

  if (!trigger) {
    console.error(
      `Could not find data for trigger ${triggerIndex} (market id: ${market.id})`
    );
    return null;
  }
  return (
    <>
      <div className="grid grid-cols-2 text-sm mb-2">
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
      {bounds && (
        <MarketInfoTable
          data={{
            highestPrice: bounds.maxValidPrice,
            lowestPrice: bounds.minValidPrice,
          }}
          decimalPlaces={market.decimalPlaces}
          assetSymbol={quoteUnit}
        />
      )}
      <p className="text-xs mt-2">
        {t('Results in %s seconds auction if breached', [
          trigger.auctionExtensionSecs.toString(),
        ])}
      </p>
    </>
  );
};

export const LiquidityMonitoringParametersInfoPanel = ({
  market,
  parentMarket,
}: MarketInfoProps) => {
  const marketData = {
    triggeringRatio: market.liquidityMonitoringParameters.triggeringRatio,
    timeWindow:
      market.liquidityMonitoringParameters.targetStakeParameters.timeWindow,
    scalingFactor:
      market.liquidityMonitoringParameters.targetStakeParameters.scalingFactor,
  };

  const parentMarketData = parentMarket
    ? {
        triggeringRatio:
          parentMarket.liquidityMonitoringParameters.triggeringRatio,
        timeWindow:
          parentMarket.liquidityMonitoringParameters.targetStakeParameters
            .timeWindow,
        scalingFactor:
          parentMarket.liquidityMonitoringParameters.targetStakeParameters
            .scalingFactor,
      }
    : undefined;

  return <MarketInfoTable data={marketData} parentData={parentMarketData} />;
};

export const LiquidityInfoPanel = ({ market, children }: MarketInfoProps) => {
  const assetDecimals =
    market.tradableInstrument.instrument.product.settlementAsset.decimals;
  const assetSymbol =
    market?.tradableInstrument.instrument.product?.settlementAsset.symbol || '';
  const { data } = useDataProvider({
    dataProvider: marketDataProvider,
    variables: { marketId: market.id },
  });
  return (
    <>
      <MarketInfoTable
        data={{
          targetStake: data?.targetStake,
          suppliedStake: data?.suppliedStake,
          marketValueProxy: data?.marketValueProxy,
        }}
        decimalPlaces={assetDecimals}
        assetSymbol={assetSymbol}
      />
      {children}
    </>
  );
};

export const LiquidityPriceRangeInfoPanel = ({
  market,
  parentMarket,
}: MarketInfoProps) => {
  const quoteUnit =
    market?.tradableInstrument.instrument.product?.quoteName || '';
  const parentQuoteUnit =
    parentMarket?.tradableInstrument.instrument.product?.quoteName || '';

  const liquidityPriceRange = formatNumberPercentage(
    new BigNumber(market.lpPriceRange).times(100)
  );
  const parentLiquidityPriceRange = parentMarket
    ? formatNumberPercentage(
        new BigNumber(parentMarket.lpPriceRange).times(100)
      )
    : null;

  const { data } = useDataProvider({
    dataProvider: marketDataProvider,
    variables: { marketId: market.id },
  });

  const { data: parentMarketData } = useDataProvider({
    dataProvider: marketDataProvider,
    variables: { marketId: parentMarket?.id || '' },
    skip: !parentMarket,
  });

  let parentData;

  if (parentMarket && parentMarketData && quoteUnit === parentQuoteUnit) {
    parentData = {
      liquidityPriceRange: `${parentLiquidityPriceRange} of mid price`,
      lowestPrice:
        parentMarketData?.midPrice &&
        `${addDecimalsFormatNumber(
          new BigNumber(1)
            .minus(parentMarket.lpPriceRange)
            .times(parentMarketData.midPrice)
            .toString(),
          parentMarket.decimalPlaces
        )} ${quoteUnit}`,
      highestPrice:
        parentMarketData?.midPrice &&
        `${addDecimalsFormatNumber(
          new BigNumber(1)
            .plus(parentMarket.lpPriceRange)
            .times(parentMarketData.midPrice)
            .toString(),
          parentMarket.decimalPlaces
        )} ${quoteUnit}`,
    };
  }

  return (
    <>
      <p className="text-sm mb-2">
        {`For liquidity orders to count towards a commitment, they must be
            within the liquidity monitoring bounds.`}
      </p>
      <p className="text-sm mb-2">
        {`The liquidity price range is a ${liquidityPriceRange} difference from the mid
            price.`}
      </p>
      <MarketInfoTable
        data={{
          liquidityPriceRange: `${liquidityPriceRange} of mid price`,
          lowestPrice:
            data?.midPrice &&
            `${addDecimalsFormatNumber(
              new BigNumber(1)
                .minus(market.lpPriceRange)
                .times(data.midPrice)
                .toString(),
              market.decimalPlaces
            )} ${quoteUnit}`,
          highestPrice:
            data?.midPrice &&
            `${addDecimalsFormatNumber(
              new BigNumber(1)
                .plus(market.lpPriceRange)
                .times(data.midPrice)
                .toString(),
              market.decimalPlaces
            )} ${quoteUnit}`,
        }}
        parentData={parentData}
      />
    </>
  );
};

export const OracleInfoPanel = ({
  market,
  type,
  parentMarket,
}: MarketInfoProps & { type: 'settlementData' | 'termination' }) => {
  // If this is a successor market, this component will only receive parent market
  // data if the termination or settlement data is different from the parent.
  const product = market.tradableInstrument.instrument.product;
  const parentProduct = parentMarket?.tradableInstrument?.instrument?.product;
  const { VEGA_EXPLORER_URL, ORACLE_PROOFS_URL } = useEnvironment();
  const { data } = useOracleProofs(ORACLE_PROOFS_URL);

  const dataSourceSpecId =
    type === 'settlementData'
      ? product.dataSourceSpecForSettlementData.id
      : product.dataSourceSpecForTradingTermination.id;

  const parentDataSourceSpecId =
    type === 'settlementData'
      ? parentProduct?.dataSourceSpecForSettlementData?.id
      : parentProduct?.dataSourceSpecForTradingTermination?.id;

  const dataSourceSpec = (
    type === 'settlementData'
      ? product.dataSourceSpecForSettlementData.data
      : product.dataSourceSpecForTradingTermination.data
  ) as DataSourceDefinition;

  const parentDataSourceSpec =
    type === 'settlementData'
      ? parentProduct?.dataSourceSpecForSettlementData?.data
      : (parentProduct?.dataSourceSpecForTradingTermination
          ?.data as DataSourceDefinition);

  const shouldShowParentData =
    parentMarket !== undefined &&
    parentDataSourceSpecId !== undefined &&
    !isEqual(dataSourceSpec, parentDataSourceSpec);

  const wrapperClasses = classNames('mb-4', {
    'flex items-center gap-6': shouldShowParentData,
  });

  return (
    <>
      {shouldShowParentData && (
        <Lozenge variant={Intent.Primary} className="text-sm">
          {t('Updated')}
        </Lozenge>
      )}

      <div className={wrapperClasses}>
        {shouldShowParentData &&
          parentDataSourceSpec &&
          parentDataSourceSpecId &&
          parentProduct && (
            <div className="flex flex-col gap-2 text-vega-dark-300 line-through">
              <DataSourceProof
                data-testid="oracle-proof-links"
                data={parentDataSourceSpec}
                providers={data}
                type={type}
                dataSourceSpecId={parentDataSourceSpecId}
              />

              <ExternalLink
                data-testid="oracle-spec-links"
                href={`${VEGA_EXPLORER_URL}/oracles/${
                  type === 'settlementData'
                    ? parentProduct.dataSourceSpecForSettlementData.id
                    : parentProduct.dataSourceSpecForTradingTermination.id
                }`}
              >
                {type === 'settlementData'
                  ? t('View settlement data specification')
                  : t('View termination specification')}
              </ExternalLink>
            </div>
          )}

        <div className="flex flex-col gap-2">
          <DataSourceProof
            data-testid="oracle-proof-links"
            data={dataSourceSpec}
            providers={data}
            type={type}
            dataSourceSpecId={dataSourceSpecId}
          />

          <ExternalLink
            data-testid="oracle-spec-links"
            href={`${VEGA_EXPLORER_URL}/oracles/${
              type === 'settlementData'
                ? product.dataSourceSpecForSettlementData.id
                : product.dataSourceSpecForTradingTermination.id
            }`}
          >
            {type === 'settlementData'
              ? t('View settlement data specification')
              : t('View termination specification')}
          </ExternalLink>
        </div>
      </div>
    </>
  );
};

export const DataSourceProof = ({
  data,
  providers,
  type,
  dataSourceSpecId,
}: {
  data: DataSourceDefinition;
  providers: Provider[] | undefined;
  type: 'settlementData' | 'termination';
  dataSourceSpecId: string;
}) => {
  if (data.sourceType.__typename === 'DataSourceDefinitionExternal') {
    const signers = data.sourceType.sourceType.signers || [];

    if (!providers?.length) {
      return <NoOracleProof type={type} />;
    }

    return (
      <div className="flex flex-col gap-2">
        {signers.map(({ signer }, i) => (
          <OracleLink
            key={i}
            providers={providers}
            signer={signer}
            type={type}
            dataSourceSpecId={dataSourceSpecId}
          />
        ))}
      </div>
    );
  }

  if (data.sourceType.__typename === 'DataSourceDefinitionInternal') {
    if (data.sourceType.sourceType) {
      return (
        <div>
          <h3>{t('Internal conditions')}</h3>
          {data.sourceType.sourceType?.conditions.map((condition, i) => {
            if (!condition) return null;
            return (
              <p key={i}>
                {ConditionOperatorMapping[condition.operator]} {condition.value}
              </p>
            );
          })}
        </div>
      );
    } else {
      return (
        <div>
          {t('No oracle spec for trading termination. Internal timestamp used')}
        </div>
      );
    }
  }

  return <div>{t('Invalid data source')}</div>;
};

const getSignerProviders = (signer: SignerKind, providers: Provider[]) =>
  providers.filter((p) => {
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

const OracleLink = ({
  providers,
  signer,
  type,
  dataSourceSpecId,
}: {
  providers: Provider[];
  signer: SignerKind;
  type: 'settlementData' | 'termination';
  dataSourceSpecId: string;
}) => {
  const signerProviders = getSignerProviders(signer, providers);

  if (!signerProviders.length) {
    return <NoOracleProof type={type} />;
  }

  return (
    <div className="mt-2">
      {signerProviders.map((provider) => (
        <OracleProfile
          key={dataSourceSpecId}
          provider={provider}
          dataSourceSpecId={dataSourceSpecId}
        />
      ))}
    </div>
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

const OracleProfile = (props: {
  provider: Provider;
  dataSourceSpecId: string;
}) => {
  const [open, onChange] = useState(false);
  return (
    <div key={props.provider.name}>
      <OracleBasicProfile
        provider={props.provider}
        onClick={() => onChange(!open)}
      />
      <OracleDialog {...props} open={open} onChange={onChange} />
    </div>
  );
};
