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
import { gql, useQuery } from '@apollo/client';
import { totalFees } from '@vegaprotocol/market-list';

const MARKET_INFO_QUERY = gql`
  query MarketInfoQuery($marketId: ID!) {
    market(id: $marketId) {
      id
      name
      decimalPlaces
      positionDecimalPlaces
      state
      tradingMode
      accounts {
        type
        asset {
          id
        }
        balance
      }
      fees {
        factors {
          makerFee
          infrastructureFee
          liquidityFee
        }
      }
      priceMonitoringSettings {
        parameters {
          triggers {
            horizonSecs
            probability
            auctionExtensionSecs
          }
        }
        updateFrequencySecs
      }
      riskFactors {
        market
        short
        long
      }
      accounts {
        type
        asset {
          id
        }
        balance
      }
      data {
        market {
          id
        }
        markPrice
        indicativeVolume
        bestBidVolume
        bestOfferVolume
        bestStaticBidVolume
        bestStaticOfferVolume
        indicativeVolume
        openInterest
      }
      liquidityMonitoringParameters {
        triggeringRatio
        targetStakeParameters {
          timeWindow
          scalingFactor
        }
      }
      tradableInstrument {
        instrument {
          id
          name
          code
          metadata {
            tags
          }
          product {
            ... on Future {
              quoteName
              settlementAsset {
                id
                symbol
                name
              }
              oracleSpecForSettlementPrice {
                id
              }
              oracleSpecForTradingTermination {
                id
              }
              oracleSpecBinding {
                settlementPriceProperty
                tradingTerminationProperty
              }
            }
          }
        }
        riskModel {
          ... on LogNormalRiskModel {
            tau
            riskAversionParameter
            params {
              r
              sigma
              mu
            }
          }
          ... on SimpleRiskModel {
            params {
              factorLong
              factorShort
            }
          }
        }
      }
      depth {
        lastTrade {
          price
        }
      }
    }
  }
`;

export interface InfoProps {
  market: MarketInfoQuery_market;
}

export interface MarketInfoContainerProps {
  marketId: string;
}
export const MarketInfoContainer = ({ marketId }: MarketInfoContainerProps) => {
  const { data, loading, error } = useQuery(MARKET_INFO_QUERY, {
    variables: { marketId },
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
      title: t('Market data'),
      content: (
        <MarketInfoTable
          data={market.data}
          decimalPlaces={market.decimalPlaces}
        />
      ),
    },
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
            ID: market.tradableInstrument.instrument.product?.settlementAsset
              .id,
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
