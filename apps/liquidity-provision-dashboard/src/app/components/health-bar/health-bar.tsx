import classNames from 'classnames';
import type * as Schema from '@vegaprotocol/types';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { BigNumber } from 'bignumber.js';
import { Tooltip } from '@vegaprotocol/ui-toolkit';

import { getColorForStatus } from '../../lib/utils';

import { Indicator } from '../indicator';

const Remainder = () => (
  <div className="bg-greys-light-200 h-[inherit] relative flex-1" />
);

const Target = ({
  target,
  targetPercent,
  decimals,
  isLarge,
}: {
  targetPercent: number;
  isLarge: boolean;
  target: string;
  decimals: number;
}) => {
  return (
    <Tooltip
      description={
        <>
          <div className="mt-1.5 inline-flex">
            <Indicator />
          </div>
          <span>
            {t('Target stake')} {addDecimalsFormatNumber(target, decimals)}
          </span>
        </>
      }
    >
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
        />
      </div>
    </Tooltip>
  );
};

const Level = ({
  commitmentAmount,
  total,
  backgroundColor,
  opacity,
  status,
  fee,
  prevLevel,
  decimals,
}: {
  commitmentAmount: number;
  total: number;
  backgroundColor: string;
  opacity: number;
  status: Schema.MarketTradingMode;
  fee: string;
  prevLevel: number;
  decimals: number;
}) => {
  const width = new BigNumber(commitmentAmount)
    .div(total)
    .multipliedBy(100)
    .toNumber();

  const tooltipContent = (
    <>
      <div className="mt-1.5 inline-flex">
        <Indicator status={status} opacity={opacity} />
      </div>
      <span>
        {fee}% {t('Fee')}
      </span>
      <div className="flex  flex-col">
        <span>
          {prevLevel ? addDecimalsFormatNumber(prevLevel, decimals) : '0'} -{' '}
          {addDecimalsFormatNumber(commitmentAmount, decimals)}
        </span>
      </div>
    </>
  );

  return (
    <Tooltip description={tooltipContent}>
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
        />
      </div>
    </Tooltip>
  );
};

const Full = () => (
  <div className="bg-transparent w-full h-[inherit] absolute bottom-0 left-0" />
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
}: {
  status: Schema.MarketTradingMode;
  target: string;
  decimals: number;
  levels: Levels[];
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
              console.log('level: ', p);
              const { commitmentAmount, fee } = p;
              const prevLevel = levels[index - 1]?.commitmentAmount;
              const opacity = 1 - 0.2 * index;
              return (
                <Level
                  commitmentAmount={commitmentAmount}
                  total={total}
                  backgroundColor={backgroundColor}
                  opacity={opacity}
                  status={status}
                  fee={fee}
                  prevLevel={prevLevel}
                  decimals={decimals}
                />
              );
            })}
            {(total !== committedNumber || levels.length === 0) && (
              <Remainder />
            )}
          </div>
        </div>
        <Target
          targetPercent={targetPercent}
          isLarge={isLarge}
          target={target}
          decimals={decimals}
        />
      </div>
    </div>
  );
};
