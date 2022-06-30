import React from 'react';
import { formatNumber } from '../../lib/format-number';
import type { BigNumber } from '../../lib/bignumber';
import { theme } from '@vegaprotocol/tailwindcss-config';
import classnames from 'classnames';

const Colors = theme.colors;

const ProgressContents = ({
  light,
  children,
}: {
  light: boolean;
  children: React.ReactNode;
}) => (
  <div
    className={classnames('flex justify-between py-2 font-mono mb-2', {
      'gap-0 px-0 text-black': light,
      'gap-y-0 gap-x-4': !light,
    })}
  >
    {children}
  </div>
);

const ProgressIndicator = ({
  bgColor,
  side,
  light,
}: {
  bgColor: string;
  side: 'left' | 'right';
  light: boolean;
}) => (
  <span
    style={{
      backgroundColor: bgColor,
    }}
    className={classnames('inline-block w-12 h-12 border', {
      'mr-8': side === 'left',
      'ml-8': side === 'right',
      'border-black': light,
      'border-white': !light,
    })}
  />
);

const ProgressBar = ({
  percentage,
  bgColor,
}: {
  percentage: BigNumber;
  bgColor: string;
}) => (
  <div
    className="h-16"
    style={{
      flex: isNaN(percentage.toNumber()) ? 0 : percentage.toNumber(),
      backgroundColor: bgColor,
    }}
  />
);

export interface LockedProgressProps {
  total: BigNumber;
  locked: BigNumber;
  unlocked: BigNumber;
  leftLabel: string;
  rightLabel: string;
  leftColor?: string;
  rightColor?: string;
  light?: boolean;
  decimals?: number;
}

export const LockedProgress = ({
  total,
  locked,
  unlocked,
  leftLabel,
  rightLabel,
  leftColor = Colors.vega.pink,
  rightColor = Colors.vega.green,
  light = false,
  decimals = 2,
}: LockedProgressProps) => {
  const lockedPercentage = React.useMemo(() => {
    return locked.div(total).times(100);
  }, [total, locked]);

  const unlockedPercentage = React.useMemo(() => {
    return unlocked.div(total).times(100);
  }, [total, unlocked]);

  return (
    <div className="mb-8">
      <div
        className={classnames('flex border', {
          'border-black': light,
          'border-white': !light,
        })}
      >
        <ProgressBar percentage={lockedPercentage} bgColor={leftColor} />
        <ProgressBar percentage={unlockedPercentage} bgColor={rightColor} />
      </div>
      <ProgressContents light={light}>
        <span>
          <ProgressIndicator bgColor={leftColor} side={'left'} light={false} />
          {leftLabel}
        </span>
        <span>
          {rightLabel}
          <ProgressIndicator
            bgColor={rightColor}
            side={'right'}
            light={false}
          />
        </span>
      </ProgressContents>

      <ProgressContents light={light}>
        <span>{formatNumber(locked, decimals)}</span>
        <span>{formatNumber(unlocked, decimals)}</span>
      </ProgressContents>
    </div>
  );
};
