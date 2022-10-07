import classNames from 'classnames';
import { MarketTradingMode } from '@vegaprotocol/types';
import { t, addDecimalsFormatNumber } from '@vegaprotocol/react-helpers';
import { BigNumber } from 'bignumber.js';
import type { ReactNode } from 'react';

const marketTradingModeClassname = {
  [MarketTradingMode.TRADING_MODE_CONTINUOUS]: '#00a88a',
  [MarketTradingMode.TRADING_MODE_MONITORING_AUCTION]: '#fb8e7f',
  [MarketTradingMode.TRADING_MODE_OPENING_AUCTION]: '#68e2e4',
  [MarketTradingMode.TRADING_MODE_BATCH_AUCTION]: 'batch',
  [MarketTradingMode.TRADING_MODE_NO_TRADING]: 'none',
};

const COPY_CLASS = 'text-[8px] leading-[1.2em] font-medium';

const Tooltip = ({
  children,
  isExpanded,
}: {
  children: ReactNode;
  isExpanded: boolean;
}) => {
  return (
    <div
      className={classNames(
        'absolute top-0 left-1/2 -translate-x-2/4 -translate-y-[120%] border border-[#bfccd6] py-0.5 px-2 flex-col z-10 bg-white group-hover:flex min-w-[65px]',
        {
          flex: isExpanded,
          hidden: !isExpanded,
        }
      )}
    >
      <div
        className="absolute w-0 h-0 translate-y-full translate-x-2/4 left-[calc(50% - 8px)] -bottom-px border-4"
        style={{
          left: 'calc(50% - 8px)',
          borderColor: '#bfccd6 transparent transparent transparent',
        }}
      ></div>
      <div
        style={{
          left: 'calc(50% - 8px)',
          borderColor: 'white transparent transparent transparent',
        }}
        className="absolute bottom-0 w-0 h-0 translate-y-full translate-x-2/4 left-[calc(50% - 8px)] border-4"
      ></div>
      {children}
    </div>
  );
};

const Target = ({
  targetPercent,
  isLarge,
  children,
}: {
  targetPercent: number;
  isLarge: boolean;
  children: ReactNode;
}) => {
  return (
    <div
      className={classNames(
        'absolute top-0 left-1/2 -translate-x-2/4 px-1.5 group'
      )}
      style={{ left: `${targetPercent}%` }}
    >
      <div
        className={classNames('health-target w-0.5 h-8 bg-black', {
          'h-[72px]': isLarge,
        })}
      >
        {children}
      </div>
    </div>
  );
};

const Bar = ({
  children,
  commitmentAmount,
  total,
  index,
  status,
}: {
  children: ReactNode;
  index: number;
  status: MarketTradingMode;
  commitmentAmount: number;
  total: number;
}) => {
  const width = new BigNumber(commitmentAmount).div(total).toNumber() * 100;

  return (
    <div
      className={classNames(`relative h-[inherit] w-full group`)}
      style={{
        width: `${width}%`,
        opacity: 1 - 0.1 * index,
      }}
    >
      <div
        className="relative w-full h-[inherit]"
        style={{
          opacity: 1 - 0.1 * index,
          backgroundColor: marketTradingModeClassname[status],
        }}
      ></div>
      {children}
    </div>
  );
};

interface Providers {
  fee: string;
  commitmentAmount: number;
}

export const HealthBar = ({
  status,
  target,
  decimals,
  providers,
  size = 'small',
  isExpanded = false,
}: {
  status: MarketTradingMode;
  target: string;
  decimals: number;
  providers: Providers[];
  isExpanded?: boolean;
  size?: 'small' | 'large';
}) => {
  const targetNumber = parseInt(target, 10);

  const committedNumber = providers
    .reduce((total, current) => {
      return total.plus(current.commitmentAmount);
    }, new BigNumber(0))
    .toNumber();

  const total =
    targetNumber * 2 >= committedNumber ? targetNumber * 2 : committedNumber;
  const targetPercent = (targetNumber / total) * 100;
  const isLarge = size === 'large';

  return (
    <div className="w-full">
      <div
        className={classNames('health-wrapper relative py-2', {
          'py-5': isLarge,
        })}
      >
        <div
          className={classNames('health-inner relative w-full flex', {
            'h-4': !isLarge,
            'h-8': isLarge,
          })}
        >
          <div className="health-full bg-[#f5f5f5] w-full h-[inherit] absolute bottom-0 left-0"></div>

          <div className="health-bars h-[inherit] flex w-full">
            {providers.map((p, index) => {
              const { commitmentAmount, fee } = p;

              return (
                <Bar
                  status={status}
                  commitmentAmount={commitmentAmount}
                  index={index}
                  total={total}
                >
                  <Tooltip isExpanded={isExpanded}>
                    <span className={COPY_CLASS}>
                      {fee}% {t('Fee')}
                    </span>
                    <span className={COPY_CLASS}>
                      {addDecimalsFormatNumber(commitmentAmount, decimals)}
                    </span>
                  </Tooltip>
                </Bar>
              );
            })}
          </div>
        </div>

        <Target targetPercent={targetPercent} isLarge={isLarge}>
          <Tooltip isExpanded={isExpanded}>
            <span className={COPY_CLASS}>{t('Target stake')}</span>
            <span className={COPY_CLASS}>
              {addDecimalsFormatNumber(target, decimals)}
            </span>
          </Tooltip>
        </Target>
      </div>
    </div>
  );
};
