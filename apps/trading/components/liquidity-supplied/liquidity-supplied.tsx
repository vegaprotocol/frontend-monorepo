import { useCallback, useMemo, useState } from 'react';
import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
  NetworkParams,
  t,
  useDataProvider,
  useNetworkParams,
} from '@vegaprotocol/react-helpers';
import type { MarketDealTicket } from '@vegaprotocol/market-list';
import type {
  MarketData,
  MarketDataUpdateFieldsFragment,
  SingleMarketFieldsFragment,
} from '@vegaprotocol/market-list';
import { marketDataProvider, marketProvider } from '@vegaprotocol/market-list';
import { HeaderStat } from '../header';
import { Link } from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';
import { useCheckLiquidityStatus } from '@vegaprotocol/liquidity';
import { MarketDataGrid } from '@vegaprotocol/deal-ticket';

interface Props {
  marketId?: string;
  noUpdate?: boolean;
  assetDecimals: number;
}

export const MarketLiquiditySupplied = ({
  marketId,
  assetDecimals,
  noUpdate = false,
}: Props) => {
  const [market, setMarket] = useState<MarketDealTicket>();
  const { params } = useNetworkParams([
    NetworkParams.market_liquidity_stakeToCcySiskas,
    NetworkParams.market_liquidity_targetstake_triggering_ratio,
  ]);

  const stakeToCcyVolume = Number(params.market_liquidity_stakeToCcySiskas);
  const triggeringRatio = Number(
    params.market_liquidity_targetstake_triggering_ratio
  );

  const variables = useMemo(
    () => ({
      marketId: marketId,
    }),
    [marketId]
  );

  const { data } = useDataProvider<SingleMarketFieldsFragment, never>({
    dataProvider: marketProvider,
    variables,
    skip: !marketId,
  });

  const update = useCallback(
    ({ data: marketData }: { data: MarketData | null }) => {
      if (!noUpdate && marketData) {
        setMarket({
          ...data,
          data: marketData,
        } as MarketDealTicket);
      }
      return true;
    },
    [noUpdate, data]
  );

  useDataProvider<MarketData, MarketDataUpdateFieldsFragment>({
    dataProvider: marketDataProvider,
    update,
    variables,
    skip: noUpdate || !marketId || !data,
  });

  const supplied = market?.data.suppliedStake
    ? addDecimalsFormatNumber(
        new BigNumber(market?.data.suppliedStake)
          .multipliedBy(stakeToCcyVolume || 1)
          .toString(),
        assetDecimals
      )
    : '-';

  const { percentage } = useCheckLiquidityStatus({
    suppliedStake: market?.data.suppliedStake || 0,
    targetStake: market?.data.targetStake || 0,
    triggeringRatio,
  });

  const compiledGrid = [
    {
      label: t('Supplied stake'),
      value: market?.data.suppliedStake
        ? addDecimalsFormatNumber(
            new BigNumber(market?.data.suppliedStake).toString(),
            assetDecimals
          )
        : '-',
    },
    {
      label: t('Target stake'),
      value: market?.data.targetStake
        ? addDecimalsFormatNumber(
            new BigNumber(market?.data.targetStake).toString(),
            assetDecimals
          )
        : '-',
    },
  ];

  const description = (
    <section>
      {compiledGrid && <MarketDataGrid grid={compiledGrid} />}
      <br />
      <Link href={`/#/liquidity/${marketId}`} data-testid="view-liquidity-link">
        {t('View liquidity provision table')}
      </Link>
    </section>
  );

  return (
    <HeaderStat
      heading={t('Liquidity supplied')}
      description={description}
      testId="liquidity-supplied"
    >
      <div>
        ({formatNumberPercentage(percentage, 2)}) {supplied}
      </div>
    </HeaderStat>
  );
};
