/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  addDecimalsFormatNumber,
  formatLabel,
  formatNumber,
  formatNumberPercentage,
  t,
} from '@vegaprotocol/react-helpers';
import {
  KeyValueTable,
  KeyValueTableRow,
  AsyncRenderer,
  Splash,
  Accordion,
} from '@vegaprotocol/ui-toolkit';
import startCase from 'lodash/startCase';
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import type { MarketInfoQuery, MarketInfoQuery_market } from './__generated__';
import BigNumber from 'bignumber.js';
import { useQuery } from '@apollo/client';
import { totalFees } from '@vegaprotocol/market-list';
import { AccountType, Interval } from '@vegaprotocol/types';
import { MARKET_INFO_QUERY } from './info-market-query';

export interface InfoProps {
  market: MarketInfoQuery_market;
}

export const calcCandleVolume = (m: MarketInfoQuery_market): string | undefined => {
  return m.candles
    ?.reduce((acc: BigNumber, c: { volume: BigNumber.Value }) => {
      return acc.plus(new BigNumber(c.volume));
    }, new BigNumber(m.candles?.[0]?.volume ?? 0))
    .toString();
};

export interface MarketInfoContainerProps {
  marketId: string;
}
export const MarketInfoContainer = ({ marketId }: MarketInfoContainerProps) => {
  const yesterday = Math.round(new Date().getTime() / 1000) - 24 * 3600;
  const yTimestamp = new Date(yesterday * 1000).toISOString();

  const { data, loading, error } = useQuery(MARKET_INFO_QUERY, {
    variables: { marketId, interval: Interval.I1H, since: yTimestamp },
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
  const headerClassName =
    'text-h5 font-medium uppercase text-black dark:text-white';
  const dayVolume = calcCandleVolume(market);
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
      .filter((a) => a.type === AccountType.Insurance)
      .map((a, i) => ({
        title: t(`Insurance pool`),
        content: (
          <MarketInfoTable
            data={{
              balance: `${a.balance}
           ${market.tradableInstrument.instrument.product?.settlementAsset.symbol}`,
            }}
          />
        ),
      })),
  ];

  const keyDetails = pick(
    market,
    'name',
    'decimalPlaces',
    'positionDecimalPlaces',
    'tradingMode',
    'state',
    'id' as 'marketId'
  );
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
              keyDetails.tradingMode && formatLabel(keyDetails.tradingMode),
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

interface RowProps {
  field: string;
  value: any;
  decimalPlaces?: number;
  asPercentage?: boolean;
  unformatted?: boolean;
}

const Row = ({
  field,
  value,
  decimalPlaces,
  asPercentage,
  unformatted,
}: RowProps) => {
  const isNumber = typeof value === 'number' || !isNaN(Number(value));
  const isPrimitive = typeof value === 'string' || isNumber;
  const className = 'text-black dark:text-white text-ui !px-0 !font-normal';
  if (isPrimitive) {
    return (
      <KeyValueTableRow
        key={field}
        inline={isPrimitive}
        muted={true}
        noBorder={true}
        dtClassName={className}
        ddClassName={className}
      >
        {startCase(t(field))}
        {isNumber && !unformatted
          ? decimalPlaces
            ? addDecimalsFormatNumber(value, decimalPlaces)
            : asPercentage
            ? formatNumberPercentage(new BigNumber(value * 100))
            : formatNumber(Number(value))
          : value}
      </KeyValueTableRow>
    );
  }
  return null;
};

export interface MarketInfoTableProps {
  data: any;
  decimalPlaces?: number;
  asPercentage?: boolean;
  unformatted?: boolean;
  omits?: string[];
}

export const MarketInfoTable = ({
  data,
  decimalPlaces,
  asPercentage,
  unformatted,
  omits = ['__typename'],
}: MarketInfoTableProps) => {
  return (
    <KeyValueTable muted={true}>
      {Object.entries(omit(data, ...omits) || []).map(([key, value]) => (
        <Row
          key={key}
          field={key}
          value={value}
          decimalPlaces={decimalPlaces}
          asPercentage={asPercentage}
          unformatted={unformatted || key.toLowerCase().includes('volume')}
        />
      ))}
    </KeyValueTable>
  );
};
