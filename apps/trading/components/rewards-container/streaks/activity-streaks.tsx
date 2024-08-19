import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../../lib/use-t';
import { cn } from '@vegaprotocol/ui-toolkit';
import BigNumber from 'bignumber.js';
import type { PartyActivityStreak } from '@vegaprotocol/types';
import {
  NetworkParams,
  useNetworkParams,
} from '@vegaprotocol/network-parameters';

export const safeProgress = (
  i: number,
  userTierIndex: number,
  total: number | string,
  progress?: number | string
) => {
  if (i < userTierIndex) return 100;
  if (i > userTierIndex) return 0;

  if (!progress || !total) return 0;
  if (new BigNumber(progress).isGreaterThan(total)) return 100;
  return new BigNumber(progress)
    .multipliedBy(100)
    .dividedBy(total || 1)
    .toNumber();
};

export const useGetUserTier = (
  tiers: {
    minimum_activity_streak: number;
    reward_multiplier: string;
    vesting_multiplier: string;
  }[],
  progress?: number
) => {
  if (!progress) return 0;
  if (!tiers || tiers.length === 0) return 0;

  let userTier = 0;
  let i = 0;
  while (
    i < tiers.length &&
    tiers[userTier].minimum_activity_streak < progress
  ) {
    userTier = i;
    i++;
  }

  if (
    i === tiers.length &&
    tiers[userTier].minimum_activity_streak <= progress
  ) {
    userTier = i;
  }

  if (userTier > tiers.length) {
    userTier--;
  }

  return userTier;
};

export const ActivityStreak = ({
  tiers,
  streak,
}: {
  tiers: {
    minimum_activity_streak: number;
    reward_multiplier: string;
    vesting_multiplier: string;
  }[];
  streak?: PartyActivityStreak | null;
}) => {
  const t = useT();
  const userTierIndex = useGetUserTier(tiers, streak?.activeFor);
  const { params } = useNetworkParams([
    NetworkParams.rewards_activityStreak_inactivityLimit,
  ]);
  const remaining = new BigNumber(params.rewards_activityStreak_inactivityLimit)
    .minus(streak?.inactiveFor || 0)
    .toNumber();
  if (!tiers || tiers.length === 0) return null;

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
                        <span className="text-surface-1-fg-muted text-xs">
                          {t('numberEpochs', '{{count}} epochs', {
                            count: tier.minimum_activity_streak,
                          })}
                        </span>
                      </span>

                      <span
                        className={cn(
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
                      className={cn(
                        {
                          'text-pink-500': index % 6 === 0,
                          'text-purple-500': index % 6 === 1,
                          'text-blue-500': index % 6 === 2,
                          'text-orange-500': index % 6 === 3,
                          'text-green-500': index % 6 === 4,
                          'text-yellow-500': index % 6 === 5,
                        },
                        'leading-[0] text-[48px]'
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
                className="bg-surface-0 shadow-card rounded-[100px] grow"
              >
                <div
                  className={cn(
                    'relative w-full rounded-[100px] bg-surface-2',
                    progressBarHeight
                  )}
                >
                  <div
                    className={cn(
                      'absolute left-0 top-0 h-full rounded-[100px] bg-gradient-to-r',
                      {
                        'from-gs-400 to-gs-200':
                          userTierIndex === 0 || streak?.isActive === false,
                        'from-pink-600 to-pink-500': userTierIndex % 6 === 1,
                        'from-purple-600 to-purple-500':
                          userTierIndex % 6 === 2,
                        'from-blue-600 to-blue-500': userTierIndex % 6 === 3,
                        'from-orange-600 to-orange-500':
                          userTierIndex % 6 === 4,
                        'from-green-600 to-green-500': userTierIndex % 6 === 5,
                        'from-yellow-600 to-yellow-500':
                          userTierIndex % 6 === 0,
                      }
                    )}
                    style={{
                      width:
                        safeProgress(
                          index,
                          userTierIndex,
                          tiers[index].minimum_activity_streak,
                          streak?.activeFor
                        ) + '%',
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          <VegaIcon name={VegaIconNames.STREAK} />

          <span className="flex flex-col">
            {streak && (
              <span data-testid="epoch-streak">
                {streak.isActive
                  ? t(
                      'userActive',
                      '{{active}} trader: {{count}} epochs so far',
                      {
                        active: 'Active',
                        count: streak.activeFor || 0,
                      }
                    )
                  : remaining > 0
                  ? t(
                      'userInactive',
                      '{{active}} trader: {{count}} epochs so far, you will lose your streak in {{remaining}} epochs!',
                      {
                        active: 'Inactive',
                        count: streak.inactiveFor || 0,
                        remaining,
                      }
                    )
                  : t(
                      'userActive',
                      '{{active}} trader: {{count}} epochs so far',
                      {
                        active: 'Inactive',
                        count: streak.inactiveFor || 0,
                      }
                    )}{' '}
                {userTierIndex > 0 &&
                  new BigNumber(
                    tiers[0].minimum_activity_streak
                  ).isLessThanOrEqualTo(streak?.activeFor || 0) &&
                  t('(Tier {{tier}} as of last epoch)', {
                    tier: userTierIndex,
                  })}
              </span>
            )}
          </span>
        </div>
      </div>
    </>
  );
};
