/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { useState } from 'react';

//import type { MarketTradingMode } from '@vegaprotocol/types';
import { MarketTradingMode } from '@vegaprotocol/types';

import './health-bar.scss';

// enum marketTradingModeClassname {
//   TRADING_MODE_CONTINUOUS = 'continuous',
//   TRADING_MODE_MONITORING_AUCTION = 'auction',
//   TRADING_MODE_OPENING_AUCTION = 'open',
//   TRADING_MODE_BATCH_AUCTION = 'batch',
//   TRADING_MODE_NO_TRADING = 'none',
// }

const marketTradingModeClassname = {
  [MarketTradingMode.TRADING_MODE_CONTINUOUS]: 'continuous',
  [MarketTradingMode.TRADING_MODE_MONITORING_AUCTION]: 'auction',
  [MarketTradingMode.TRADING_MODE_OPENING_AUCTION]: 'open',
  [MarketTradingMode.TRADING_MODE_BATCH_AUCTION]: 'batch',
  [MarketTradingMode.TRADING_MODE_NO_TRADING]: 'none',
};

console.log('marketTradingModeClassname: ', marketTradingModeClassname);

interface Node {
  commitmentAmount: string;
  fee: string;
}

export default function Health({
  status,
  target,
  committed,
  committedEdges = [],
  size = 'small',
  isExpanded = false,
}: {
  status: MarketTradingMode;
  committed: string;
  target: string;
  committedEdges?: Node[];
  isExpanded?: boolean;
  size?: 'small' | 'large';
}) {
  const [isTargetTooltipShowing, setIsTargetTooltipShowing] =
    useState(isExpanded);

  const [isCommittedTooltipShowing, setIsCommittedTooltipShowing] =
    useState(isExpanded);

  const targetNumber = parseInt(target, 10);
  const committedNumber = parseInt(committed, 10);

  const total =
    targetNumber * 2 >= committedNumber ? targetNumber * 2 : committedNumber;
  console.log('total: ', total);
  console.log('target: ', targetNumber);
  console.log('committed: ', committedNumber);

  const committedLeftPosition = ((total - committedNumber) / total) * 100;
  console.log('committedLeftPosition: ', committedLeftPosition);
  const committedWidth = (committedNumber / total) * 100;

  const targetPercent = (targetNumber / total) * 100;
  console.log('targetPercent: ', targetPercent);

  return (
    <div className={`health health-size--${size}`}>
      <div className="health-wrapper">
        <div className="health-copy-wrapper">
          <div
            className="health-copy-item"
            style={{ width: `${committedWidth}%`, position: 'relative' }}
          >
            {isCommittedTooltipShowing && (
              <div className="health-tooltip health-committed-tooltip">
                <span className="health-tooltip-copy">Committed amount</span>
                <span className="health-tooltip-copy">{committedNumber}</span>
              </div>
            )}
          </div>
        </div>
        <div className="health-inner">
          <div className="health-full"></div>
          <div
            tabIndex={0}
            className={`health-committed health-committed--${marketTradingModeClassname[status]}`}
            style={{
              transform: `translateX(-${committedLeftPosition}%)`,
            }}
            onMouseEnter={() => {
              setIsCommittedTooltipShowing(true);
            }}
            onMouseLeave={() => {
              setIsCommittedTooltipShowing(isExpanded || false);
            }}
          ></div>
        </div>

        <div
          className="health-target-container"
          style={{ left: `${targetPercent}%` }}
          onMouseEnter={() => {
            setIsTargetTooltipShowing(true);
          }}
          onMouseLeave={() => {
            setIsTargetTooltipShowing(isExpanded || false);
          }}
        >
          <div className="health-target"></div>
        </div>

        {isTargetTooltipShowing && (
          <div
            className="health-tooltip health-target-tooltip"
            style={{ left: `${targetPercent}%` }}
          >
            <span className="health-tooltip-copy">Target stake</span>
            <span className="health-tooltip-copy">{target}</span>
          </div>
        )}
      </div>
    </div>
  );
}
