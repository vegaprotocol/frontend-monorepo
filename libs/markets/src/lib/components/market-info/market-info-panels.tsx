import isEqual from 'lodash/isEqual';
import type { ReactNode } from 'react';
import { Fragment, useState } from 'react';
import { useMemo } from 'react';
import { AssetDetailsTable, useAssetDataProvider } from '@vegaprotocol/assets';
import { t } from '@vegaprotocol/i18n';
import { marketDataProvider } from '../../market-data-provider';
import { totalFeesPercentage } from '../../market-utils';
import {
  ExternalLink,
  Splash,
  Tooltip,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import {
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
import type { DataSourceDefinition, SignerKind } from '@vegaprotocol/types';
import { ConditionOperatorMapping } from '@vegaprotocol/types';
import { MarketTradingModeMapping } from '@vegaprotocol/types';
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
import type { MarketTradingMode } from '@vegaprotocol/types';
import { getQuoteName } from '../../market-utils';
import type { Signer } from '@vegaprotocol/types';
import classNames from 'classnames';
import compact from 'lodash/compact';
import get from 'lodash/get';

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
    market?.tradableInstrument.instrument.product &&
    'settlementAsset' in market.tradableInstrument.instrument.product
      ? market?.tradableInstrument.instrument.product?.settlementAsset.symbol
      : market?.tradableInstrument.instrument.product &&
        'baseAsset' in market.tradableInstrument.instrument.product
      ? get(market?.tradableInstrument.instrument.product?.baseAsset, 'symbol')
      : '';
  const quoteUnit = getQuoteName(market);
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
          quoteUnit: get(
            market.tradableInstrument.instrument.product,
            'quoteName'
          ),
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
  const assetSymbol = getAssetSymbol(market);
  const assetDecimals = getAssetDecimals(market);

  return (
    <MarketInfoTable
      data={{
        balance: account.balance,
      }}
      assetSymbol={assetSymbol}
      decimalPlaces={assetDecimals}
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

  const assetDecimals = getAssetDecimals(market);

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
          settlementAssetDecimalPlaces: assetDecimals,
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
  const governanceLink = useLinks(DApp.Token);
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
      quoteName: get(market.tradableInstrument.instrument.product, 'quoteName'),
    }}
    parentData={
      parentMarket && {
        marketName: parentMarket?.tradableInstrument?.instrument?.name,
        code: parentMarket?.tradableInstrument?.instrument?.code,
        productType:
          parentMarket?.tradableInstrument?.instrument?.product?.__typename,
        quoteName: get(
          parentMarket?.tradableInstrument?.instrument?.product,
          'quoteName'
        ),
      }
    }
  />
);

export const SettlementAssetInfoPanel = ({ market }: MarketInfoProps) => {
  const assetSymbol = getAssetSymbol(market);
  const quoteUnit = get(
    market?.tradableInstrument.instrument.product,
    'quoteName'
  );
  const assetId = useMemo(() => getAssetId(market), [market]);

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
  parentMarket,
}: MarketInfoProps & {
  triggerIndex: number;
}) => {
  const { data } = useDataProvider({
    dataProvider: marketDataProvider,
    variables: { marketId: market.id },
  });

  const { data: parentData } = useDataProvider({
    dataProvider: marketDataProvider,
    variables: { marketId: parentMarket?.id || '' },
    skip:
      !parentMarket ||
      !parentMarket?.priceMonitoringSettings?.parameters?.triggers?.[
        triggerIndex
      ],
  });

  const quoteUnit = get(
    market?.tradableInstrument.instrument.product,
    'quoteName'
  );
  const parentQuoteUnit = get(
    parentMarket?.tradableInstrument.instrument.product,
    'quoteName'
  );
  const isParentQuoteUnitEqual = quoteUnit === parentQuoteUnit;

  const trigger =
    market.priceMonitoringSettings?.parameters?.triggers?.[triggerIndex];
  const parentTrigger =
    parentMarket?.priceMonitoringSettings?.parameters?.triggers?.[triggerIndex];
  const isParentTriggerEqual = isEqual(trigger, parentTrigger);

  const bounds = data?.priceMonitoringBounds?.[triggerIndex];
  const parentBounds = parentData?.priceMonitoringBounds?.[triggerIndex];

  const shouldShowParentData =
    isParentQuoteUnitEqual && isParentTriggerEqual && !!parentBounds;

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
          parentData={
            shouldShowParentData
              ? {
                  highestPrice: parentBounds.maxValidPrice,
                  lowestPrice: parentBounds.minValidPrice,
                }
              : undefined
          }
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
    : {};

  return <MarketInfoTable data={marketData} parentData={parentMarketData} />;
};

export const LiquidityInfoPanel = ({ market, children }: MarketInfoProps) => {
  const assetDecimals = getAssetDecimals(market);
  const assetSymbol = getAssetSymbol(market);
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

export const OracleInfoPanel = ({
  market,
  type,
  parentMarket,
}: MarketInfoProps & {
  type: 'settlementData' | 'termination' | 'settlementSchedule';
}) => {
  // If this is a successor market, this component will only receive parent market
  // data if the termination or settlement data is different from the parent.
  const product = market.tradableInstrument.instrument.product;
  const parentProduct = parentMarket?.tradableInstrument?.instrument?.product;
  const { VEGA_EXPLORER_URL, ORACLE_PROOFS_URL } = useEnvironment();
  const { data } = useOracleProofs(ORACLE_PROOFS_URL);

  const dataSourceSpecId =
    type === 'settlementData' && 'dataSourceSpecForSettlementData' in product
      ? product.dataSourceSpecForSettlementData.id
      : type === 'termination' &&
        'dataSourceSpecForTradingTermination' in product
      ? product.dataSourceSpecForTradingTermination.id
      : type === 'settlementSchedule' &&
        'dataSourceSpecForSettlementScheduleData' in product
      ? get(product.dataSourceSpecForSettlementScheduleData, 'id')
      : '';

  const parentDataSourceSpecId = !parentProduct
    ? undefined
    : type === 'settlementData' &&
      'dataSourceSpecForSettlementData' in parentProduct
    ? parentProduct.dataSourceSpecForSettlementData.id
    : type === 'termination' &&
      'dataSourceSpecForTradingTermination' in parentProduct
    ? parentProduct.dataSourceSpecForTradingTermination.id
    : type === 'settlementSchedule' &&
      'dataSourceSpecForSettlementScheduleData' in parentProduct
    ? get(parentProduct.dataSourceSpecForSettlementScheduleData, 'id')
    : '';

  const dataSourceSpec =
    type === 'settlementData' && 'dataSourceSpecForSettlementData' in product
      ? product.dataSourceSpecForSettlementData.data
      : type === 'termination' &&
        'dataSourceSpecForTradingTermination' in product
      ? product.dataSourceSpecForTradingTermination.data
      : type === 'settlementSchedule' &&
        'dataSourceSpecForSettlementScheduleData' in product
      ? get(product.dataSourceSpecForSettlementScheduleData, 'data')
      : null;

  const parentDataSourceSpec = !parentProduct
    ? undefined
    : type === 'settlementData' &&
      'dataSourceSpecForSettlementData' in parentProduct
    ? parentProduct.dataSourceSpecForSettlementData.data
    : type === 'termination' &&
      'dataSourceSpecForTradingTermination' in parentProduct
    ? parentProduct.dataSourceSpecForTradingTermination.data
    : type === 'settlementSchedule' &&
      'dataSourceSpecForSettlementScheduleData' in parentProduct
    ? get(parentProduct.dataSourceSpecForSettlementScheduleData, 'data')
    : null;

  const isParentDataSourceSpecEqual =
    parentDataSourceSpec !== undefined &&
    dataSourceSpec === parentDataSourceSpec;
  const isParentDataSourceSpecIdEqual =
    parentDataSourceSpecId !== undefined &&
    dataSourceSpecId === parentDataSourceSpecId;

  // We'll only provide successor parent data (if it differs) to the
  // DataSourceProof component. Having an old external link struck through
  // is unlikely to be useful.
  return (
    <div className="flex flex-col gap-2">
      <DataSourceProof
        data-testid="oracle-proof-links"
        data={dataSourceSpec}
        providers={data}
        type={type}
        dataSourceSpecId={dataSourceSpecId}
        parentData={
          isParentDataSourceSpecEqual ? undefined : parentDataSourceSpec
        }
        parentDataSourceSpecId={
          isParentDataSourceSpecIdEqual ? undefined : parentDataSourceSpecId
        }
      />

      <ExternalLink
        data-testid="oracle-spec-links"
        href={`${VEGA_EXPLORER_URL}/oracles/${dataSourceSpecId}`}
      >
        {type === 'settlementData'
          ? t('View settlement data specification')
          : t('View termination specification')}
      </ExternalLink>
    </div>
  );
};

export const DataSourceProof = ({
  data,
  providers,
  type,
  dataSourceSpecId,
  parentData,
  parentDataSourceSpecId,
}: {
  data: DataSourceDefinition;
  providers: Provider[] | undefined;
  type: 'settlementData' | 'termination' | 'settlementSchedule';
  dataSourceSpecId: string;
  parentData?: DataSourceDefinition;
  parentDataSourceSpecId?: string;
}) => {
  // If this is a successor market, we'll only pass parent data to child
  // components for comparison if the data differs from the parent market.
  if (data.sourceType.__typename === 'DataSourceDefinitionExternal') {
    const signers =
      ('signers' in data.sourceType.sourceType &&
        data.sourceType.sourceType.signers) ||
      [];
    let parentSigners: Signer[];

    if (
      parentData &&
      parentData.sourceType.__typename === 'DataSourceDefinitionExternal'
    ) {
      parentSigners =
        ('signers' in parentData.sourceType.sourceType &&
          parentData.sourceType.sourceType?.signers) ||
        [];
    }

    if (!providers?.length) {
      return <NoOracleProof type={type} />;
    }

    return (
      <div className="flex flex-col gap-2">
        {signers.map(({ signer }, i) => {
          const parentSigner = parentSigners?.find(
            ({ signer: ParentSigner }) =>
              ParentSigner.__typename === signer.__typename
          )?.signer;

          const isParentSignerEqual = isEqual(signer, parentSigner);

          return isParentSignerEqual ? (
            <OracleLink
              key={i}
              providers={providers}
              signer={signer}
              type={type}
              dataSourceSpecId={dataSourceSpecId}
            />
          ) : (
            <OracleLink
              key={i}
              providers={providers}
              signer={signer}
              type={type}
              dataSourceSpecId={dataSourceSpecId}
              parentSigner={parentSigner}
              parentDataSourceSpecId={parentDataSourceSpecId}
            />
          );
        })}
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
  parentSigner,
  parentDataSourceSpecId,
}: {
  providers: Provider[];
  signer: SignerKind;
  type: 'settlementData' | 'termination' | 'settlementSchedule';
  dataSourceSpecId: string;
  parentSigner?: SignerKind;
  parentDataSourceSpecId?: string;
}) => {
  // If this is a successor market, the parent market data will only have been passed
  // in if it differs from the current data.
  const signerProviders = getSignerProviders(signer, providers);
  const parentSignerProviders = parentSigner
    ? getSignerProviders(parentSigner, providers)
    : [];

  if (!signerProviders.length) {
    return <NoOracleProof type={type} />;
  }

  return (
    <div className="mt-2">
      {signerProviders.map((provider) => {
        // Making the assumption here that if the provider name is the same,
        // that it is the same provider that the parent market used.
        const parentProvider = parentSignerProviders.find(
          (p) => p.name === provider.name
        );

        const isParentProviderEqual =
          parentProvider !== undefined && isEqual(provider, parentProvider);

        // We only want to pass the parent data to the child component if the
        // data differs from the parent market.
        return isParentProviderEqual ? (
          <OracleProfile
            key={dataSourceSpecId}
            provider={provider}
            dataSourceSpecId={dataSourceSpecId}
          />
        ) : (
          <OracleProfile
            key={dataSourceSpecId}
            provider={provider}
            dataSourceSpecId={dataSourceSpecId}
            parentProvider={parentProvider}
            parentDataSourceSpecId={parentDataSourceSpecId}
          />
        );
      })}
    </div>
  );
};

const NoOracleProof = ({
  type,
}: {
  type: 'settlementData' | 'termination' | 'settlementSchedule';
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
  parentProvider?: Provider;
  parentDataSourceSpecId?: string;
}) => {
  // If this is a successor market, the parent market data will only have been passed
  // in if it differs from the current data.
  const [open, onChange] = useState(false);
  return (
    <div key={props.provider.name}>
      <OracleBasicProfile
        provider={props.provider}
        onClick={() => onChange(!open)}
        parentProvider={props.parentProvider}
      />
      <OracleDialog {...props} open={open} onChange={onChange} />
    </div>
  );
};

export const getAssetSymbol = (market: MarketInfo) => {
  return 'settlementAsset' in market.tradableInstrument.instrument.product
    ? market?.tradableInstrument.instrument.product.settlementAsset.symbol
    : 'baseAsset' in market.tradableInstrument.instrument.product
    ? get(market?.tradableInstrument.instrument.product.baseAsset, 'symbol')
    : '';
};

export const getAssetDecimals = (market: MarketInfo) => {
  return 'settlementAsset' in market.tradableInstrument.instrument.product
    ? market?.tradableInstrument.instrument.product.settlementAsset.decimals
    : 'baseAsset' in market.tradableInstrument.instrument.product
    ? get(market?.tradableInstrument.instrument.product.baseAsset, 'decimals')
    : '';
};

export const getAssetId = (market: MarketInfo) => {
  return 'settlementAsset' in market.tradableInstrument.instrument.product
    ? market?.tradableInstrument.instrument.product.settlementAsset.id
    : 'baseAsset' in market.tradableInstrument.instrument.product
    ? get(market?.tradableInstrument.instrument.product.baseAsset, 'id')
    : '';
};
