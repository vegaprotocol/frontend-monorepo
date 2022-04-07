import "./locked-progress.scss";

import React from "react";

import { Colors } from "../../config";
import { BigNumber } from "../../lib/bignumber";
import { formatNumber } from "../../lib/format-number";

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
  leftColor = Colors.PINK,
  rightColor = Colors.GREEN,
  light = false,
}: LockedProgressProps) => {
  const lockedPercentage = React.useMemo(() => {
    return locked.div(total).times(100);
  }, [total, locked]);

  const unlockedPercentage = React.useMemo(() => {
    return unlocked.div(total).times(100);
  }, [total, unlocked]);

  return (
    <div className="tranche-item__progress">
      <div
        className={`tranche-item__progress-bar ${
          light ? "tranche-item__progress-bar--light" : ""
        }`}
      >
        <div
          className="tranche-item__progress-bar--locked"
          style={{
            flex: isNaN(lockedPercentage.toNumber())
              ? 0
              : lockedPercentage.toNumber(),
            backgroundColor: leftColor,
          }}
        ></div>
        <div
          className="tranche-item__progress-bar--unlocked"
          style={{
            flex: isNaN(unlockedPercentage.toNumber())
              ? 0
              : unlockedPercentage.toNumber(),
            backgroundColor: rightColor,
          }}
        ></div>
      </div>
      <div
        className={`tranche-item__progress-contents ${
          light ? "tranche-item__progress-contents--light" : ""
        }`}
      >
        <span>
          <div
            className="tranche-item__progress-contents-indicator tranche-item__progress-contents-indicator--left"
            style={{
              backgroundColor: leftColor,
            }}
          ></div>
          {leftLabel}
        </span>
        <span>
          {rightLabel}
          <div
            className="tranche-item__progress-contents-indicator tranche-item__progress-contents-indicator--right"
            style={{
              backgroundColor: rightColor,
            }}
          ></div>
        </span>
      </div>
      <div
        className={`tranche-item__progress-contents ${
          light ? "tranche-item__progress-contents--light" : ""
        }`}
      >
        <span>{formatNumber(locked, 2)}</span>
        <span>{formatNumber(unlocked, 2)}</span>
      </div>
    </div>
  );
};
