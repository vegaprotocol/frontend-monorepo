import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../../ui/chart';
import { useCandles, type Market, Interval, toNanoSeconds, yesterday } from '@vegaprotocol/rest';
import { t } from 'i18next';
import orderBy from 'lodash/orderBy';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

export const VolumeChart = ({ market }: { market: Market }) => {
  const { data } = useCandles(
    market.id,
    Interval.HOURS_1,
    toNanoSeconds(yesterday()),
  );

  const chartConfig = {
    y: {
      label: t('CHART_VOLUME_Y_LABEL'),
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig;

  const points = orderBy(
    data?.map((c) => ({
      x: c.start,
      y: c.volume.value.toNumber(),
    })),
    (p) => p.x.getTime(),
    'asc',
  );

  return (
    <ChartContainer config={chartConfig}>
      <BarChart data={points}>
        <CartesianGrid />
        <XAxis
          dataKey="x"
          type="category"
          tickFormatter={(value: Date) => {
            const h = value.getHours().toString();
            const hour = h.length === 1 ? `0${h}` : h;
            return `${hour}:00`;
          }}
        />
        <YAxis dataKey="y" type="number" hide />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value, series) => {
                const date = series[0].payload?.x as Date;
                return date ? date.toLocaleTimeString() : value;
              }}
            />
          }
        />
        <Bar dataKey="y" fill="var(--color-y)" radius={8} />
      </BarChart>
    </ChartContainer>
  );
};
