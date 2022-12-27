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
import { Link, Tooltip } from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';
import { useCheckLiquidityStatus } from '@vegaprotocol/liquidity';

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
  const [market, setMarket] = useState<MarketDealTicket>();
  const { param: stakeToCcyVolume } = useNetworkParam(
    NetworkParams.market_liquidity_stakeToCcySiskas
  );

  const { param: triggeringRatio } = useNetworkParam(
    NetworkParams.market_liquidity_targetstake_triggering_ratio
  );

  console.log({ stakeToCcyVolume, triggeringRatio });
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

  const suppliedStake = market?.data.suppliedStake
    ? addDecimalsFormatNumber(
        new BigNumber(market?.data.suppliedStake)

          .multipliedBy(stakeToCcyVolume || 1)
          .toString(),
        assetDecimals
      )
    : '';

  const targetStake = market?.data.targetStake
    ? addDecimalsFormatNumber(
        new BigNumber(market?.data.targetStake)
          .multipliedBy(stakeToCcyVolume || 1)
          .toString(),
        assetDecimals
      )
    : '';

  const { status, percentage } = useCheckLiquidityStatus({
    suppliedStake,
    targetStake,
    triggeringRatio: (triggeringRatio && Number(triggeringRatio)) || 1,
  });

  const description = (
    <>
      <p>{status}</p>
      <p>{percentage}</p>
      <p>{suppliedStake}</p>
      <p>{targetStake}</p>
      <p>{stakeToCcyVolume}</p>
      <Link href={`/liquidity/${marketId}`} data-testid="view-liquidity-link">
        {t('View liquidity provision table')}
      </Link>
    </>
  );

  return isHeader ? (
    <HeaderStat
      heading={t('Liquidity supplied')}
      description={description}
      testId="liquidity-supplied"
    >
      <div>{suppliedStake}</div>
    </HeaderStat>
  ) : (
    <Tooltip description={description}>
      <span>{suppliedStake}</span>
    </Tooltip>
  );
};
