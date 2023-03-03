import { AssetDetailsTable, useAssetDataProvider } from '@vegaprotocol/assets';
import { useEnvironment } from '@vegaprotocol/environment';
import {
  totalFeesPercentage,
  calcCandleVolume,
} from '@vegaprotocol/market-list';
import {
  addDecimalsFormatNumber,
  formatNumber,
  formatNumberPercentage,
  removePaginationWrapper,
  TokenLinks,
  getMarketExpiryDateFormatted,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { useDataProvider, useYesterday } from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';
import {
  Accordion,
  AsyncRenderer,
  ExternalLink,
  Link as UILink,
  Splash,
} from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { generatePath, Link } from 'react-router-dom';

import { MarketInfoTable } from './info-key-value-table';
import { marketInfoWithDataAndCandlesProvider } from './market-info-data-provider';

import type { MarketInfoWithDataAndCandles } from './market-info-data-provider';
import { MarketProposalNotification } from '@vegaprotocol/proposals';

export interface InfoProps {
  market: MarketInfoWithDataAndCandles;
  onSelect: (id: string) => void;
}

export interface MarketInfoContainerProps {
  marketId: string;
  onSelect?: (id: string) => void;
}
export const MarketInfoContainer = ({
  marketId,
  onSelect,
}: MarketInfoContainerProps) => {
  const yesterday = useYesterday();
  const yTimestamp = useMemo(() => {
    return new Date(yesterday).toISOString();
  }, [yesterday]);
  const variables = useMemo(
    () => ({
      marketId,
      since: yTimestamp,
      interval: Schema.Interval.INTERVAL_I1H,
    }),
    [marketId, yTimestamp]
  );

  const { data, loading, error, reload } = useDataProvider({
    dataProvider: marketInfoWithDataAndCandlesProvider,
    skipUpdates: true,
    variables,
  });

  return (
    <AsyncRenderer data={data} loading={loading} error={error} reload={reload}>
      {data ? (
        <Info market={data} onSelect={(id) => onSelect?.(id)} />
      ) : (
        <Splash>
          <p>{t('Could not load market')}</p>
        </Splash>
      )}
    </AsyncRenderer>
  );
};

export const Info = ({ market, onSelect }: InfoProps) => {
  const { VEGA_TOKEN_URL, VEGA_EXPLORER_URL } = useEnvironment();
  const headerClassName = 'uppercase text-lg';
  const assetSymbol =
    market?.tradableInstrument.instrument.product?.settlementAsset.symbol || '';
  const quoteUnit =
    market?.tradableInstrument.instrument.product?.quoteName || '';
  const assetId = useMemo(
    () => market?.tradableInstrument.instrument.product?.settlementAsset.id,
    [market]
  );
  const { data: asset } = useAssetDataProvider(assetId ?? '');

  if (!market) return null;

  const marketAccounts = removePaginationWrapper(
    market.accountsConnection?.edges
  );

  const last24hourVolume = market.candles && calcCandleVolume(market.candles);

  const marketDataPanels = [
    {
      title: t('Current fees'),
      content: (
        <>
          <MarketInfoTable
            data={{
              ...market.fees.factors,
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
      ),
    },
    {
      title: t('Market price'),
      content: (
        <>
          <MarketInfoTable
            data={{
              markPrice: market.data?.markPrice,
              bestBidPrice: market.data?.bestBidPrice,
              bestOfferPrice: market.data?.bestOfferPrice,
              quoteUnit: market.tradableInstrument.instrument.product.quoteName,
            }}
            decimalPlaces={market.decimalPlaces}
          />
          <p className="text-xs mt-4">
            {t(
              'There is 1 unit of the settlement asset (%s) to every 1 quote unit (%s).',
              [assetSymbol, quoteUnit]
            )}
          </p>
        </>
      ),
    },
    {
      title: t('Market volume'),
      content: (
        <MarketInfoTable
          data={{
            '24hourVolume':
              last24hourVolume && last24hourVolume !== '0'
                ? addDecimalsFormatNumber(
                    last24hourVolume,
                    market.positionDecimalPlaces
                  )
                : '-',
            openInterest: market.data?.openInterest,
            bestBidVolume: market.data?.bestBidVolume,
            bestOfferVolume: market.data?.bestOfferVolume,
            bestStaticBidVolume: market.data?.bestStaticBidVolume,
            bestStaticOfferVolume: market.data?.bestStaticBidVolume,
          }}
          decimalPlaces={market.positionDecimalPlaces}
        />
      ),
    },
    ...marketAccounts
      .filter((a) => a.type === Schema.AccountType.ACCOUNT_TYPE_INSURANCE)
      .map((a) => ({
        title: t(`Insurance pool`),
        content: (
          <MarketInfoTable
            data={{
              balance: a.balance,
            }}
            assetSymbol={assetSymbol}
            decimalPlaces={
              market.tradableInstrument.instrument.product.settlementAsset
                .decimals
            }
          />
        ),
      })),
  ];

  const keyDetails = {
    decimalPlaces: market.decimalPlaces,
    positionDecimalPlaces: market.positionDecimalPlaces,
    tradingMode: market.tradingMode,
    state: Schema.MarketStateMapping[market.state],
  };

  const assetDecimals =
    market.tradableInstrument.instrument.product.settlementAsset.decimals;

  const liquidityPriceRange = formatNumberPercentage(
    new BigNumber(market.lpPriceRange).times(100)
  );

  const marketSpecPanels = [
    {
      title: t('Key details'),
      content: (
        <MarketInfoTable
          data={{
            name: market.tradableInstrument.instrument.name,
            marketID: market.id,
            tradingMode:
              keyDetails.tradingMode &&
              Schema.MarketTradingModeMapping[keyDetails.tradingMode],
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
      ),
    },
    {
      title: t('Metadata'),
      content: (
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
        />
      ),
    },
    {
      title: t('Risk model'),
      content: (
        <MarketInfoTable
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
          data={market.riskFactors}
          unformatted={true}
          omits={['market', '__typename']}
        />
      ),
    },
    ...(market.priceMonitoringSettings?.parameters?.triggers || []).map(
      (trigger, i) => {
        const bounds = market.data?.priceMonitoringBounds?.[i];
        return {
          title: t(`Price monitoring bounds ${i + 1}`),
          content: (
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
                      referencePrice: bounds.referencePrice,
                    }}
                    decimalPlaces={assetDecimals}
                    assetSymbol={quoteUnit}
                  />
                )}
              </div>
              <p className="mt-4">
                {t('Results in %s seconds auction if breached', [
                  trigger.auctionExtensionSecs.toString(),
                ])}
              </p>
            </div>
          ),
        };
      }
    ),
    {
      title: t('Liquidity monitoring parameters'),
      content: (
        <MarketInfoTable
          data={{
            triggeringRatio:
              market.liquidityMonitoringParameters.triggeringRatio,
            ...market.liquidityMonitoringParameters.targetStakeParameters,
          }}
        />
      ),
    },
    {
      title: t('Liquidity'),
      content: (
        <MarketInfoTable
          data={{
            targetStake: market.data && market.data.targetStake,
            suppliedStake: market.data && market.data?.suppliedStake,
            marketValueProxy: market.data && market.data.marketValueProxy,
          }}
          decimalPlaces={assetDecimals}
          assetSymbol={assetSymbol}
        >
          <Link
            to={`/liquidity/${market.id}`}
            onClick={() => onSelect(market.id)}
            data-testid="view-liquidity-link"
          >
            <UILink>{t('View liquidity provision table')}</UILink>
          </Link>
        </MarketInfoTable>
      ),
    },
    {
      title: t('Liquidity price range'),
      content: (
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
      ),
    },
    {
      title: t('Oracle'),
      content: (
        <MarketInfoTable
          data={
            market.tradableInstrument.instrument.product.dataSourceSpecBinding
          }
        >
          <ExternalLink
            href={`${VEGA_EXPLORER_URL}/oracles#${market.tradableInstrument.instrument.product.dataSourceSpecForSettlementData.id}`}
          >
            {t('View settlement data oracle specification')}
          </ExternalLink>
          <ExternalLink
            href={`${VEGA_EXPLORER_URL}/oracles#${market.tradableInstrument.instrument.product.dataSourceSpecForTradingTermination.id}`}
          >
            {t('View termination oracle specification')}
          </ExternalLink>
        </MarketInfoTable>
      ),
    },
  ];

  const marketGovPanels = [
    {
      title: t('Proposal'),
      content: (
        <div className="">
          <ExternalLink
            className="mb-2 w-full"
            href={generatePath(TokenLinks.PROPOSAL_PAGE, {
              tokenUrl: VEGA_TOKEN_URL,
              proposalId: market.proposal?.id || '',
            })}
            title={
              market.proposal?.rationale.title ||
              market.proposal?.rationale.description ||
              ''
            }
          >
            {t('View governance proposal')}
          </ExternalLink>
          <ExternalLink
            className="w-full"
            href={generatePath(TokenLinks.UPDATE_PROPOSAL_PAGE, {
              tokenUrl: VEGA_TOKEN_URL,
            })}
            title={
              market.proposal?.rationale.title ||
              market.proposal?.rationale.description ||
              ''
            }
          >
            {t('Propose a change to market')}
          </ExternalLink>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="mb-8">
        <p className={headerClassName}>{t('Market data')}</p>
        <Accordion panels={marketDataPanels} />
      </div>
      <div className="mb-8">
        <MarketProposalNotification marketId={market.id} />
        <p className={headerClassName}>{t('Market specification')}</p>
        <Accordion panels={marketSpecPanels} />
      </div>
      {VEGA_TOKEN_URL && market.proposal?.id && (
        <div>
          <p className={headerClassName}>{t('Market governance')}</p>
          <Accordion panels={marketGovPanels} />
        </div>
      )}
    </div>
  );
};
