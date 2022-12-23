import { useCallback, useMemo, useState } from 'react';
import {
  addDecimalsFormatNumber,
  NetworkParams,
  t,
  useDataProvider,
  useNetworkParam,
} from '@vegaprotocol/react-helpers';
import type { MarketDealTicket } from '@vegaprotocol/market-list';
import type {
  MarketData,
  MarketDataUpdateFieldsFragment,
  SingleMarketFieldsFragment,
} from '@vegaprotocol/market-list';
import { marketDataProvider, marketProvider } from '@vegaprotocol/market-list';
import { HeaderStat } from '../header';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';

interface Props {
  marketId?: string;
  onSelect?: (marketId: string) => void;
  isHeader?: boolean;
  noUpdate?: boolean;
  assetDecimals: number;
}

export const MarketLiquiditySupplied = ({
  marketId,
  assetDecimals,
  onSelect,
  isHeader = false,
  noUpdate = false,
}: Props) => {
  const [liquiditySupplied, setLiquiditySupplied] = useState<string>();
  const [market, setMarket] = useState<MarketDealTicket>();
  const { param: stakeToCcyVolume } = useNetworkParam(
    NetworkParams.market_liquidity_stakeToCcySiskas
  );
  const variables = useMemo(
    () => ({
      marketId: marketId,
    }),
    [marketId]
  );

  console.log({ stakeToCcyVolume });

  const { data } = useDataProvider<SingleMarketFieldsFragment, never>({
    dataProvider: marketProvider,
    variables,
    skip: !marketId,
  });

  const update = useCallback(
    ({ data: marketData }: { data: MarketData | null }) => {
      if (!noUpdate && marketData) {
        setLiquiditySupplied(marketData.suppliedStake || '');
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

  const content = liquiditySupplied
    ? addDecimalsFormatNumber(
        new BigNumber(liquiditySupplied)
          .multipliedBy(stakeToCcyVolume || 1)
          .toString(),
        assetDecimals
      )
    : '';

  return isHeader ? (
    <HeaderStat
      heading={t('Liquidity supplied')}
      description={
        <>
          <span>{content}</span>
          <span>{stakeToCcyVolume}</span>
        </>
      }
      testId="liquidity-supplied"
    >
      <div>{content}</div>
    </HeaderStat>
  ) : (
    <Tooltip
      description={
        <>
          <span>{content}</span>
          <span>{stakeToCcyVolume}</span>
        </>
      }
    >
      <span>{content}</span>
    </Tooltip>
  );
};

export const checkLP = async () => {
  // IF supplied_stake >= target_stake THEN
  //     show a green status, e.g. "🟢 $13,666,999 liquidity supplied"
  // ELSE IF supplied_stake > NETPARAM[market.liquidity.targetstake.triggering.ratio] * target_stake THEN
  //     show an amber status, e.g. "🟠 $3,456,123 liquidity supplied"
  // ELSE
  //     show a red status, e.g. "🔴 $600,002 liquidity supplied"
  // END
};
