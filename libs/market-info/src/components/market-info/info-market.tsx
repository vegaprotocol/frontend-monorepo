import { AssetDetailsTable, useAssetDataProvider } from '@vegaprotocol/assets';
import { useEnvironment } from '@vegaprotocol/environment';
import { totalFeesPercentage } from '@vegaprotocol/market-list';
import {
  addDecimalsFormatNumber,
  formatNumber,
  formatNumberPercentage,
  removePaginationWrapper,
  t,
  useDataProvider,
  useYesterday,
} from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';
import {
  Accordion,
  AsyncRenderer,
  ExternalLink,
  Link as UILink,
  Splash,
} from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';
import pick from 'lodash/pick';
import { useMemo } from 'react';
import { generatePath, Link } from 'react-router-dom';

import { MarketInfoTable } from './info-key-value-table';
import { marketInfoDataProvider } from './market-info-data-provider';
import {
  TokenLinks,
  getMarketExpiryDateFormatted,
} from '@vegaprotocol/react-helpers';

import type { MarketInfoQuery } from './__generated__/MarketInfo';
import { MarketProposalNotification } from '@vegaprotocol/governance';

export interface InfoProps {
  market: MarketInfoQuery['market'];
  onSelect: (id: string) => void;
}

export const calcCandleVolume = (
  m: MarketInfoQuery['market']
): string | undefined => {
  return m?.candlesConnection?.edges
    ?.reduce((acc: BigNumber, c) => {
      return acc.plus(new BigNumber(c?.node?.volume ?? 0));
    }, new BigNumber(m?.candlesConnection?.edges[0]?.node.volume ?? 0))
    ?.toString();
};

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

  const { data, loading, error } = useDataProvider({
    dataProvider: marketInfoDataProvider,
    skipUpdates: true,
    variables,
  });

  return (
    <AsyncRenderer data={data} loading={loading} error={error}>
      {data && data.market ? (
        <Info market={data.market} onSelect={(id) => onSelect?.(id)} />
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
  const dayVolume = calcCandleVolume(market);
  const assetSymbol =
    market?.tradableInstrument.instrument.product?.settlementAsset.symbol;
  const assetId = useMemo(
    () => market?.tradableInstrument.instrument.product?.settlementAsset.id,
    [market]
  );
  const { data: asset } = useAssetDataProvider(assetId ?? '');

  if (!market) return null;

  const marketAccounts = removePaginationWrapper(
    market.accountsConnection?.edges
  );

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
        <MarketInfoTable
          data={pick(
            market.data,
            'name',
            'markPrice',
            'bestBidPrice',
            'bestOfferPrice'
          )}
          decimalPlaces={market.decimalPlaces}
        />
      ),
    },
    {
      title: t('Market volume'),
      content: (
        <MarketInfoTable
          data={{
            '24hourVolume':
              dayVolume && dayVolume !== '0' ? formatNumber(dayVolume) : '-',
            ...pick(
              market.data,
              'openInterest',
              'name',
              'bestBidVolume',
              'bestOfferVolume',
              'bestStaticBidVolume',
              'bestStaticOfferVolume'
            ),
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
    ...pick(market, 'decimalPlaces', 'positionDecimalPlaces', 'tradingMode'),
    state: Schema.MarketStateMapping[market.state],
  };

  const assetDecimals =
    market.tradableInstrument.instrument.product.settlementAsset.decimals;

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
        <AssetDetailsTable
          asset={asset}
          inline={true}
          noBorder={true}
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
      (trigger, i) => ({
        title: t(`Price monitoring trigger ${i + 1}`),
        content: <MarketInfoTable data={trigger} />,
      })
    ),
    ...(market.data?.priceMonitoringBounds || []).map((trigger, i) => ({
      title: t(`Price monitoring bound ${i + 1}`),
      content: (
        <>
          <MarketInfoTable
            data={trigger}
            decimalPlaces={market.decimalPlaces}
            omits={['referencePrice', '__typename']}
          />
          <MarketInfoTable
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
        <MarketInfoTable
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
