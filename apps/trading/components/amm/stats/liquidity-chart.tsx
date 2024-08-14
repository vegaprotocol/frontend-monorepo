import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../../ui/chart';
import { useAMMs, type Market } from '@vegaprotocol/rest';
import { t } from '../../../lib/use-t';
import { v1AMMStatus } from '@vegaprotocol/rest-clients/dist/trading-data';
import BigNumber from 'bignumber.js';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

export const LiquidityChart = ({ market }: { market: Market }) => {
  const chartConfig = {
    y: {
      label: t('CHART_LIQUIDITY_Y_LABEL'),
      color: 'hsl(var(--chart-2))',
    },
  } satisfies ChartConfig;

  const { data: amms } = useAMMs({ marketId: market.id });

  const activeAmms = amms?.filter(
    (a) => a.status === v1AMMStatus.STATUS_ACTIVE,
  );

  // TODO: Uncomment
  //   if (!activeAmms || activeAmms.length === 0) {
  //     return <Splash>{t('GRID_NO_DATA')}</Splash>;
  //   }

  const uMax = BigNumber.max.apply(
    null,
    activeAmms?.map((a) => a.upperBound.value) || [0],
  );

  const lMin = BigNumber.min.apply(
    null,
    activeAmms?.map((a) => a.lowerBound.value) || [0],
  );

  const d = uMax.minus(lMin);
  const n = 50;

  let points = Array(n)
    .fill(null)
    .map((_, i) => {
      const segment = d.dividedBy(i);

      const from = lMin.plus(segment.multipliedBy(i));
      const to = lMin.plus(segment.multipliedBy(i + 1));

      const amounts = activeAmms
        ?.filter((a) =>
          from.isGreaterThanOrEqualTo(a.lowerBound.value) || n !== i
            ? to.isLessThan(a.upperBound.value)
            : to.isGreaterThanOrEqualTo(a.upperBound.value),
        )
        .map((a) => a.commitment.value) || [0];

      return {
        x: from.toNumber(),
        y: BigNumber.sum.apply(null, amounts).toNumber(),
      };
    });

  // TODO: remove
  points = [
    { x: 10, y: 1 },
    { x: 20, y: 5 },
    { x: 30, y: 10 },
    { x: 40, y: 20 },
    { x: 50, y: 40 },
    { x: 60, y: 80 },
    { x: 70, y: 160 },
    { x: 80, y: 320 },
    { x: 90, y: 640 },
    { x: 100, y: 320 },
    { x: 110, y: 160 },
    { x: 120, y: 80 },
    { x: 130, y: 40 },
    { x: 140, y: 20 },
    { x: 150, y: 10 },
    { x: 160, y: 5 },
    { x: 170, y: 1 },
  ];

  return (
    <ChartContainer config={chartConfig}>
      <BarChart data={points}>
        <CartesianGrid />
        <XAxis dataKey="x" type="number" />
        <YAxis dataKey="y" type="number" hide />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="y" fill="var(--color-y)" radius={8} />
      </BarChart>
    </ChartContainer>
  );
};
