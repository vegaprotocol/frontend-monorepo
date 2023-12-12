import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { useReferralProgram } from '../../client-pages/referrals/hooks/use-referral-program';
import { useT } from '../../lib/use-t';
import classNames from 'classnames';
import { useActivityStreakQuery } from './__generated__/Rewards';

export const ActivityStreaks = ({
  pubKey,
  epoch,
}: {
  pubKey: string | null;
  epoch: number;
}) => {
  const { data } = useActivityStreakQuery({
    variables: {
      partyId: pubKey || '',
    },
  });
  const { benefitTiers } = useReferralProgram();

  const streaks = data?.partiesConnection?.edges?.map(
    (edge) => edge?.node?.activityStreak
  );

  return streaks?.map((streak, i) => (
    <ActivityStreak benefitTiers={benefitTiers} streak={streak} key={i} />
  ));
};

export const ActivityStreak = ({
  benefitTiers,
  streak,
}: {
  benefitTiers:
    | never[]
    | {
        tier: number;
        rewardFactor: number;
        commission: string;
        discountFactor: number;
        discount: string;
        minimumVolume: number;
        volume: string;
        epochs: number;
      }[];
  streak:
    | (
        | {
            __typename?: 'PartyActivityStreak' | undefined;
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
  const progress = 30;
  const total = 100;

  const safeProgress = () => {
    return (progress / total) * 100;
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
                'repeat(' + benefitTiers.length + ', minmax(0, 1fr))',
            }}
          >
            {benefitTiers.map((tier, index) => {
              return (
                <div key={index} className="flex justify-end -mr-10">
                  <span className="flex flex-col items-center gap-1">
                    <span className="flex flex-col items-center font-medium">
                      <span className="text-sm">
                        {t('Tier {{tier}}', {
                          tier: tier.tier,
                        })}
                      </span>
                      <span className="text-muted text-xs">
                        {t('{{epochs}} epochs', {
                          epochs: tier.epochs,
                        })}
                      </span>
                    </span>

                    <span
                      className={classNames(
                        'text-xs flex flex-col items-center justify-center px-2 py-1 rounded-lg text-white border',
                        {
                          'border-pink-600 bg-pink-900': tier.tier === 1,
                          'border-purple-600 bg-purple-900': tier.tier === 2,
                          'border-blue-600 bg-blue-900': tier.tier === 3,
                        }
                      )}
                    >
                      <span>
                        {t('Reward {{reward}}x', {
                          reward: tier.rewardFactor || '1.5',
                        })}
                      </span>
                      <span>
                        {t('Vesting {{vesting}}x', {
                          vesting: '1.5',
                        })}
                      </span>
                    </span>

                    <span
                      className={classNames(
                        {
                          'text-pink-500': tier.tier === 1,
                          'text-purple-500': tier.tier === 2,
                          'text-blue-500': tier.tier === 3,
                        },
                        'text-xl'
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
          {benefitTiers.map((tier, index) => {
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
                        'from-vega-pink-600 to-vega-pink-500': tier.tier === 1,
                        'from-vega-purple-600 to-vega-purple-500':
                          tier.tier === 2,
                        'from-vega-blue-600 to-vega-blue-500': tier.tier === 3,
                      }
                    )}
                    style={{ width: safeProgress() + '%' }}
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
                // TODO here ir needs to be the current streak
                epochs: streak?.activeFor,
              })}
            </span>
            <span>
              <span className="text-vega-pink-500">3 days</span>
              &nbsp;to Tier 1{' '}
            </span>
          </span>
        </div>
      </div>
    </>
  );
};
