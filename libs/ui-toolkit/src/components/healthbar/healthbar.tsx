import classNames from 'classnames';
import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
} from '@vegaprotocol/utils';
import { BigNumber } from 'bignumber.js';
import { getIntentBackground, Intent } from '../../utils/intent';
import { Indicator } from '../indicator';
import { Tooltip } from '../tooltip';
import { useT } from '../../use-t';

const Remainder = () => (
  <div className="bg-greys-light-200 relative h-[inherit] flex-1" />
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
  const t = useT();
  return (
    <Tooltip
      description={
        <div className="text-vega-dark-100 dark:text-vega-light-200">
          <div className="mt-1.5 inline-flex">
            <Indicator variant={Intent.None} />
          </div>
          <span>
            {t('Target stake {{target}}', {
              target: addDecimalsFormatNumber(target, decimals),
            })}{' '}
          </span>
        </div>
      }
    >
      <div
        className={classNames(
          'group absolute left-1/2 top-1/2 -translate-x-2/4 -translate-y-1/2 px-1.5'
        )}
        style={{ left: '50%' }}
      >
        <div
          className={classNames(
            'health-target bg-vega-dark-100 dark:bg-vega-light-100 group-hover:scale-y-108 w-0.5 group-hover:scale-x-150',
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

const AuctionTarget = ({
  trigger,
  isLarge,
  rangeLimit,
  decimals,
}: {
  isLarge: boolean;
  trigger: number;
  rangeLimit: number;
  decimals: number;
}) => {
  const t = useT();
  const leftPosition = new BigNumber(trigger).div(rangeLimit).multipliedBy(100);
  return (
    <Tooltip
      description={
        <div className="text-vega-dark-100 dark:text-vega-light-200">
          <div className="mt-1.5 inline-flex">
            <Indicator variant={Intent.None} />
          </div>
          <span>
            {t('Auction Trigger stake {{trigger}}', {
              trigger: addDecimalsFormatNumber(trigger, decimals),
            })}
          </span>
        </div>
      }
    >
      <div
        className={classNames(
          'group absolute left-1/2 top-1/2 -translate-x-2/4 -translate-y-1/2 px-1.5'
        )}
        style={{
          left: `${leftPosition}%`,
        }}
      >
        <div
          className={classNames(
            'health-target group-hover:scale-y-108 dashed-background w-0.5 group-hover:scale-x-150',
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
  const t = useT();
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
      <span>{t('{{fee}} Fee', { fee: formattedFee })}</span>
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
        className="group relative h-[inherit] w-full min-w-[1px]"
        style={{
          width: `${width}%`,
        }}
      >
        <div
          className={classNames(
            'relative h-[inherit] w-full group-hover:scale-y-150',
            getIntentBackground(intent)
          )}
          style={{ opacity }}
        />
      </div>
    </Tooltip>
  );
};

const Full = () => (
  <div className="absolute bottom-0 left-0 h-[inherit] w-full bg-transparent" />
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
  triggerRatio,
}: {
  target: string;
  decimals: number;
  levels: Levels[];
  size?: 'small' | 'large';
  intent: Intent;
  triggerRatio?: string;
}) => {
  const t = useT();
  const targetNumber = parseInt(target, 10);
  const rangeLimit = targetNumber * 2;

  const triggerRatioNumber = triggerRatio ? parseFloat(triggerRatio) : 0;
  const auctionTrigger = targetNumber * triggerRatioNumber;

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
          className={classNames('health-inner relative flex w-full', {
            'h-4': !isLarge,
            'h-8': isLarge,
          })}
        >
          <Full />

          <div
            className="health-bars outline-vega-light-200 dark:outline-vega-dark-200 flex
              h-[inherit] w-full gap-0.5 outline"
          >
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
                description={
                  <div className="text-vega-dark-100 dark:text-vega-light-200">
                    {t('Providers greater than 2x target stake not shown')}
                  </div>
                }
              >
                <div className="relative h-[inherit] flex-1 leading-4">...</div>
              </Tooltip>
            )}
          </div>
        </div>
        {triggerRatio && (
          <AuctionTarget
            isLarge={isLarge}
            trigger={auctionTrigger}
            rangeLimit={rangeLimit}
            decimals={decimals}
          />
        )}

        <Target isLarge={isLarge} target={target} decimals={decimals} />
      </div>
    </div>
  );
};
