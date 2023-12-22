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

  const getUserTier = () => {
    let userTier = 0,
      i = 0;
    if (!vestingDetails) return 0;
    do {
      userTier = i;
      i++;
    } while (
      i < tiers.length &&
      new BigNumber(tiers[userTier].minimum_quantum_balance).isLessThan(
        vestingDetails.quantumBalance
      )
    );
    if (
      i === tiers.length &&
      new BigNumber(
        tiers[userTier].minimum_quantum_balance
      ).isLessThanOrEqualTo(vestingDetails.quantumBalance)
    ) {
      userTier = i;
    }
    if (userTier > tiers.length - 1) {
      userTier--;
    }
    return userTier;
  };
  if (!tiers || tiers.length === 0) return null;
  const userTierIndex = getUserTier();

  // There is only value to compare to the tiers that covers all the user' rewards across all assets
  const qUSD = 'qUSD';

  const safeProgress = (i: number) => {
    if (i < userTierIndex) return 100;
    if (i > userTierIndex) return 0;
    if (!vestingDetails) return 0;
    const progress = vestingDetails.quantumBalance;
    const total = tiers[i].minimum_quantum_balance;
    if (!total || total === '0') return 0;
    if (new BigNumber(progress).isGreaterThan(total)) return 100;
    return new BigNumber(progress)
      .multipliedBy(100)
      .dividedBy(total || 1)
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
                          {formatNumber(tier.minimum_quantum_balance)} {qUSD}
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
                          userTierIndex === 0,
                        'from-vega-pink-600 to-vega-pink-500':
                          userTierIndex % 6 === 0,
                        'from-vega-purple-600 to-vega-purple-500':
                          userTierIndex % 6 === 1,
                        'from-vega-blue-600 to-vega-blue-500':
                          userTierIndex % 6 === 2,
                        'from-vega-orange-600 to-vega-orange-500':
                          userTierIndex % 6 === 3,
                        'from-vega-green-600 to-vega-green-500':
                          userTierIndex % 6 === 4,
                        'from-vega-yellow-600 to-vega-yellow-500':
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
          <span>
            {formatNumber(vestingDetails?.quantumBalance || 0)} {qUSD}{' '}
            {userTierIndex >= 0 &&
              new BigNumber(
                tiers[0].minimum_quantum_balance
              ).isLessThanOrEqualTo(vestingDetails?.quantumBalance || 0) &&
              t('(Tier {{tier}})', { tier: userTierIndex + 1 })}
          </span>
        </div>
      </div>
    </>
  );
};
