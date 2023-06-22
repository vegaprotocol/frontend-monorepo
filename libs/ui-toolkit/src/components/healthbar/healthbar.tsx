import classNames from 'classnames';
import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { BigNumber } from 'bignumber.js';
import { getIntentBackground, Intent } from '../../utils/intent';
import { Indicator } from '../indicator';
import { Tooltip } from '../tooltip';

const Remainder = () => (
  <div className="bg-greys-light-200 h-[inherit] relative flex-1" />
);

const Target = ({
  target,
  decimals,
  isLarge,
}: {
  isLarge: boolean;
  target: string;
  decimals: number;
}) => {
  return (
    <Tooltip
      description={
        <>
          <div className="mt-1.5 inline-flex">
            <Indicator variant={Intent.None} />
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
        style={{ left: '50%' }}
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
  rangeLimit,
  opacity,
  fee,
  prevLevel,
  decimals,
  intent,
}: {
  commitmentAmount: number;
  rangeLimit: number;
  opacity: number;
  fee: string;
  prevLevel: number;
  decimals: number;
  intent: Intent;
}) => {
  const width = new BigNumber(commitmentAmount)
    .div(rangeLimit)
    .multipliedBy(100)
    .toNumber();

  const formattedFee = fee
    ? formatNumberPercentage(new BigNumber(fee).times(100), 2)
    : '-';

  const tooltipContent = (
    <div className="text-vega-dark-100 dark:text-vega-light-200">
      <div className="mt-1.5 inline-flex">
        <Indicator variant={intent} />
      </div>
      <span>
        {formattedFee} {t('Fee')}
      </span>
      <div className="flex  flex-col">
        <span>
          {prevLevel ? addDecimalsFormatNumber(prevLevel, decimals) : '0'} -{' '}
          {addDecimalsFormatNumber(commitmentAmount, decimals)}
        </span>
      </div>
    </div>
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
          className={classNames(
            'relative w-full h-[inherit] group-hover:scale-y-150',
            getIntentBackground(intent)
          )}
          style={{ opacity }}
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
  target = '0',
  decimals,
  levels,
  size = 'small',
  intent,
}: {
  target: string;
  decimals: number;
  levels: Levels[];
  size?: 'small' | 'large';
  intent: Intent;
}) => {
  const targetNumber = parseInt(target, 10);
  const rangeLimit = targetNumber * 2;

  let lastVisibleLevel = 0;
  const committedNumber = levels
    .reduce((total, current, index) => {
      const newTotal = total.plus(current.commitmentAmount);
      if (total.isLessThan(rangeLimit) && newTotal.isGreaterThan(rangeLimit)) {
        lastVisibleLevel = index;
      }
      return newTotal;
    }, new BigNumber(0))
    .toNumber();

  const isLarge = size === 'large';
  const showRemainder = committedNumber < rangeLimit || levels.length === 0;
  const showOverflow = !showRemainder && lastVisibleLevel < levels.length - 1;

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
              return index <= lastVisibleLevel ? (
                <Level
                  commitmentAmount={commitmentAmount}
                  rangeLimit={rangeLimit}
                  opacity={opacity}
                  fee={fee}
                  prevLevel={prevLevel}
                  decimals={decimals}
                  intent={intent}
                  key={'healthbar-segment-' + index}
                />
              ) : null;
            })}
            {showRemainder && <Remainder />}
            {showOverflow && (
              <Tooltip
                description={t(
                  'Providers greater than 2x target stake not shown'
                )}
              >
                <div className="h-[inherit] relative flex-1 leading-4">...</div>
              </Tooltip>
            )}
          </div>
        </div>
        <Target isLarge={isLarge} target={target} decimals={decimals} />
      </div>
    </div>
  );
};
