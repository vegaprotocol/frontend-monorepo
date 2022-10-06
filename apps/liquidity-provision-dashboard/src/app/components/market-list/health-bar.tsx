import classNames from 'classnames';
import { MarketTradingMode } from '@vegaprotocol/types';
import { t, addDecimalsFormatNumber } from '@vegaprotocol/react-helpers';

import './health-bar.scss';

const marketTradingModeClassname = {
  [MarketTradingMode.TRADING_MODE_CONTINUOUS]: 'continuous',
  [MarketTradingMode.TRADING_MODE_MONITORING_AUCTION]: 'auction',
  [MarketTradingMode.TRADING_MODE_OPENING_AUCTION]: 'open',
  [MarketTradingMode.TRADING_MODE_BATCH_AUCTION]: 'batch',
  [MarketTradingMode.TRADING_MODE_NO_TRADING]: 'none',
};

export default function Health({
  status,
  target,
  committed,
  decimals,
  size = 'small',
  isExpanded = false,
}: {
  status: MarketTradingMode;
  committed: string;
  target: string;
  decimals: number;
  isExpanded?: boolean;
  size?: 'small' | 'large';
}) {
  const targetNumber = parseInt(target, 10);
  const committedNumber = parseInt(committed, 10);

  const total =
    targetNumber * 2 >= committedNumber ? targetNumber * 2 : committedNumber;
  const committedWidth = (committedNumber / total) * 100;
  const targetPercent = (targetNumber / total) * 100;

  return (
    <div className={`health health-size--${size}`}>
      <div className="health-wrapper">
        <div className="health-inner">
          <div className="health-full"></div>
          <div
            className={classNames(
              `health-committed health-committed--${marketTradingModeClassname[status]}`,
              { 'health-committed--expanded': isExpanded }
            )}
            style={{
              width: `${committedWidth}%`,
            }}
          >
            <div className="health-tooltip health-committed-tooltip">
              <span className="health-tooltip-copy">
                {t('Committed amount')}
              </span>
              <span className="health-tooltip-copy">
                {addDecimalsFormatNumber(committedNumber, decimals)}
              </span>
            </div>
          </div>
        </div>

        <div
          className={classNames('health-target-container', {
            'health-target-container--expanded': isExpanded,
          })}
          style={{ left: `${targetPercent}%` }}
        >
          <div className="health-target">
            <div className="health-tooltip health-target-tooltip">
              <span className="health-tooltip-copy">{t('Target stake')}</span>
              <span className="health-tooltip-copy">
                {addDecimalsFormatNumber(target, decimals)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
