import React from 'react';
import { formatNumber } from '../../lib/format-number';
import type { BigNumber } from '../../lib/bignumber';
import { theme } from '@vegaprotocol/tailwindcss-config';
import { cn } from '@vegaprotocol/ui-toolkit';

const Colors = theme.colors;

const ProgressContents = ({ children }: { children: React.ReactNode }) => (
  <div className={cn('flex justify-between font-mono mb-2', 'gap-y-0 gap-x-4')}>
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
    className={cn('inline-block w-4 h-4 border', {
      'mr-2': side === 'left',
      'ml-2': side === 'right',
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
    className="h-4"
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
  decimals?: number;
}

export const LockedProgress = ({
  total,
  locked,
  unlocked,
  leftLabel,
  rightLabel,
  leftColor = Colors.pink.DEFAULT,
  rightColor = Colors.green.DEFAULT,
  decimals = 2,
}: LockedProgressProps) => {
  const lockedPercentage = React.useMemo(() => {
    return locked.div(total).times(100);
  }, [total, locked]);

  const unlockedPercentage = React.useMemo(() => {
    return unlocked.div(total).times(100);
  }, [total, unlocked]);

  return (
    <div className="mb-4">
      <div className="flex border border-white mb-2" data-testid="progress-bar">
        <ProgressBar percentage={lockedPercentage} bgColor={leftColor} />
        <ProgressBar percentage={unlockedPercentage} bgColor={rightColor} />
      </div>
      <ProgressContents>
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
      <ProgressContents>
        <span data-testid="currency-locked">
          {formatNumber(locked, decimals)}
        </span>
        <span data-testid="currency-unlocked">
          {formatNumber(unlocked, decimals)}
        </span>
      </ProgressContents>
    </div>
  );
};
