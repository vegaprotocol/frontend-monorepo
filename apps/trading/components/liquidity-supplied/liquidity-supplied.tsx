import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
  NetworkParams,
  t,
  useNetworkParams,
} from '@vegaprotocol/react-helpers';
import type { MarketX } from '@vegaprotocol/market-list';
import { HeaderStat } from '../header';
import { Link } from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';
import { useCheckLiquidityStatus } from '@vegaprotocol/liquidity';
import { DataGrid } from '@vegaprotocol/react-helpers';

interface Props {
  market?: MarketX;
  noUpdate?: boolean;
  assetDecimals: number;
}

export const MarketLiquiditySupplied = ({
  market,
  assetDecimals,
  noUpdate = false,
}: Props) => {
  const { params } = useNetworkParams([
    NetworkParams.market_liquidity_stakeToCcySiskas,
    NetworkParams.market_liquidity_targetstake_triggering_ratio,
  ]);

  const stakeToCcyVolume = Number(params.market_liquidity_stakeToCcySiskas);
  const triggeringRatio = Number(
    params.market_liquidity_targetstake_triggering_ratio
  );

  const supplied = market?.data?.suppliedStake
    ? addDecimalsFormatNumber(
        new BigNumber(market?.data?.suppliedStake)
          .multipliedBy(stakeToCcyVolume || 1)
          .toString(),
        assetDecimals
      )
    : '-';

  const { percentage } = useCheckLiquidityStatus({
    suppliedStake: market?.data?.suppliedStake || 0,
    targetStake: market?.data?.targetStake || 0,
    triggeringRatio,
  });

  const compiledGrid = [
    {
      label: t('Supplied stake'),
      value: market?.data?.suppliedStake
        ? addDecimalsFormatNumber(
            new BigNumber(market?.data?.suppliedStake).toString(),
            assetDecimals
          )
        : '-',
    },
    {
      label: t('Target stake'),
      value: market?.data?.targetStake
        ? addDecimalsFormatNumber(
            new BigNumber(market?.data?.targetStake).toString(),
            assetDecimals
          )
        : '-',
    },
  ];

  const description = (
    <section>
      {compiledGrid && <DataGrid grid={compiledGrid} />}
      <br />
      <Link
        href={`/#/liquidity/${market?.id}`}
        data-testid="view-liquidity-link"
      >
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
      {/* <Indicator variant={status} /> */}
      {supplied} ({formatNumberPercentage(percentage, 2)})
    </HeaderStat>
  );
};
