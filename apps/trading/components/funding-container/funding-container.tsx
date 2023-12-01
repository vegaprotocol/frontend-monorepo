import { fromNanoSeconds } from '@vegaprotocol/utils';

import compact from 'lodash/compact';
import sortBy from 'lodash/sortBy';
import 'pennant/dist/style.css';
import { useFundingPeriodsQuery } from '@vegaprotocol/markets';
import { LineChart } from 'pennant';
import { useMemo } from 'react';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';

const calculateStartDate = (range: string): string | undefined => {
  const now = new Date();
  switch (range) {
    case DateRange.RANGE_1D:
      return new Date(now.setDate(now.getDate() - 1)).toISOString();
    case DateRange.RANGE_7D:
      return new Date(now.setDate(now.getDate() - 7)).toISOString();
    case DateRange.RANGE_1M:
      return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
    case DateRange.RANGE_3M:
      return new Date(now.setMonth(now.getMonth() - 3)).toISOString();
    case DateRange.RANGE_1Y:
      return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
    case DateRange.RANGE_YTD:
      return new Date(now.setMonth(0)).toISOString();
    default:
      return undefined;
  }
};

const DateRange = {
  RANGE_1D: '1D',
  RANGE_7D: '7D',
  RANGE_1M: '1M',
  RANGE_3M: '3M',
  RANGE_1Y: '1Y',
  RANGE_YTD: 'YTD',
  RANGE_ALL: 'All',
};

export const FundingContainer = ({ marketId }: { marketId: string }) => {
  const t = useT();
  const { theme } = useThemeSwitcher();
  const variables = useMemo(
    () => ({
      marketId: marketId || '',
      dateRange: { start: calculateStartDate(DateRange.RANGE_7D) },
    }),
    [marketId]
  );
  const { data } = useFundingPeriodsQuery({
    variables,
    skip: !marketId,
  });
  const values: { cols: [string, string]; rows: [Date, number][] } | null =
    useMemo(() => {
      if (!data?.fundingPeriods.edges.length) {
        return null;
      }
      const rows = compact(data?.fundingPeriods.edges)
        .filter((edge) => edge.node.endTime)
        .reduce((acc, edge) => {
          if (edge.node.endTime) {
            acc?.push({
              endTime: fromNanoSeconds(edge.node.endTime),
              fundingRate: Number(edge.node.fundingRate),
            });
          }
          return acc;
        }, [] as { endTime: Date; fundingRate: number }[]);
      return {
        cols: ['Date', t('Funding rate')],
        rows: sortBy(rows, 'endTime').map((d) => [d.endTime, d.fundingRate]),
      };
    }, [data?.fundingPeriods.edges, t]);
  if (!data || !values?.rows.length) {
    return <Splash> {t('No funding history data')}</Splash>;
  }
  return (
    <LineChart
      data={values}
      theme={theme}
      priceFormat={(fundingRate) => `${(fundingRate * 100).toFixed(4)}%`}
      yAxisTickFormat="%"
    />
  );
};
