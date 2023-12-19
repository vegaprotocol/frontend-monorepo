import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../../lib/use-t';
import classNames from 'classnames';
import type { PartyVestingStats } from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';
import { formatNumber } from '@vegaprotocol/utils';

export const RewardHoarderBonus = ({
  tiers,
  vestingDetails,
}: {
  tiers:
    | never[]
    | {
        minimum_quantum_balance: string;
        reward_multiplier: string;
      }[];
  vestingDetails?: PartyVestingStats | null;
}) => {
  const t = useT();
  if (!vestingDetails) return null;

  const getUserTier = () => {
    let userTier = 0,
      i = 0;
    do {
      userTier = i;
      i++;
    } while (
      i < tiers.length &&
      tiers[i].minimum_quantum_balance <= vestingDetails.quantumBalance
    );
    return userTier;
  };
  if (!tiers || tiers.length === 0) return null;
  const userTierIndex = getUserTier();

  // TODO: extract qUSD from the API
  const qAsset = 'qUSD';

  const safeProgress = (i: number) => {
    if (i < userTierIndex) return 100;
    if (i > userTierIndex) return 0;
    const progress = vestingDetails.quantumBalance;
    const total = tiers[i].minimum_quantum_balance;
    if (new BigNumber(progress).isGreaterThan(total)) return 100;
    return new BigNumber(progress)
      .multipliedBy(100)
      .dividedBy(total)
      .toNumber();
  };

  const progressBarHeight = 'h-10';

  return (
    <>
      <div className="flex flex-col gap-1 w-full">
        <div className="flex flex-col gap-1">
          <div
            className="grid"
            style={{
              gridTemplateColumns:
                'repeat(' + tiers.length + ', minmax(0, 1fr))',
            }}
          >
            {tiers.map((tier, index) => {
              return (
                <div key={index} className="flex justify-end -mr-[2.95rem]">
                  <span className="flex flex-col items-center gap-4 justify-between">
                    <span className="flex flex-col items-center gap-1">
                      <span className="flex flex-col items-center font-medium">
                        <span className="text-sm">
                          {t('Tier {{tier}}', {
                            tier: index + 1,
                          })}
                        </span>
                        <span className="text-muted text-xs">
                          {formatNumber(tier.minimum_quantum_balance)} {qAsset}
                        </span>
                      </span>

                      <span
                        className={classNames(
                          'text-xs flex flex-col items-center justify-center px-2 py-1 rounded-lg text-white border',
                          {
                            'border-pink-600 bg-pink-900': index % 3 === 0,
                            'border-purple-600 bg-purple-900': index % 3 === 1,
                            'border-blue-600 bg-blue-900': index % 3 === 2,
                          }
                        )}
                      >
                        <span>{t('Reward bonus')}</span>
                        <span>
                          {t('{{reward}}x', {
                            reward: tier.reward_multiplier,
                          })}
                        </span>
                      </span>
                    </span>

                    <span
                      className={classNames(
                        {
                          'text-pink-500': index % 3 === 0,
                          'text-purple-500': index % 3 === 1,
                          'text-blue-500': index % 3 === 2,
                        },
                        'text-xl leading-[0]'
                      )}
                    >
                      •
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {tiers.map((_tier, index) => {
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 shadow-card rounded-[100px] grow"
              >
                <div
                  className={classNames(
                    'relative w-full rounded-[100px] bg-gray-200 dark:bg-gray-800',
                    progressBarHeight
                  )}
                >
                  <div
                    className={classNames(
                      'absolute left-0 top-0 h-full rounded-[100px] bg-gradient-to-r',
                      {
                        'from-vega-pink-600 to-vega-pink-500': index % 3 === 0,
                        'from-vega-purple-600 to-vega-purple-500':
                          index % 3 === 1,
                        'from-vega-blue-600 to-vega-blue-500': index % 3 === 2,
                      }
                    )}
                    style={{ width: safeProgress(index) + '%' }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          <VegaIcon name={VegaIconNames.STREAK} />
          <span>
            {formatNumber(vestingDetails.quantumBalance)} {qAsset}
          </span>
        </div>
      </div>
    </>
  );
};
