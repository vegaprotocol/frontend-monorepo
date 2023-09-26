import { fromNanoSeconds } from '@vegaprotocol/utils';

import compact from 'lodash/compact';
import sortBy from 'lodash/sortBy';
import 'pennant/dist/style.css';
import { useFundingPeriodsQuery } from '@vegaprotocol/markets';
import { LineChart } from 'pennant';
import { useMemo } from 'react';
import { t } from '@vegaprotocol/i18n';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { Splash } from '@vegaprotocol/ui-toolkit';
import {
  DateRange,
  calculateStartDate,
} from '../../client-pages/portfolio/account-history-container';

export const FundingContainer = ({ marketId }: { marketId: string }) => {
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
              fundingRate: Number(edge.node.fundingRate) * 100,
            });
          }
          return acc;
        }, [] as { endTime: Date; fundingRate: number }[]);
      return {
        cols: ['Date', t('Funding rate')],
        rows: sortBy(rows, 'endTime').map((d) => [d.endTime, d.fundingRate]),
      };
    }, [data?.fundingPeriods.edges]);
  if (!data || !values?.rows.length) {
    return <Splash> {t('No funding history data')}</Splash>;
  }
  return (
    <LineChart
      data={values}
      theme={theme}
      priceFormat={(fundingRate) => `${fundingRate.toFixed(4)}%`}
    />
  );
};
