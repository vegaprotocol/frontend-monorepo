import isEqual from 'lodash/isEqual';
import type { ReactNode } from 'react';
import { Fragment, useMemo, useState } from 'react';
import { AssetDetailsTable, useAssetDataProvider } from '@vegaprotocol/assets';
import { marketDataProvider } from '../../market-data-provider';
import {
  getBaseAsset,
  getProductType,
  getQuoteAsset,
  totalFeesFactorsPercentage,
} from '../../market-utils';
import {
  Accordion,
  AccordionChevron,
  AccordionPanel,
  CopyWithTooltip,
  ExternalLink,
  Intent,
  KeyValueTable,
  KeyValueTableRow,
  Lozenge,
  Splash,
  SyntaxHighlighter,
  Tooltip,
  VegaIcon,
  VegaIconNames,
  truncateMiddle,
} from '@vegaprotocol/ui-toolkit';
import {
  addDecimalsFormatNumber,
  determinePriceStep,
  formatNumberPercentage,
  getDateTimeFormat,
  getMarketExpiryDateFormatted,
  toBigNum,
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
  EthCallSpec,
  MarketTradingMode,
  SignerKind,
} from '@vegaprotocol/types';
import {
  AccountType,
  CompositePriceType,
  ConditionOperatorMapping,
  LiquidityFeeMethodMapping,
  LiquidityFeeMethodMappingDescription,
  MarketStateMapping,
  MarketTradingModeMapping,
  type SuccessorConfiguration,
} from '@vegaprotocol/types';
import {
  DApp,
  BlockExplorerLink,
  TOKEN_PROPOSAL,
  useEnvironment,
  useLinks,
  DocsLinks,
  getExternalChainLabel,
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
import { getQuoteName, getAsset } from '../../market-utils';
import { cn } from '@vegaprotocol/ui-toolkit';
import compact from 'lodash/compact';
import {
  NetworkParams,
  useNetworkParams,
} from '@vegaprotocol/network-parameters';
import type {
  DataSourceFragment,
  PriceConfigurationFragment,
} from './__generated__/MarketInfo';
import { formatDuration } from 'date-fns';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { useT } from '../../use-t';
import { isFuture, isPerpetual, isSpot } from '../../product';
import omit from 'lodash/omit';
import orderBy from 'lodash/orderBy';
import groupBy from 'lodash/groupBy';
import min from 'lodash/min';
import sum from 'lodash/sum';
import { useDuration } from '@vegaprotocol/react-helpers';

type MarketInfoProps = {
  market: MarketInfo;
  parentMarket?: MarketInfo;
  children?: ReactNode;
};

export const CurrentFeesInfoPanel = ({ market }: MarketInfoProps) => {
  const t = useT();
  return (
    <>
      <MarketInfoTable
        data={{
          makerFee: market.fees.factors.makerFee,
          infrastructureFee: market.fees.factors.infrastructureFee,
          liquidityFee: market.fees.factors.liquidityFee,
          buyBackFee: market.fees.factors.buyBackFee,
          treasuryFee: market.fees.factors.treasuryFee,
          totalFees: totalFeesFactorsPercentage(market.fees.factors),
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
};

export const LiquidityFeesSettings = ({ market }: MarketInfoProps) => {
  const t = useT();
  return (
    <>
      <MarketInfoTable
        data={{
          feeConstant: market.fees.liquidityFeeSettings?.feeConstant,
          method: market.fees.liquidityFeeSettings && (
            <Tooltip
              description={
                LiquidityFeeMethodMappingDescription[
                  market.fees.liquidityFeeSettings?.method
                ]
              }
            >
              <span>
                {
                  LiquidityFeeMethodMapping[
                    market.fees.liquidityFeeSettings?.method
                  ]
                }
              </span>
            </Tooltip>
          ),
        }}
      />
      <p className="text-xs">
        <ExternalLink
          href={DocsLinks?.LIQUIDITY_FEE_PERCENTAGE}
          className="mt-2"
        >
          {t('Fore more info, visit the documentation')}
        </ExternalLink>
      </p>
    </>
  );
};

export const MarketPriceInfoPanel = ({ market }: MarketInfoProps) => {
  const t = useT();
  const assetSymbol = getAsset(market).symbol;
  const quoteUnit = getQuoteName(market);
  const { data } = useDataProvider({
    dataProvider: marketDataProvider,
    variables: { marketId: market.id },
  });
  const isSpotMarket = isSpot(market.tradableInstrument.instrument.product);
  return (
    <>
      <MarketInfoTable
        data={{
          markPrice: data?.markPrice,
          bestBidPrice: data?.bestBidPrice,
          bestOfferPrice: data?.bestOfferPrice,
          quoteUnit,
        }}
        decimalPlaces={market.decimalPlaces}
      />
      {!isSpotMarket && (
        <p className="mt-2 text-xs">
          {t(
            'There is 1 unit of the settlement asset ({{assetSymbol}}) to every 1 quote unit ({{quoteUnit}}).',
            { assetSymbol, quoteUnit }
          )}
        </p>
      )}
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
            marketDecimals={market.decimalPlaces}
            positionDecimalPlaces={market.positionDecimalPlaces}
            quoteUnit={getQuoteName(market)}
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
  const asset = getAsset(market);

  return (
    <MarketInfoTable
      data={{
        insurancePoolBalance: account.balance,
      }}
      assetSymbol={asset.symbol}
      decimalPlaces={asset.decimals}
    />
  );
};

export const KeyDetailsInfoPanel = ({
  market,
  parentMarket,
}: MarketInfoProps) => {
  const t = useT();
  const { data: parentMarketIdData } = useParentMarketIdQuery({
    variables: {
      marketId: market.id,
    },
  });
  const proposalId =
    (market.marketProposal?.__typename === 'Proposal' &&
      market.marketProposal.id) ||
    '';

  const { data: successorProposalDetails } =
    useSuccessorMarketProposalDetailsQuery({
      variables: {
        proposalId,
      },
      skip: !(
        market.marketProposal?.__typename === 'Proposal' &&
        market.marketProposal?.id
      ),
    });

  let successorConfiguration: SuccessorConfiguration | false = false;

  if (successorProposalDetails?.proposal?.__typename === 'Proposal') {
    successorConfiguration =
      successorProposalDetails.proposal.terms.change.__typename ===
        'NewMarket' &&
      successorProposalDetails.proposal.terms.change.successorConfiguration
        ?.__typename === 'SuccessorConfiguration' &&
      successorProposalDetails.proposal.terms.change.successorConfiguration;
  } else if (
    successorProposalDetails?.proposal?.__typename === 'BatchProposal'
  ) {
    const subTerms = successorProposalDetails.proposal.batchTerms?.changes.find(
      (c) => c?.change.__typename === 'NewMarket'
    );
    successorConfiguration =
      subTerms?.change.__typename === 'NewMarket' &&
      subTerms?.change.successorConfiguration?.__typename ===
        'SuccessorConfiguration' &&
      subTerms?.change?.successorConfiguration;
  }

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
        proposalId,
      },
      skip: !proposalId,
    });

  let parentSuccessorConfig: SuccessorConfiguration | undefined = undefined;

  if (parentSuccessorProposalDetails?.proposal?.__typename === 'Proposal') {
    const parentProposal = parentSuccessorProposalDetails?.proposal;
    parentSuccessorConfig =
      parentProposal.terms.change.__typename === 'NewMarket'
        ? parentProposal.terms.change.successorConfiguration || undefined
        : undefined;
  } else if (
    parentSuccessorProposalDetails?.proposal?.__typename === 'BatchProposal'
  ) {
    const subTerms =
      parentSuccessorProposalDetails.proposal.batchTerms?.changes.find(
        (c) => c?.change.__typename === 'NewMarket'
      );
    parentSuccessorConfig =
      subTerms?.change.__typename === 'NewMarket'
        ? subTerms.change.successorConfiguration || undefined
        : undefined;
  }

  const isSpotMarket = isSpot(market.tradableInstrument.instrument.product);

  if (isSpotMarket) {
    const quoteAssetDecimals = getQuoteAsset(market).decimals;
    const baseAssetDecimals = getBaseAsset(market).decimals;
    return (
      <>
        <KeyValueTable>
          <KeyValueTableRow noBorder className="text-xs">
            <div>{t('Market ID')}</div>
            <CopyWithTooltip text={market.id}>
              <button
                data-testid="copy-eth-oracle-address"
                className="text-right uppercase"
              >
                <span className="flex gap-1">
                  {truncateMiddle(market.id)}
                  <VegaIcon name={VegaIconNames.COPY} size={16} />
                </span>
              </button>
            </CopyWithTooltip>
          </KeyValueTableRow>
        </KeyValueTable>
        <MarketInfoTable
          data={{
            name: market.tradableInstrument.instrument.name,
            status: market.state && MarketStateMapping[market.state],
            tradingMode:
              market.tradingMode &&
              MarketTradingModeMapping[market.tradingMode],
            priceDecimalPlaces: market.decimalPlaces,
            sizeDecimalPlaces: market.positionDecimalPlaces,
            quoteAssetDecimalPlaces: quoteAssetDecimals,
            baseAssetDecimalPlaces: baseAssetDecimals,
            tickSize: determinePriceStep(market),
          }}
        />
      </>
    );
  }

  const assetDecimals = getAsset(market).decimals;

  const marketInsuranceAccount = market.accountsConnection?.edges?.find(
    (account) => {
      if (!account || !account.node) return false;
      if (account.node.type === AccountType.ACCOUNT_TYPE_INSURANCE) {
        return true;
      }
      return false;
    }
  );

  const marketInsuranceAccountBalance = marketInsuranceAccount?.node?.balance
    ? addDecimalsFormatNumber(
        marketInsuranceAccount.node.balance,
        assetDecimals
      )
    : 0;

  return (
    <>
      <KeyValueTable>
        <KeyValueTableRow noBorder className="text-xs">
          <div>{t('Market ID')}</div>
          <CopyWithTooltip text={market.id}>
            <button
              data-testid="copy-eth-oracle-address"
              className="text-right uppercase"
            >
              <span className="flex gap-1">
                {truncateMiddle(market.id)}
                <VegaIcon name={VegaIconNames.COPY} size={16} />
              </span>
            </button>
          </CopyWithTooltip>
        </KeyValueTableRow>
      </KeyValueTable>
      <MarketInfoTable
        data={
          successorConfiguration
            ? {
                name: market.tradableInstrument.instrument.name,
                parentMarketID:
                  parentMarketIdData?.market?.parentMarketID || '-',
                insurancePoolFraction:
                  successorConfiguration.insurancePoolFraction || '-',
                status: market.state && MarketStateMapping[market.state],
                tradingMode:
                  market.tradingMode &&
                  MarketTradingModeMapping[market.tradingMode],
                marketDecimalPlaces: market.decimalPlaces,
                positionDecimalPlaces: market.positionDecimalPlaces,
                settlementAssetDecimalPlaces: assetDecimals,
                tickSize: determinePriceStep(market),
                marketInsuranceAccount: marketInsuranceAccountBalance,
              }
            : {
                name: market.tradableInstrument.instrument.name,
                status: market.state && MarketStateMapping[market.state],
                tradingMode:
                  market.tradingMode &&
                  MarketTradingModeMapping[market.tradingMode],
                marketDecimalPlaces: market.decimalPlaces,
                positionDecimalPlaces: market.positionDecimalPlaces,
                settlementAssetDecimalPlaces: assetDecimals,
                tickSize: determinePriceStep(market),
                marketInsuranceAccount: marketInsuranceAccountBalance,
              }
        }
        parentData={
          parentMarket && {
            name: parentMarket?.tradableInstrument?.instrument?.name,
            parentMarketID: grandparentMarketIdData?.market?.parentMarketID,
            insurancePoolFraction: parentSuccessorConfig?.insurancePoolFraction,
            status:
              parentMarket?.state && MarketStateMapping[parentMarket.state],
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
    </>
  );
};

const SuccessionLineItem = ({
  marketId,
  isCurrent,
}: {
  marketId: string;
  isCurrent?: boolean;
}) => {
  const t = useT();
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
      className="bg-surface-2 rounded p-2 flex flex-col"
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
            <span className="bg-gs-500  mb-1 block h-4 w-20 animate-pulse"></span>
          )}
        </div>
        {isCurrent && (
          <Tooltip description={t('This market')}>
            <div className="text-surface-2-fg  cursor-help">
              <VegaIcon name={VegaIconNames.BULLET} size={16} />
            </div>
          </Tooltip>
        )}
      </div>
      <div className="text-xs">
        {marketData ? (
          marketData.tradableInstrument.instrument.name
        ) : (
          <span className="bg-gs-500  block h-4 w-28 animate-pulse"></span>
        )}
      </div>
      <div
        data-testid="succession-line-item-market-id"
        className="mt-1 truncate text-xs"
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
}: MarketInfoProps) => {
  const t = useT();
  const productType = getProductType(market);
  const instrument = market.tradableInstrument.instrument;
  const product = instrument.product;
  return (
    <MarketInfoTable
      data={{
        marketName: instrument.name,
        code: instrument.code,
        productType: productType,
        quoteName: getQuoteName(market),
        priceCap:
          isFuture(product) && product.cap?.maxPrice
            ? addDecimalsFormatNumber(
                product.cap.maxPrice,
                market.decimalPlaces
              )
            : t('No'),
        binarySettlement:
          isFuture(product) && product.cap?.binarySettlement
            ? t('Yes')
            : t('No'),
        fullyCollateralised:
          isFuture(product) && product.cap?.fullyCollateralised
            ? t('Yes')
            : t('No'),
      }}
      parentData={
        parentMarket && {
          marketName: parentMarket?.tradableInstrument?.instrument?.name,
          code: parentMarket?.tradableInstrument?.instrument?.code,
          productType:
            parentMarket?.tradableInstrument?.instrument?.product?.__typename,
          quoteName: getQuoteName(parentMarket),
        }
      }
    />
  );
};

export const BaseAssetInfoPanel = ({ market }: MarketInfoProps) => {
  const t = useT();
  const assetSymbol = getBaseAsset(market).symbol;
  const quoteAsset = getQuoteAsset(market);
  const assetId = useMemo(() => getBaseAsset(market).id, [market]);

  const { data: asset } = useAssetDataProvider(assetId ?? '');
  const isSpotMarket = isSpot(market.tradableInstrument.instrument.product);
  return asset ? (
    <>
      <AssetDetailsTable
        asset={asset}
        inline={true}
        noBorder={true}
        dtClassName="text-black dark:text-white text-ui !px-0 text-xs"
        ddClassName="text-black dark:text-white text-ui !px-0 max-w-full text-xs"
      />
      {!isSpotMarket && (
        <p className="mt-4 text-xs">
          {t(
            'There is 1 unit of the base asset ({{assetSymbol}}) to every 1 quote asset ({{quoteUnit}}).',
            { assetSymbol, quoteUnit: quoteAsset }
          )}
        </p>
      )}
    </>
  ) : (
    <Splash>{t('No data')}</Splash>
  );
};

export const QuoteAssetInfoPanel = ({ market }: MarketInfoProps) => {
  const t = useT();
  const assetSymbol = getQuoteAsset(market).symbol;
  const quoteAsset = getQuoteAsset(market);
  const assetId = useMemo(() => getQuoteAsset(market).id, [market]);

  const { data: asset } = useAssetDataProvider(assetId ?? '');
  const isSpotMarket = isSpot(market.tradableInstrument.instrument.product);
  return asset ? (
    <>
      <AssetDetailsTable
        asset={asset}
        inline={true}
        noBorder={true}
        dtClassName="text-black dark:text-white text-ui !px-0 text-xs"
        ddClassName="text-black dark:text-white text-ui !px-0 max-w-full text-xs"
      />
      {!isSpotMarket && (
        <p className="mt-4 text-xs">
          {t(
            'There is 1 unit of the base asset ({{assetSymbol}}) to every 1 quote asset ({{quoteUnit}}).',
            { assetSymbol, quoteUnit: quoteAsset }
          )}
        </p>
      )}
    </>
  ) : (
    <Splash>{t('No data')}</Splash>
  );
};

export const SettlementAssetInfoPanel = ({ market }: MarketInfoProps) => {
  const t = useT();
  const assetSymbol = getAsset(market).symbol;
  const quoteUnit = getQuoteName(market);
  const assetId = useMemo(() => getAsset(market).id, [market]);

  const { data: asset } = useAssetDataProvider(assetId ?? '');
  const isSpotMarket = isSpot(market.tradableInstrument.instrument.product);
  return asset ? (
    <>
      <AssetDetailsTable
        asset={asset}
        inline={true}
        noBorder={true}
        dtClassName="text-black dark:text-white text-ui !px-0 text-xs"
        ddClassName="text-black dark:text-white text-ui !px-0 max-w-full text-xs"
      />
      {!isSpotMarket && (
        <p className="mt-4 text-xs">
          {t(
            'There is 1 unit of the settlement asset ({{assetSymbol}}) to every 1 quote unit ({{quoteUnit}}).',
            { assetSymbol, quoteUnit }
          )}
        </p>
      )}
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
    <>
      <MarketInfoTable
        data={{ tau, riskAversionParameter }}
        parentData={parentData}
        unformatted
      />
      <RiskParametersInfoPanel market={market} parentMarket={parentMarket} />
    </>
  );
};

export const MarginScalingFactorsPanel = ({
  market,
  parentMarket,
}: MarketInfoProps) => {
  const data = {
    linearSlippageFactor: market.linearSlippageFactor,
    searchLevel:
      market.tradableInstrument.marginCalculator?.scalingFactors.searchLevel,
    initialMargin:
      market.tradableInstrument.marginCalculator?.scalingFactors.initialMargin,
    collateralRelease:
      market.tradableInstrument.marginCalculator?.scalingFactors
        .collateralRelease,
  };

  const parentData = parentMarket
    ? {
        linearSlippageFactor: parentMarket?.linearSlippageFactor,
        searchLevel:
          parentMarket?.tradableInstrument.marginCalculator?.scalingFactors
            .searchLevel,
        initialMargin:
          parentMarket?.tradableInstrument.marginCalculator?.scalingFactors
            .initialMargin,
        collateralRelease:
          parentMarket?.tradableInstrument.marginCalculator?.scalingFactors
            .collateralRelease,
      }
    : undefined;

  return <MarketInfoTable data={data} parentData={parentData} unformatted />;
};

const RiskParametersInfoPanel = ({ market, parentMarket }: MarketInfoProps) => {
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
  const getLeverageFactors = (market: MarketInfo) => {
    if (!market.riskFactors) {
      return undefined;
    }

    const { short, long } = market.riskFactors;

    const maxLeverageLong = new BigNumber(1).dividedBy(long);

    const maxLeverageShort = new BigNumber(1).dividedBy(short);

    const maxInitialLeverageLong = !market.tradableInstrument.marginCalculator
      ? undefined
      : new BigNumber(1)
          .dividedBy(
            market.tradableInstrument.marginCalculator.scalingFactors
              .initialMargin
          )
          .times(maxLeverageLong);

    const maxInitialLeverageShort = !market.tradableInstrument.marginCalculator
      ? undefined
      : new BigNumber(1)
          .dividedBy(
            market.tradableInstrument.marginCalculator.scalingFactors
              .initialMargin
          )
          .times(maxLeverageShort);

    const formatValue = (number: BigNumber | string | undefined) => {
      if (!number) return undefined;
      const value = new BigNumber(number);
      if (value.gte(10)) {
        return value.toFixed(3);
      } else {
        return value.toFixed(5);
      }
    };

    const data = {
      long: formatValue(long),
      short: formatValue(short),
      maxLeverageLong: formatValue(maxLeverageLong),
      maxLeverageShort: formatValue(maxLeverageShort),
      maxInitialLeverageLong: formatValue(maxInitialLeverageLong),
      maxInitialLeverageShort: formatValue(maxInitialLeverageShort),
    };
    return data;
  };

  const data = getLeverageFactors(market);
  const parentData = parentMarket
    ? getLeverageFactors(parentMarket)
    : undefined;

  return <MarketInfoTable data={data} parentData={parentData} unformatted />;
};

type TriggerInfo = {
  maxValidPrice: BigNumber;
  minValidPrice: BigNumber;
  referencePrice: BigNumber;
  horizonSecs: number;
  probability: number;
  auctionExtensionSecs: number;
};

/** Calculates a trigger info group signature. */
const triggerInfoGroupIteratee = (t: TriggerInfo) =>
  `${t.horizonSecs}|${
    t.probability
  }|${t.minValidPrice.toString()}|${t.maxValidPrice.toString()}`;

type ExtendedTriggerInfo = Omit<TriggerInfo, 'auctionExtensionSecs'> & {
  minAuctionExtensionSecs: number;
  maxAuctionExtensionSecs: number;
};

export const PriceMonitoringBoundsInfoPanel = ({ market }: MarketInfoProps) => {
  const t = useT();
  const duration = useDuration();
  const compactDuration = useDuration('compact');
  const { data } = useDataProvider({
    dataProvider: marketDataProvider,
    variables: { marketId: market.id },
  });

  const quoteUnit = getQuoteName(market);

  let triggers = Object.entries(
    groupBy(
      data?.priceMonitoringBounds?.map((b) => ({
        ...omit(b.trigger, '__typename'),
        maxValidPrice: toBigNum(b.maxValidPrice, market.decimalPlaces),
        minValidPrice: toBigNum(b.minValidPrice, market.decimalPlaces),
        referencePrice: toBigNum(b.referencePrice, market.decimalPlaces),
      })),
      triggerInfoGroupIteratee
    )
  ).map(([_, ts]) => {
    const info = omit(ts[0], 'auctionExtensionSecs');
    const auctions = ts.map((t) => t.auctionExtensionSecs);
    const minAuctionExtensionSecs = min(auctions) as number;
    const maxAuctionExtensionSecs = sum(auctions);
    const extendedInfo: ExtendedTriggerInfo = {
      ...info,
      minAuctionExtensionSecs,
      maxAuctionExtensionSecs,
    };
    return extendedInfo;
  });

  triggers = orderBy(
    triggers,
    [
      (bd) => bd.probability,
      (bd) => bd.horizonSecs,
      (bd) => bd.minAuctionExtensionSecs,
      (bd) => bd.maxAuctionExtensionSecs,
    ],
    ['desc', 'asc', 'asc', 'asc']
  );

  if (!triggers || triggers.length === 0) {
    return <div>{t('No price monitoring bounds detected.')}</div>;
  }

  const price = (price: string, direction: 'min' | 'max') => (
    <div
      className={cn(
        'rounded px-1 py-[1px] bg-gs-500  relative',
        'after:absolute after:content-[" "] after:z-10',
        'after:block after:w-3 after:h-3 after:bg-gs-500 after:rotate-45 after:-translate-y-1/2',
        {
          'after:top-1/2 after:right-[-6px]': direction === 'min',
          'after:top-1/2 after:left-[-6px]': direction === 'max',
        }
      )}
    >
      <div
        className={cn('text-[10px]', {
          'text-left': direction === 'min',
          'text-right': direction === 'max',
        })}
        data-testid={
          direction === 'min' ? 'text-left-alignment' : 'text-right-alignment'
        }
      >
        {price} <span>{quoteUnit}</span>
      </div>
    </div>
  );

  return triggers.map((trigger, index) => {
    const probability = formatNumberPercentage(
      new BigNumber(trigger.probability).times(100)
    );
    const within = compactDuration(trigger.horizonSecs * 1000);
    return (
      <div key={index} className="mb-2 border-b border-b-gs-500">
        <div className="font-mono text-xs flex">
          {/** MIN PRICE */}
          <Tooltip
            description={t(
              "Minimum price that isn't currently breaching the specified price monitoring trigger"
            )}
          >
            {price(trigger.minValidPrice.toString(10), 'min')}
          </Tooltip>

          {/** TRIGGERS WHEN */}
          <Tooltip
            description={t(
              '{{probability}} of prices must be within the bounds for {{duration}}',
              {
                probability: probability,
                duration: within,
              }
            )}
          >
            <div aria-hidden className="w-full text-center text-[10px]">
              <div
                data-testid="bounds-percent-price"
                className="border-b-[2px] border-dashed border-gs-300 dark:border-gs-700 w-full h-1/2 translate-y-[1px]"
              >
                {probability}
              </div>
              <div data-testid="bounds-price-time" className="w-full">
                {t('within {{duration}}', {
                  duration: within,
                })}
              </div>
            </div>
          </Tooltip>

          {/** MAX PRICE */}
          <Tooltip
            description={t(
              "Maximum price that isn't currently breaching the specified price monitoring trigger"
            )}
          >
            {price(trigger.maxValidPrice.toString(10), 'max')}
          </Tooltip>
        </div>
        <p className="my-2 text-xs leading-none">
          {t('Results in {{duration}} auction if breached', {
            duration:
              trigger.minAuctionExtensionSecs !==
              trigger.maxAuctionExtensionSecs
                ? `${duration(
                    trigger.minAuctionExtensionSecs * 1000
                  )} ~ ${duration(trigger.maxAuctionExtensionSecs * 1000)}`
                : duration(trigger.minAuctionExtensionSecs * 1000),
          })}
        </p>
      </div>
    );
  });
};

export const PriceMonitoringSettingsInfoPanel = ({
  market,
  className,
}: MarketInfoProps & { className?: string }) => {
  const t = useT();

  const triggers = groupBy(
    market.priceMonitoringSettings?.parameters?.triggers?.map((t) =>
      omit(t, '__typename')
    ) || [],
    (t) => `${t.horizonSecs}|${t.probability}|${t.auctionExtensionSecs}`
  );

  return (
    <dl className="grid grid-cols-3 md:grid-cols-6 gap-3">
      {Object.entries(triggers).map(([_, trigger], i) => (
        <span className="border p-3 rounded">
          <dt className="text-sm font-bold">
            {t('triggers', {
              count: trigger.length,
            })}
          </dt>
          <dt>
            <MarketInfoTable data={trigger[0]} />
          </dt>
        </span>
      ))}
    </dl>
  );
};

export const LiquidationStrategyInfoPanel = ({
  market,
  parentMarket,
}: MarketInfoProps) => {
  const marketData = {
    disposalFraction: market.liquidationStrategy?.disposalFraction,
    disposalTimeStep: market.liquidationStrategy?.disposalTimeStep,
    fullDisposalSize: market.liquidationStrategy?.fullDisposalSize,
    maxFractionConsumed: market.liquidationStrategy?.maxFractionConsumed,
  };

  const parentMarketData = parentMarket
    ? {
        disposalFraction: parentMarket.liquidationStrategy?.disposalFraction,
        disposalTimeStep: parentMarket.liquidationStrategy?.disposalTimeStep,
        fullDisposalSize: parentMarket.liquidationStrategy?.fullDisposalSize,
        maxFractionConsumed:
          parentMarket.liquidationStrategy?.maxFractionConsumed,
      }
    : undefined;

  return <MarketInfoTable data={marketData} parentData={parentMarketData} />;
};

export const LiquidityMonitoringParametersInfoPanel = ({
  market,
  parentMarket,
}: MarketInfoProps) => {
  const marketData = {
    timeWindow:
      market.liquidityMonitoringParameters.targetStakeParameters.timeWindow,
    scalingFactor:
      market.liquidityMonitoringParameters.targetStakeParameters.scalingFactor,
  };

  const parentMarketData = parentMarket
    ? {
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

export const EthOraclePanel = ({ sourceType }: { sourceType: EthCallSpec }) => {
  const t = useT();
  const abis = sourceType.abi?.map((abi) => JSON.parse(abi));
  const header = 'uppercase my-1 text-left';
  return (
    <>
      <h3 className={header}>{t('Ethereum Oracle')}</h3>
      {sourceType.address && (
        <>
          <KeyValueTable>
            <KeyValueTableRow noBorder>
              <div>{t('Address')}</div>
              <CopyWithTooltip text={sourceType.address}>
                <button
                  data-testid="copy-eth-oracle-address"
                  className="text-right uppercase"
                >
                  <span className="flex gap-1">
                    {truncateMiddle(sourceType.address)}
                    <VegaIcon name={VegaIconNames.COPY} size={16} />
                  </span>
                </button>
              </CopyWithTooltip>
            </KeyValueTableRow>
          </KeyValueTable>

          <div className="my-2">
            <BlockExplorerLink
              address={sourceType.address}
              sourceChainId={sourceType.sourceChainId}
            >
              {t('View on {{chainLabel}}', {
                chainLabel: getExternalChainLabel(
                  (sourceType.sourceChainId || 1).toString()
                ),
              })}
            </BlockExplorerLink>
          </div>
        </>
      )}
      <MarketInfoTable
        key="eth-call-spec"
        data={{
          method: sourceType.method,
          requiredConfirmations: sourceType.requiredConfirmations,
        }}
      />
      <Accordion>
        <AccordionPanel
          itemId="abi"
          trigger={
            <AccordionPrimitive.Trigger
              data-testid="accordion-toggle"
              className={cn('w-full pt-2', 'flex items-center gap-2', 'group')}
            >
              <div
                data-testid={`abi-dropdown`}
                key={'value-dropdown'}
                className="flex w-full items-center gap-2"
              >
                <div className="mb-1 uppercase underline underline-offset-4">
                  {t('ABI specification')}
                </div>
                <AccordionChevron size={14} />
                <div className="flex items-center gap-1"></div>
              </div>
            </AccordionPrimitive.Trigger>
          }
        >
          <SyntaxHighlighter data={abis} />
        </AccordionPanel>
      </Accordion>
      <h3 className={header}>{t('Normalisers')}</h3>
      {sourceType.normalisers?.map((normaliser, i) => (
        <MarketInfoTable key={i} data={normaliser} />
      ))}
      <h3 className={header}>{t('Filters')}</h3>
      <h3 className={header}>{t('Key')}</h3>
      {sourceType.filters?.map((filter, i) => (
        <>
          <MarketInfoTable key={i} data={filter.key} />
          <h3 className={header}>{t('Conditions')}</h3>
          {filter.conditions?.map((condition, i) => (
            <span key={i}>
              {ConditionOperatorMapping[condition.operator]} {condition.value}
            </span>
          ))}
        </>
      ))}
    </>
  );
};

export const LiquidityPriceRangeInfoPanel = ({
  market,
  parentMarket,
}: MarketInfoProps) => {
  const t = useT();
  const marketLpPriceRange = market.liquiditySLAParameters?.priceRange;
  const parentMarketLpPriceRange =
    parentMarket?.liquiditySLAParameters?.priceRange;
  const quoteUnit =
    ('quoteName' in market.tradableInstrument.instrument.product &&
      market?.tradableInstrument.instrument.product?.quoteName) ||
    '';
  const parentQuoteUnit =
    (parentMarket &&
      'quoteName' in parentMarket.tradableInstrument.instrument.product &&
      parentMarket?.tradableInstrument.instrument.product?.quoteName) ||
    '';

  const liquidityPriceRange =
    marketLpPriceRange &&
    formatNumberPercentage(new BigNumber(marketLpPriceRange).times(100));
  const parentLiquidityPriceRange =
    parentMarket && parentMarketLpPriceRange
      ? formatNumberPercentage(
          new BigNumber(parentMarketLpPriceRange).times(100)
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
      liquidityPriceRange: t(`{{parentLiquidityPriceRange}} of mid price`, {
        parentLiquidityPriceRange,
      }),
      lowestPrice:
        parentMarketLpPriceRange &&
        parentMarketData?.midPrice &&
        `${addDecimalsFormatNumber(
          new BigNumber(1)
            .minus(parentMarketLpPriceRange)
            .times(parentMarketData.midPrice)
            .toString(),
          parentMarket.decimalPlaces
        )} ${quoteUnit}`,
      highestPrice:
        parentMarketLpPriceRange &&
        parentMarketData?.midPrice &&
        `${addDecimalsFormatNumber(
          new BigNumber(1)
            .plus(parentMarketLpPriceRange)
            .times(parentMarketData.midPrice)
            .toString(),
          parentMarket.decimalPlaces
        )} ${quoteUnit}`,
    };
  }

  return (
    <>
      <p className="mb-2 border-l-2 pl-2 text-xs">
        {t(
          `For liquidity orders to count towards a commitment, they must be within the liquidity monitoring bounds.`
        )}
      </p>
      <MarketInfoTable
        data={{
          liquidityPriceRange: t(`{{liquidityPriceRange}} of mid price`, {
            liquidityPriceRange,
          }),
          lowestPrice:
            marketLpPriceRange &&
            data?.midPrice &&
            `${addDecimalsFormatNumber(
              new BigNumber(1)
                .minus(marketLpPriceRange)
                .times(data.midPrice)
                .toString(),
              market.decimalPlaces
            )} ${quoteUnit}`,
          highestPrice:
            marketLpPriceRange &&
            data?.midPrice &&
            `${addDecimalsFormatNumber(
              new BigNumber(1)
                .plus(marketLpPriceRange)
                .times(data.midPrice)
                .toString(),
              market.decimalPlaces
            )} ${quoteUnit}`,
        }}
        parentData={parentData}
      />
      <p className="mb-2 mt-2 border-l-2 pl-2 text-xs">
        {t(
          'The liquidity price range is a {{liquidityPriceRange}} difference from the mid price.',
          { liquidityPriceRange }
        )}
      </p>
    </>
  );
};

const fromNanoSecondsToSeconds = (nanoseconds: number | string) =>
  `${new BigNumber(nanoseconds).dividedBy(1e9).toString()}s`;

export const LiquiditySLAParametersInfoPanel = ({
  market,
  parentMarket,
}: MarketInfoProps) => {
  const marketData = {
    performanceHysteresisEpochs:
      market.liquiditySLAParameters?.performanceHysteresisEpochs,
    SLACompetitionFactor:
      market.liquiditySLAParameters?.slaCompetitionFactor &&
      formatNumberPercentage(
        new BigNumber(
          market.liquiditySLAParameters?.slaCompetitionFactor
        ).times(100)
      ),
    commitmentMinTimeFraction:
      market.liquiditySLAParameters?.commitmentMinTimeFraction &&
      formatNumberPercentage(
        new BigNumber(
          market.liquiditySLAParameters?.commitmentMinTimeFraction
        ).times(100)
      ),
  };

  const parentMarketData = parentMarket
    ? {
        performanceHysteresisEpochs:
          parentMarket.liquiditySLAParameters?.performanceHysteresisEpochs,
        slaCompetitionFactor:
          parentMarket.liquiditySLAParameters?.slaCompetitionFactor,
        commitmentMinTimeFraction:
          parentMarket.liquiditySLAParameters?.commitmentMinTimeFraction,
      }
    : undefined;

  const { params: networkParams } = useNetworkParams([
    NetworkParams.market_liquidity_bondPenaltyParameter,
    NetworkParams.market_liquidity_sla_nonPerformanceBondPenaltySlope,
    NetworkParams.market_liquidity_sla_nonPerformanceBondPenaltyMax,
    NetworkParams.market_liquidity_maximumLiquidityFeeFactorLevel,
    NetworkParams.market_liquidity_stakeToCcyVolume,
    NetworkParams.validators_epoch_length,
    NetworkParams.market_liquidity_earlyExitPenalty,
    NetworkParams.market_liquidity_probabilityOfTrading_tau_scaling,
    NetworkParams.market_liquidity_minimum_probabilityOfTrading_lpOrders,
    NetworkParams.market_liquidity_feeCalculationTimeStep,
  ]);

  const marketNetworkParamData = {
    epochLength: networkParams['validators_epoch_length'],
    bondPenaltyParameter:
      networkParams['market_liquidity_bondPenaltyParameter'],
    nonPerformanceBondPenaltySlope:
      networkParams['market_liquidity_sla_nonPerformanceBondPenaltySlope'],
    nonPerformanceBondPenaltyMax:
      networkParams['market_liquidity_sla_nonPerformanceBondPenaltyMax'],
    maxLiquidityFeeFactorLevel:
      networkParams['market_liquidity_maximumLiquidityFeeFactorLevel'],
    stakeToCCYVolume: networkParams['market_liquidity_stakeToCcyVolume'],
    earlyExitPenalty: networkParams['market_liquidity_earlyExitPenalty'],
    probabilityOfTradingTauScaling:
      networkParams['market_liquidity_probabilityOfTrading_tau_scaling'],
    minProbabilityOfTradingLPOrders:
      networkParams['market_liquidity_minimum_probabilityOfTrading_lpOrders'],
    feeCalculationTimeStep:
      networkParams['market_liquidity_feeCalculationTimeStep'] &&
      fromNanoSecondsToSeconds(
        networkParams['market_liquidity_feeCalculationTimeStep']
      ),
  };

  return (
    <>
      <MarketInfoTable data={marketData} parentData={parentMarketData} />
      <MarketInfoTable data={marketNetworkParamData} unformatted={true} />
    </>
  );
};

export const LiquidityInfoPanel = ({ market, children }: MarketInfoProps) => {
  const asset = getAsset(market);
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
        }}
        decimalPlaces={asset.decimals}
        assetSymbol={asset.symbol}
      />
      {children}
    </>
  );
};

export const FundingInfoPanel = ({
  dataSource,
  market,
}: {
  dataSource: DataSourceFragment;
  market: MarketInfo;
}) => {
  const t = useT();
  const sourceType = dataSource.data.sourceType.sourceType;
  if (
    sourceType.__typename !== 'DataSourceSpecConfigurationTimeTrigger' ||
    !sourceType.triggers?.[0]?.every
  ) {
    return null;
  }
  const { every, initial } = sourceType.triggers[0];
  const hours = Math.floor(every / (60 * 60));
  const minutes = Math.floor(every / 60) % 60;
  const duration = formatDuration({
    hours,
    minutes,
  });
  const { product } = market.tradableInstrument.instrument;
  const indexPrice = (
    <DataSourceLinks {...getDataSourceSpec(product, 'settlementData')} />
  );
  return (
    <>
      <p
        className="first-letter:uppercase text-x;w
        "
      >
        {initial
          ? t('every {{duration}} from {{initialTime}}', {
              duration,
              initialTime: getDateTimeFormat().format(new Date(initial * 1000)),
            })
          : t('every {{duration}}', { duration })}
      </p>
      <MarketInfoTable
        data={{
          rateScalingFactor:
            isPerpetual(product) && product.fundingRateScalingFactor,
          rateLowerBound: isPerpetual(product) && product.fundingRateLowerBound,
          rateUpperBound: isPerpetual(product) && product.fundingRateUpperBound,
        }}
      />
      {indexPrice && (
        <>
          <div className="my-1">{t('Index price')}</div>
          {indexPrice}
        </>
      )}
    </>
  );
};

const DataSourceLinks = ({
  dataSourceSpec,
  dataSourceSpecId,
}: ReturnType<typeof getDataSourceSpec>) => {
  const t = useT();
  const { VEGA_EXPLORER_URL } = useEnvironment();
  const address = dataSourceSpec &&
    dataSourceSpec.sourceType.__typename === 'DataSourceDefinitionExternal' &&
    dataSourceSpec.sourceType.sourceType?.__typename === 'EthCallSpec' && (
      <KeyValueTableRow noBorder className="text-xs">
        <div>{t('Address')}</div>
        <CopyWithTooltip text={dataSourceSpec.sourceType.sourceType.address}>
          <button
            data-testid="copy-eth-oracle-address"
            className="text-right uppercase"
          >
            <span className="flex gap-1">
              {truncateMiddle(dataSourceSpec.sourceType.sourceType.address)}
              <VegaIcon name={VegaIconNames.COPY} size={16} />
            </span>
          </button>
        </CopyWithTooltip>
      </KeyValueTableRow>
    );
  const explorerLink = dataSourceSpecId && (
    <ExternalLink
      data-testid="oracle-spec-links"
      href={`${VEGA_EXPLORER_URL}/oracles/${dataSourceSpecId}`}
      className="text-xs my-1"
    >
      {t('View specification')}
    </ExternalLink>
  );
  return address || explorerLink ? (
    <KeyValueTable>
      {address}
      {explorerLink}
    </KeyValueTable>
  ) : null;
};

export const TerminationAndSettlementPanel = ({
  market,
}: {
  market: MarketInfo;
}) => {
  const t = useT();
  const { product } = market.tradableInstrument.instrument;
  const settlement = (
    <DataSourceLinks {...getDataSourceSpec(product, 'settlementData')} />
  );
  const termination = (
    <DataSourceLinks {...getDataSourceSpec(product, 'termination')} />
  );

  return (
    <>
      {settlement && (
        <>
          <div className="my-1">{t('Settlement')}</div>
          {settlement}
        </>
      )}
      {termination && (
        <>
          <div className="my-1">{t('Termination')}</div>
          {termination}
        </>
      )}
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
  const t = useT();
  const product = market.tradableInstrument.instrument.product;
  const parentProduct = parentMarket?.tradableInstrument?.instrument?.product;
  const { VEGA_EXPLORER_URL, ORACLE_PROOFS_URL } = useEnvironment();
  const { data } = useOracleProofs(ORACLE_PROOFS_URL);

  const { dataSourceSpecId, dataSourceSpec } = getDataSourceSpec(product, type);

  let parentDataSourceSpecId, parentDataSourceSpec;
  if (parentProduct) {
    parentDataSourceSpec = getDataSourceSpec(parentProduct, type);
    parentDataSourceSpecId = parentDataSourceSpec.dataSourceSpecId;
    parentDataSourceSpec = parentDataSourceSpec.dataSourceSpec;
  }

  const shouldShowParentData =
    parentMarket !== undefined &&
    parentDataSourceSpecId !== undefined &&
    !isEqual(dataSourceSpec, parentDataSourceSpec);

  const wrapperClasses = cn('mb-4', {
    'flex items-center gap-6': shouldShowParentData,
  });

  return (
    <>
      {shouldShowParentData && (
        <Lozenge intent={Intent.Primary} className="text-sm">
          {t('Updated')}
        </Lozenge>
      )}

      {dataSourceSpec?.sourceType.sourceType.__typename === 'EthCallSpec' && (
        <EthOraclePanel sourceType={dataSourceSpec?.sourceType.sourceType} />
      )}

      <div className={wrapperClasses}>
        {shouldShowParentData &&
          parentDataSourceSpec &&
          parentDataSourceSpecId &&
          parentProduct && (
            <div className="text-gs-300 flex flex-col gap-2 line-through">
              <DataSourceProof
                data-testid="oracle-proof-links"
                data={parentDataSourceSpec}
                providers={data}
                type={type}
                dataSourceSpecId={parentDataSourceSpecId}
              />

              {parentDataSourceSpec?.sourceType.sourceType.__typename ===
                'EthCallSpec' && (
                <EthOraclePanel
                  sourceType={parentDataSourceSpec?.sourceType.sourceType}
                />
              )}

              {dataSourceSpecId && (
                <ExternalLink
                  data-testid="oracle-spec-links"
                  href={`${VEGA_EXPLORER_URL}/oracles/${dataSourceSpecId}`}
                >
                  {type === 'settlementData'
                    ? t('View settlement data specification')
                    : type === 'settlementSchedule'
                    ? t('View settlement schedule specification')
                    : t('View termination specification')}
                </ExternalLink>
              )}
            </div>
          )}

        <div className="flex flex-col gap-2">
          {dataSourceSpecId && dataSourceSpec && (
            <DataSourceProof
              data-testid="oracle-proof-links"
              data={dataSourceSpec}
              providers={data}
              type={type}
              dataSourceSpecId={dataSourceSpecId}
            />
          )}

          {dataSourceSpecId && (
            <ExternalLink
              data-testid="oracle-spec-links"
              href={`${VEGA_EXPLORER_URL}/oracles/${dataSourceSpecId}`}
            >
              {type === 'settlementData'
                ? t('View settlement data specification')
                : type === 'settlementSchedule'
                ? t('View settlement schedule specification')
                : t('View termination specification')}
            </ExternalLink>
          )}
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
  type: 'settlementData' | 'termination' | 'settlementSchedule';
  dataSourceSpecId: string;
}) => {
  const t = useT();
  if (data.sourceType.__typename === 'DataSourceDefinitionExternal') {
    const signers =
      ('signers' in data.sourceType.sourceType &&
        data.sourceType.sourceType.signers) ||
      [];

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
          {data.sourceType.sourceType?.conditions?.map((condition, i) => {
            if (!condition) return null;
            const dateFromUnixTimestamp = condition.value
              ? getDateTimeFormat().format(
                  new Date(parseInt(condition.value) * 1000)
                )
              : '-';
            return (
              <p key={i}>
                {ConditionOperatorMapping[condition.operator]}{' '}
                {dateFromUnixTimestamp}
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

export const getDataSourceSpec = (
  product: MarketInfo['tradableInstrument']['instrument']['product'],
  type: 'settlementData' | 'termination' | 'settlementSchedule'
): {
  dataSourceSpecId: string | undefined;
  dataSourceSpec: DataSourceDefinition | undefined;
} => {
  let dataSourceSpecId, dataSourceSpec;

  switch (type) {
    case 'settlementData':
      switch (product.__typename) {
        case 'Future':
          dataSourceSpecId = product.dataSourceSpecForSettlementData.id;
          dataSourceSpec = product.dataSourceSpecForSettlementData.data;
          break;
        case 'Perpetual':
          dataSourceSpecId = product.dataSourceSpecForSettlementData.id;
          dataSourceSpec = product.dataSourceSpecForSettlementData.data;
          break;
        default:
          break;
      }
      break;
    case 'termination':
      switch (product.__typename) {
        case 'Future':
          dataSourceSpecId = product.dataSourceSpecForTradingTermination.id;
          dataSourceSpec = product.dataSourceSpecForTradingTermination.data;
          break;
        default:
          break;
      }
      break;
    case 'settlementSchedule':
      switch (product.__typename) {
        case 'Perpetual':
          dataSourceSpecId = product.dataSourceSpecForSettlementSchedule.id;
          dataSourceSpec = product.dataSourceSpecForSettlementSchedule.data;
          break;
        default:
          break;
      }
      break;
    default:
      break;
  }
  return {
    dataSourceSpecId,
    dataSourceSpec: dataSourceSpec as DataSourceDefinition,
  };
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
  type: 'settlementData' | 'termination' | 'settlementSchedule';
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
  type: 'settlementData' | 'termination' | 'settlementSchedule';
}) => {
  const t = useT();
  return (
    <p>
      {type === 'settlementData'
        ? t('No oracle proof for settlement data')
        : t('No oracle proof for termination')}
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

const getSourceWeight = (
  priceConfiguration: PriceConfigurationFragment,
  index: number
) =>
  priceConfiguration.CompositePriceType ===
    CompositePriceType.COMPOSITE_PRICE_TYPE_WEIGHTED &&
  priceConfiguration.SourceWeights
    ? Number(priceConfiguration.SourceWeights[index]) * 100
    : undefined;

const getStalenessTolerance = (
  priceConfiguration: PriceConfigurationFragment,
  index: number
) => {
  return (priceConfiguration.SourceStalenessTolerance[index] || '-').replace(
    /0s$/,
    ''
  );
};

const SourceWeight = ({ sourceWeight }: { sourceWeight?: number }) => {
  const t = useT();
  return (
    sourceWeight && (
      <KeyValueTableRow noBorder className="text-xs">
        <div>{t('Source weight')}</div>
        <div>{sourceWeight.toFixed(2)}%</div>
      </KeyValueTableRow>
    )
  );
};

const StalenessTolerance = ({
  priceConfiguration,
  index,
}: {
  priceConfiguration: PriceConfigurationFragment;
  index: number;
}) => {
  const t = useT();
  return (
    <KeyValueTableRow noBorder className="text-xs">
      <div>{t('Staleness tolerance')}</div>
      <div>{getStalenessTolerance(priceConfiguration, index)}</div>
    </KeyValueTableRow>
  );
};

export const PriceConfigurationTradePricePanel = ({
  market,
  priceConfiguration,
}: {
  market: MarketInfo;
  priceConfiguration: PriceConfigurationFragment;
}) => {
  const t = useT();
  const sourceWeight = getSourceWeight(priceConfiguration, 0);
  return (
    sourceWeight !== 0 && (
      <>
        <div className="my-1">{t('Trade price')}</div>
        <KeyValueTable>
          <SourceWeight sourceWeight={sourceWeight} />
          <StalenessTolerance
            priceConfiguration={priceConfiguration}
            index={0}
          />
          <KeyValueTableRow noBorder className="text-xs">
            <div>{t('Decay weight')}</div>
            <div>{market.markPriceConfiguration.decayWeight}</div>
          </KeyValueTableRow>
          <KeyValueTableRow noBorder className="text-xs">
            <div>{t('Decay power')}</div>
            <div>{market.markPriceConfiguration.decayPower}</div>
          </KeyValueTableRow>
        </KeyValueTable>
      </>
    )
  );
};

export const PriceConfigurationBookPricePanel = ({
  market,
  priceConfiguration,
}: {
  market: MarketInfo;
  priceConfiguration: PriceConfigurationFragment;
}) => {
  const t = useT();
  const asset = getAsset(market);
  const sourceWeight = getSourceWeight(priceConfiguration, 1);
  return (
    sourceWeight !== 0 && (
      <>
        <div className="my-1">{t('Book price')}</div>
        <KeyValueTable>
          <SourceWeight sourceWeight={sourceWeight} />
          <StalenessTolerance
            priceConfiguration={priceConfiguration}
            index={1}
          />
          <KeyValueTableRow noBorder className="text-xs">
            <div>{t('Cash amount')}</div>
            <div>{`${addDecimalsFormatNumber(
              priceConfiguration.cashAmount,
              asset.decimals
            )} ${asset.symbol}`}</div>
          </KeyValueTableRow>
        </KeyValueTable>
      </>
    )
  );
};

export const PriceConfigurationOraclePanel = ({
  marketId,
  priceConfiguration,
  sourceIndex,
}: {
  marketId: string;
  priceConfiguration: PriceConfigurationFragment;
  sourceIndex: number;
}) => {
  const t = useT();
  const dataSourceSpec = priceConfiguration.dataSourcesSpec?.[sourceIndex];
  const sourceType =
    dataSourceSpec?.sourceType.__typename === 'DataSourceDefinitionExternal' &&
    dataSourceSpec?.sourceType.sourceType.__typename === 'EthCallSpec' &&
    dataSourceSpec?.sourceType.sourceType;
  const sourceWeight = getSourceWeight(priceConfiguration, sourceIndex + 2);
  const { VEGA_EXPLORER_URL } = useEnvironment();
  return (
    sourceType &&
    sourceWeight !== 0 && (
      <>
        <div className="my-1">
          {t('Price oracle {{index}}', {
            index:
              (priceConfiguration.dataSourcesSpec?.length ?? 0) > 1
                ? sourceIndex + 1
                : '',
          })}
        </div>
        <KeyValueTable>
          <SourceWeight sourceWeight={sourceWeight} />
          <StalenessTolerance
            priceConfiguration={priceConfiguration}
            index={sourceIndex + 2}
          />

          <KeyValueTable>
            <KeyValueTableRow noBorder className="text-xs">
              <div>{t('Address')}</div>
              <CopyWithTooltip text={sourceType.address}>
                <button
                  data-testid="copy-eth-oracle-address"
                  className="text-right uppercase"
                >
                  <span className="flex gap-1">
                    {truncateMiddle(sourceType.address)}
                    <VegaIcon name={VegaIconNames.COPY} size={16} />
                  </span>
                </button>
              </CopyWithTooltip>
            </KeyValueTableRow>
            <ExternalLink
              data-testid="oracle-spec-links"
              href={`${VEGA_EXPLORER_URL}/markets/${marketId}/oracles#${sourceType.address}`}
              className="text-xs my-1"
            >
              {t('Oracle specification')}
            </ExternalLink>
          </KeyValueTable>
        </KeyValueTable>
      </>
    )
  );
};

export const PriceConfigurationMedianPanel = ({
  priceConfiguration,
}: {
  priceConfiguration: PriceConfigurationFragment;
}) => {
  const t = useT();
  const sourceWeight = getSourceWeight(
    priceConfiguration,
    (priceConfiguration.SourceWeights?.length ?? 0) - 1
  );
  return (
    sourceWeight !== 0 && (
      <>
        <div className="my-1">{t('Median price')}</div>
        <KeyValueTable>
          <SourceWeight sourceWeight={sourceWeight} />
          <StalenessTolerance
            priceConfiguration={priceConfiguration}
            index={priceConfiguration.SourceStalenessTolerance.length - 1}
          />
        </KeyValueTable>
      </>
    )
  );
};

export const PriceConfigurationPanel = ({
  market,
  priceConfiguration,
}: {
  market: MarketInfo;
  priceConfiguration: PriceConfigurationFragment;
}) => {
  const t = useT();
  const typeLabel: {
    [key in CompositePriceType]: string;
  } = {
    [CompositePriceType.COMPOSITE_PRICE_TYPE_WEIGHTED]: t('Weighted'),
    [CompositePriceType.COMPOSITE_PRICE_TYPE_MEDIAN]: t('Median'),
    [CompositePriceType.COMPOSITE_PRICE_TYPE_LAST_TRADE]: t('Last trade'),
  };
  return (
    <>
      <KeyValueTable>
        <KeyValueTableRow noBorder className="text-xs">
          <div>{t('Composite price type')}</div>
          <div>{typeLabel[priceConfiguration.CompositePriceType]}</div>
        </KeyValueTableRow>
      </KeyValueTable>
      <PriceConfigurationTradePricePanel
        market={market}
        priceConfiguration={priceConfiguration}
      />
      <PriceConfigurationBookPricePanel
        market={market}
        priceConfiguration={priceConfiguration}
      />
      {priceConfiguration.dataSourcesSpec?.map((spec, i) => (
        <PriceConfigurationOraclePanel
          key={i}
          marketId={market.id}
          priceConfiguration={priceConfiguration}
          sourceIndex={i}
        />
      ))}
      <PriceConfigurationMedianPanel priceConfiguration={priceConfiguration} />
    </>
  );
};
