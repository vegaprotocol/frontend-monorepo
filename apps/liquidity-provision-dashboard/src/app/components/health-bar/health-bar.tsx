import classNames from 'classnames';
import type * as Schema from '@vegaprotocol/types';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { BigNumber } from 'bignumber.js';
import type { ReactNode } from 'react';

import { getColorForStatus } from '../../lib/utils';

import { Indicator } from '../indicator';

const Remainder = () => (
  <div className="bg-greys-light-200 h-[inherit] relative flex-1"></div>
);

const COPY_CLASS =
  'text-sm font-medium whitespace-nowrap text-white font-alpha calt';

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
        'absolute top-0 left-1/2 -translate-x-2/4 -translate-y-[80%] p-2 z-10 bg-greys-light-400 group-hover:flex rounded',
        {
          flex: isExpanded,
          hidden: !isExpanded,
        }
      )}
    >
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
        'absolute top-1/2 left-1/2 -translate-x-2/4 -translate-y-1/2 px-1.5 group'
      )}
      style={{ left: `${targetPercent}%` }}
    >
      <div
        className={classNames(
          'health-target w-0.5 bg-black group-hover:scale-x-150 group-hover:scale-y-108',
          {
            'h-6': !isLarge,
            'h-12': isLarge,
          }
        )}
      ></div>
      {children}
    </div>
  );
};

const Level = ({
  children,
  commitmentAmount,
  total,
  backgroundColor,
  opacity,
}: {
  children: ReactNode;
  commitmentAmount: number;
  total: number;
  backgroundColor: string;
  opacity: number;
}) => {
  const width = new BigNumber(commitmentAmount)
    .div(total)
    .multipliedBy(100)
    .toNumber();

  return (
    <div
      className={classNames(`relative h-[inherit] w-full group min-w-[1px]`)}
      style={{
        width: `${width}%`,
      }}
    >
      <div
        className="relative w-full h-[inherit] group-hover:scale-y-150"
        style={{
          opacity,
          backgroundColor,
        }}
      ></div>

      {children}
    </div>
  );
};

const Full = () => (
  <div className="bg-transparent w-full h-[inherit] absolute bottom-0 left-0"></div>
);

interface Levels {
  fee: string;
  commitmentAmount: number;
}

export const HealthBar = ({
  status,
  target = '0',
  decimals,
  levels,
  size = 'small',
  isExpanded = false,
}: {
  status: Schema.MarketTradingMode;
  target: string;
  decimals: number;
  levels: Levels[];
  isExpanded?: boolean;
  size?: 'small' | 'large';
}) => {
  const targetNumber = parseInt(target, 10);

  const committedNumber = levels
    .reduce((total, current) => {
      return total.plus(current.commitmentAmount);
    }, new BigNumber(0))
    .toNumber();

  const total =
    targetNumber * 2 >= committedNumber ? targetNumber * 2 : committedNumber;
  const targetPercent = (targetNumber / total) * 100;
  const isLarge = size === 'large';
  const backgroundColor = getColorForStatus(status);

  return (
    <div className="w-full">
      <div
        className={classNames('health-wrapper relative', {
          'py-2': !isLarge,
          'py-5': isLarge,
        })}
      >
        <div
          className={classNames('health-inner relative w-full flex', {
            'h-4': !isLarge,
            'h-8': isLarge,
          })}
        >
          <Full />

          <div className="health-bars h-[inherit] flex w-full gap-0.5">
            {levels.map((p, index) => {
              const { commitmentAmount, fee } = p;
              const prevLevel = levels[index - 1]?.commitmentAmount;
              const opacity = 1 - 0.2 * index;
              return (
                <Level
                  commitmentAmount={commitmentAmount}
                  total={total}
                  backgroundColor={backgroundColor}
                  opacity={opacity}
                >
                  <Tooltip isExpanded={isExpanded}>
                    <div className="mt-1.5 inline-flex">
                      <Indicator status={status} opacity={opacity} />
                    </div>
                    <div className="flex  flex-col">
                      <span className={COPY_CLASS}>
                        {fee}% {t('Fee')}
                      </span>
                      <span className={classNames(COPY_CLASS, 'opacity-60')}>
                        {prevLevel
                          ? addDecimalsFormatNumber(prevLevel, decimals)
                          : '0'}{' '}
                        - {addDecimalsFormatNumber(commitmentAmount, decimals)}
                      </span>
                    </div>
                  </Tooltip>
                </Level>
              );
            })}
            {(total !== committedNumber || levels.length === 0) && (
              <Remainder />
            )}
          </div>
        </div>

        <Target targetPercent={targetPercent} isLarge={isLarge}>
          <Tooltip isExpanded={isExpanded}>
            <div className="mt-1.5 inline-flex">
              <Indicator />
            </div>
            <span className={COPY_CLASS}>
              {t('Target stake')} {addDecimalsFormatNumber(target, decimals)}
            </span>
          </Tooltip>
        </Target>
      </div>
    </div>
  );
};
