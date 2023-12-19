import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../../lib/use-t';
import classNames from 'classnames';
import { formatNumber } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';

export const ActivityStreak = ({
  tiers,
  streak,
}: {
  tiers:
    | never[]
    | {
        minimum_activity_streak: number;
        reward_multiplier: string;
        vesting_multiplier: string;
      }[];
  streak:
    | (
        | {
            activeFor: number;
            isActive: boolean;
            inactiveFor: number;
            rewardDistributionMultiplier: string;
            rewardVestingMultiplier: string;
            epoch: number;
            tradedVolume: string;
            openVolume: string;
          }
        | null
        | undefined
      )
    | undefined;
}) => {
  const t = useT();
  if (!streak?.activeFor) return null;

  const getUserTier = () => {
    let userTier = 0,
      i = 0;
    do {
      userTier = i;
      i++;
    } while (
      i < tiers.length &&
      tiers[i].minimum_activity_streak <= streak.activeFor
    );
    return userTier;
  };

  if (!tiers || tiers.length === 0) return null;

  const userTierIndex = getUserTier();

  const safeProgress = (i: number) => {
    if (i < userTierIndex) return 100;
    if (i > userTierIndex) return 0;
    const progress = streak.activeFor;
    const total = tiers[i].minimum_activity_streak;
    if (new BigNumber(progress).isGreaterThan(total)) return 100;
    return new BigNumber(progress)
      .multipliedBy(100)
      .dividedBy(total)
      .toNumber();
  };

  const epochsStreak =
    tiers[userTierIndex].minimum_activity_streak - streak.activeFor >= 0
      ? tiers[userTierIndex].minimum_activity_streak - streak.activeFor
      : 0;

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
                <div key={index} className="flex justify-end -mr-[2.85rem]">
                  <span className="flex flex-col items-center gap-4 justify-between">
                    <span className="flex flex-col items-center gap-1">
                      <span className="flex flex-col items-center font-medium">
                        <span className="text-sm">
                          {t('Tier {{tier}}', {
                            tier: index + 1,
                          })}
                        </span>
                        <span className="text-muted text-xs">
                          {t('{{epochs}} epochs', {
                            epochs: formatNumber(tier.minimum_activity_streak),
                          })}
                        </span>
                      </span>

                      <span
                        className={classNames(
                          'text-xs flex flex-col items-center justify-center px-2 py-1 rounded-lg text-white border',
                          {
                            'border-pink-600 bg-pink-900': index % 6 === 0,
                            'border-purple-600 bg-purple-900': index % 6 === 1,
                            'border-blue-600 bg-blue-900': index % 6 === 2,
                            'border-orange-600 bg-orange-900': index % 6 === 3,
                            'border-green-600 bg-green-900': index % 6 === 4,
                            'border-yellow-600 bg-yellow-900': index % 6 === 5,
                          }
                        )}
                      >
                        <span>
                          {t('Reward {{reward}}x', {
                            reward: tier.reward_multiplier,
                          })}
                        </span>
                        <span>
                          {t('Vesting {{vesting}}x', {
                            vesting: tier.vesting_multiplier,
                          })}
                        </span>
                      </span>
                    </span>
                    <span
                      className={classNames(
                        {
                          'text-pink-500': index % 6 === 0,
                          'text-purple-500': index % 6 === 1,
                          'text-blue-500': index % 6 === 2,
                          'text-orange-500': index % 6 === 3,
                          'text-green-500': index % 6 === 4,
                          'text-yellow-500': index % 6 === 5,
                        },
                        'leading-[0] font-sans text-[48px]'
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
                        'from-vega-dark-400 to-vega-dark-200':
                          userTierIndex % 6 === 0,
                        'from-vega-pink-600 to-vega-pink-500':
                          userTierIndex % 6 === 1,
                        'from-vega-purple-600 to-vega-purple-500':
                          userTierIndex % 6 === 2,
                        'from-vega-blue-600 to-vega-blue-500':
                          userTierIndex % 6 === 3,
                        'from-vega-orange-600 to-vega-orange-500':
                          userTierIndex % 6 === 4,
                        'from-vega-green-600 to-vega-green-500':
                          userTierIndex % 6 === 5,
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

          <span className="flex flex-col text-xs">
            <span>
              {t('{{epochs}} epochs streak', {
                epochs: formatNumber(streak?.activeFor),
              })}
            </span>
            <span>
              <span className="text-vega-pink-500">
                {t('{{epochs}} epochs streak', {
                  epochs: formatNumber(epochsStreak),
                })}
              </span>
              &nbsp;{' '}
              {t('to Tier {{userTier}}', {
                userTier: userTierIndex + 1,
              })}
            </span>
          </span>
        </div>
      </div>
    </>
  );
};
