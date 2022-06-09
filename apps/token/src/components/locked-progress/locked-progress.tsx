import React from 'react';

import { formatNumber } from '../../lib/format-number';
import type { BigNumber } from '../../lib/bignumber';
import { theme } from '@vegaprotocol/tailwindcss-config';

const Colors = theme.colors;

const ProgressContents = ({
  light,
  children,
}: {
  light: boolean;
  children: React.ReactNode;
}) => (
  <div
    className={`flex justify-between py-2 font-mono ${
      light ? 'gap-0 px-0 text-black' : 'gap-y-0 gap-x-4 px-4'
    }`}
  >
    {children}
  </div>
);

const ProgressIndicator = ({
  bgColor,
  side,
}: {
  bgColor: string;
  side: 'left' | 'right';
}) => (
  <span
    style={{
      backgroundColor: bgColor,
    }}
    className={`inline-block w-12 h-12 border border-black ${
      side === 'left' ? 'mr-8' : 'ml-8'
    }`}
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
}

export const LockedProgress = ({
  total,
  locked,
  unlocked,
  leftLabel,
  rightLabel,
  leftColor = Colors.pink,
  rightColor = Colors.green.DEFAULT,
  light = false,
}: LockedProgressProps) => {
  const lockedPercentage = React.useMemo(() => {
    return locked.div(total).times(100);
  }, [total, locked]);

  const unlockedPercentage = React.useMemo(() => {
    return unlocked.div(total).times(100);
  }, [total, unlocked]);

  return (
    <div className="border-x border-x-white">
      <div className={`flex ${light && 'border border-black'}`}>
        <ProgressBar percentage={lockedPercentage} bgColor={leftColor} />
        <ProgressBar percentage={unlockedPercentage} bgColor={rightColor} />
      </div>
      <ProgressContents light={light}>
        <span>
          <ProgressIndicator bgColor={leftColor} side={'left'} />
          {leftLabel}
        </span>
        <span>
          {rightLabel}
          <ProgressIndicator bgColor={rightColor} side={'right'} />
        </span>
      </ProgressContents>

      <ProgressContents light={light}>
        <span>{formatNumber(locked, 2)}</span>
        <span>{formatNumber(unlocked, 2)}</span>
      </ProgressContents>
    </div>
  );
};
