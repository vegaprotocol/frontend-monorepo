import { format, startOfMonth } from 'date-fns';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Area,
  AreaChart,
  Label,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import colors from 'tailwindcss/colors';

import { DATE_FORMAT_LONG } from '../../lib/date-formats';
import data from './data.json';

import { theme } from '@vegaprotocol/tailwindcss-config';
const Colors = theme.colors;

const ORDER = ['community', 'publicSale', 'earlyInvestors', 'team'];

export const VestingChart = () => {
  const { t } = useTranslation();
  const currentDate = React.useMemo(
    () => format(startOfMonth(new Date()), DATE_FORMAT_LONG),
    []
  );
  return (
    <div style={{ marginBottom: 25 }}>
      <ResponsiveContainer height={400} width="100%">
        <AreaChart data={data}>
          <defs>
            {[
              ['pink', Colors.vega.pink],
              ['green', Colors.vega.green],
              ['orange', Colors.warning],
              ['yellow', Colors.vega.yellow],
            ].map(([key, color]) => (
              <linearGradient key={key} id={key} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.85} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <Tooltip
            contentStyle={{ backgroundColor: colors.black }}
            separator=":"
            // @ts-ignore formatter doesnt seem to allow returning JSX but nonetheless it works
            formatter={(value: number) => {
              return (
                <div
                  style={{
                    display: 'flex',
                    textAlign: 'right',
                  }}
                >
                  {Intl.NumberFormat().format(value)}
                </div>
              );
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            itemSorter={(label: any) => {
              return ORDER.indexOf(label.dataKey) + 1;
            }}
          />
          <YAxis type="number" width={100}>
            <Label
              angle={270}
              value={t('VEGA').toString()}
              position="left"
              offset={-5}
              fill={colors.white}
            />
          </YAxis>
          <XAxis dataKey="date">
            <Label
              value={t('date').toString()}
              position="bottom"
              offset={5}
              fill={colors.white}
            />
          </XAxis>
          <ReferenceLine
            x={currentDate}
            stroke={colors.white}
            strokeWidth={2}
            label={{
              position: 'right',
              value: currentDate,
              fill: colors.white,
            }}
          />
          <Area
            dot={false}
            type="linear"
            dataKey="team"
            stroke={Colors.vega.pink}
            fill="url(#pink)"
            yAxisId={0}
            strokeWidth={2}
            fillOpacity={0.85}
            stackId="1"
            name={t('Team')}
          />
          <Area
            dot={false}
            type="monotone"
            dataKey="earlyInvestors"
            stroke={Colors.vega.green}
            fill="url(#green)"
            yAxisId={0}
            strokeWidth={2}
            fillOpacity={0.85}
            stackId="1"
            name={t('Early Investors')}
          />
          <Area
            dot={false}
            type="monotone"
            dataKey="publicSale"
            stroke={Colors.vega.yellow}
            fill="url(#yellow)"
            yAxisId={0}
            strokeWidth={2}
            stackId="1"
            fillOpacity={0.85}
            name={t('Public Sale')}
          />
          <Area
            dot={false}
            type="monotone"
            dataKey="community"
            stroke={Colors.warning}
            fill="url(#orange)"
            yAxisId={0}
            strokeWidth={2}
            fillOpacity={0.85}
            stackId="1"
            name={t('Community')}
          />
          <Legend wrapperStyle={{ position: 'relative' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
