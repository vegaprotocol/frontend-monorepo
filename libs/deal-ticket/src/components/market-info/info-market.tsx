import { useState } from 'react';
import { useMemo } from 'react';
import { formatNumber, t } from '@vegaprotocol/react-helpers';
import {
  AsyncRenderer,
  Splash,
  Accordion,
  Link,
  Button,
  Dialog,
} from '@vegaprotocol/ui-toolkit';
import pick from 'lodash/pick';
import BigNumber from 'bignumber.js';
import { useQuery } from '@apollo/client';
import { totalFees } from '@vegaprotocol/market-list';
import {
  AccountType,
  Interval,
  MarketStateMapping,
  MarketTradingModeMapping,
} from '@vegaprotocol/types';
import { MARKET_INFO_QUERY } from './info-market-query';
import { useEnvironment } from '@vegaprotocol/environment';
import type {
  MarketInfoQuery,
  MarketInfoQuery_market,
  MarketInfoQuery_market_candles,
} from './__generated__/MarketInfoQuery';
import { LiquidityContainer } from '@vegaprotocol/liquidity';
import { MarketInfoTable } from './info-key-value-table';

export interface InfoProps {
  market: MarketInfoQuery_market;
}

export const calcCandleVolume = (
  m: MarketInfoQuery_market
): string | undefined => {
  return m.candles
    ?.reduce((acc: BigNumber, c: MarketInfoQuery_market_candles | null) => {
      return acc.plus(new BigNumber(c?.volume ?? 0));
    }, new BigNumber(m.candles?.[0]?.volume ?? 0))
    ?.toString();
};

export interface MarketInfoContainerProps {
  marketId: string;
}
export const MarketInfoContainer = ({ marketId }: MarketInfoContainerProps) => {
  const yTimestamp = useMemo(() => {
    const yesterday = Math.round(new Date().getTime() / 1000) - 24 * 3600;
    return new Date(yesterday * 1000).toISOString();
  }, []);

  const { data, loading, error } = useQuery(MARKET_INFO_QUERY, {
    variables: useMemo(
      () => ({ marketId, since: yTimestamp, interval: Interval.INTERVAL_I1H }),
      [marketId, yTimestamp]
    ),
  });

  return (
    <AsyncRenderer<MarketInfoQuery> data={data} loading={loading} error={error}>
      {data && data.market ? (
        <div className={'overflow-auto h-full'}>
          <Info market={data.market} />
        </div>
      ) : (
        <Splash>
          <p>{t('Could not load market')}</p>
        </Splash>
      )}
    </AsyncRenderer>
  );
};

export const Info = ({ market }: InfoProps) => {
  const [openLiquidityView, setOpenLiquidityView] = useState(false);
  const headerClassName =
    'text-h5 font-medium uppercase text-black dark:text-white';
  const dayVolume = calcCandleVolume(market);
  const assetSymbol =
    market.tradableInstrument.instrument.product?.settlementAsset.symbol;
  const marketDataPanels = [
    {
      title: t('Current fees'),
      content: (
        <>
          <MarketInfoTable
            data={{
              ...market.fees.factors,
              totalFees: totalFees(market.fees.factors),
            }}
            asPercentage={true}
          />
          <p className="text-ui-small">
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
    ...(market.accounts || [])
      .filter((a) => a.type === AccountType.ACCOUNT_TYPE_INSURANCE)
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
  const { VEGA_EXPLORER_URL } = useEnvironment();
  const keyDetails = {
    ...pick(
      market,
      'name',
      'decimalPlaces',
      'positionDecimalPlaces',
      'tradingMode',
      'id' as 'marketId'
    ),
    state: MarketStateMapping[market.state],
  };
  const marketSpecPanels = [
    {
      title: t('Key details'),
      content: (
        <MarketInfoTable
          data={{
            ...keyDetails,
            marketID: keyDetails.id,
            id: undefined,
            tradingMode:
              keyDetails.tradingMode &&
              MarketTradingModeMapping[keyDetails.tradingMode],
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
      content: (
        <MarketInfoTable
          data={{
            name: market.tradableInstrument.instrument.product?.settlementAsset
              .name,
            symbol:
              market.tradableInstrument.instrument.product?.settlementAsset
                .symbol,
            assetID:
              market.tradableInstrument.instrument.product?.settlementAsset.id,
          }}
        />
      ),
    },
    {
      title: t('Metadata'),
      content: (
        <MarketInfoTable
          data={{
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
      title: t('Risk factors'),
      content: (
        <MarketInfoTable
          data={market.riskFactors}
          unformatted={true}
          omits={['market', '__typename']}
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
    ...(market.priceMonitoringSettings?.parameters?.triggers || []).map(
      (trigger, i) => ({
        title: t(`Price monitoring trigger ${i + 1}`),
        content: <MarketInfoTable data={trigger} />,
      })
    ),
    ...(market.data?.priceMonitoringBounds || []).map((trigger, i) => ({
      title: t(`Price monitoring bound ${i + 1}`),
      content: (
        <MarketInfoTable data={trigger} decimalPlaces={market.decimalPlaces} />
      ),
    })),
    ...(market.data?.priceMonitoringBounds || []).map((trigger, i) => ({
      title: t(`Price monitoring bound ${i + 1}`),
      content: (
        <MarketInfoTable data={trigger} decimalPlaces={market.decimalPlaces} />
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
          decimalPlaces={
            market.tradableInstrument.instrument.product.settlementAsset
              .decimals
          }
          assetSymbol={assetSymbol}
          link={
            <>
              <Button
                className="text-ui pl-0"
                variant="inline-link"
                onClick={() => setOpenLiquidityView(true)}
              >
                {t('View liquidity provision table')}
              </Button>
              <Dialog
                open={openLiquidityView}
                onChange={() => setOpenLiquidityView(!openLiquidityView)}
                size="large"
              >
                <LiquidityContainer marketId={market.id}></LiquidityContainer>
              </Dialog>
            </>
          }
        />
      ),
    },
    {
      title: t('Oracle'),
      content: (
        <MarketInfoTable
          data={{
            ...market.tradableInstrument.instrument.product.oracleSpecBinding,
            priceOracle:
              market.tradableInstrument.instrument.product
                .oracleSpecForSettlementPrice.id,
            terminationOracle:
              market.tradableInstrument.instrument.product
                .oracleSpecForTradingTermination.id,
          }}
          link={
            <Link
              target="_blank"
              href={`${VEGA_EXPLORER_URL}/oracles#${market.tradableInstrument.instrument.product.oracleSpecForTradingTermination.id}`}
              className="text-ui dark:text-white text-black underline hover:underline hover:text-black-60 dark:hover:text-white-80"
              rel="noreferrer"
            >
              {t('View full oracle details')}
            </Link>
          }
        />
      ),
    },
  ];

  return (
    <div className="p-16 flex flex-col gap-32">
      <div className="flex flex-col gap-12">
        <p className={headerClassName}>{t('Market data')}</p>
        <Accordion panels={marketDataPanels} />
      </div>
      <div className="flex flex-col gap-12">
        <p className={headerClassName}>{t('Market specification')}</p>
        <Accordion panels={marketSpecPanels} />
      </div>
    </div>
  );
};
