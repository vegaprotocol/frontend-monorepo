import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { useRewardsHistoryQuery } from './__generated__/Rewards';
import { useReferralProgram } from '../../client-pages/referrals/hooks/use-referral-program';
import { useState, useEffect } from 'react';
import { useT } from '../../lib/use-t';
import { useRewardsRowData } from './use-reward-row-data';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import classNames from 'classnames';
import {
  Icon,
  type IconName,
  Intent,
  Tooltip,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { IconNames } from '@blueprintjs/icons';

export const ActiveRewards = ({
  epoch,
  pubKey,
  assets,
}: {
  pubKey: string | null;
  epoch: number;
  assets: Record<string, AssetFieldsFragment>;
}) => {
  const [epochVariables] = useState(() => ({
    from: epoch - 1,
    to: epoch,
  }));

  // No need to specify the fromEpoch as it will by default give you the last
  const { refetch, data } = useRewardsHistoryQuery({
    variables: {
      partyId: pubKey || '',
      fromEpoch: epochVariables.from,
      toEpoch: epochVariables.to,
    },
  });

  useEffect(() => {
    const interval = setInterval(refetch, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  const rowData = useRewardsRowData({
    epochRewardSummaries: data?.epochRewardSummaries,
    partyRewards: data?.party?.rewardsConnection,
    assets,
    partyId: pubKey,
  });

  const t = useT();
  if (!pubKey) {
    return (
      <div className="pt-4">
        <p className="text-muted text-sm">{t('Not connected')}</p>
      </div>
    );
  }

  // TODO: extract card component - call it reward tiles
  return (
    <div className="grid gap-x-8 gap-y-10 h-fit grid-cols-[repeat(auto-fill,_minmax(230px,_1fr))] md:grid-cols-[repeat(auto-fill,_minmax(230px,_1fr))] lg:grid-cols-[repeat(auto-fill,_minmax(320px,_1fr))] xl:grid-cols-[repeat(auto-fill,_minmax(343px,_1fr))]">
      {rowData.map((row, i) => {
        // TODO: filter out 0 values
        // const entries = Object.entries(row).filter(([key, value]) => {
        //   value !== 0;
        // });
        return (
          <div key={i}>
            <div
              className={classNames(
                'bg-gradient-to-r col-span-full p-0.5 lg:col-auto h-full',
                'rounded-lg',
                'from-vega-blue-500 to-vega-green-400'
              )}
            >
              <div className="bg-gradient-to-b from-vega-blue-400 dark:from-vega-blue-600 to-20% bg-vega-clight-800 dark:bg-vega-cdark-800 h-full w-full rounded p-4 flex flex-col gap-4">
                <div className="flex justify-between gap-4">
                  <div className="flex flex-col gap-2 items-center text-center">
                    <span className="flex items-center p-2 rounded-full border border-gray-600">
                      <VegaIcon name={VegaIconNames.MAN} size={18} />
                    </span>
                    <span className="text-muted text-xs">
                      {t('Individual')}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 items-center text-center">
                    <span className="flex flex-col gap-1 font-alpha calt text-2xl shrink-1 text-center">
                      <span>
                        {`${addDecimalsFormatNumber(
                          row.total,
                          row.asset?.decimals || 0
                        )}`}
                      </span>

                      <span>{`${row.asset?.symbol}`}</span>
                    </span>

                    <Tooltip description={'pro rata'} underline={true}>
                      <span className="text-xs">{t('Pro rata')}</span>
                    </Tooltip>
                  </div>

                  <div className="flex flex-col gap-2 items-center text-center">
                    <span className="flex items-center p-2 rounded-full border border-gray-600">
                      <VegaIcon name={VegaIconNames.LOCK} size={18} />
                    </span>
                    <span className="text-muted text-xs whitespace-nowrap">
                      {t('11 epochs')}
                    </span>
                  </div>
                </div>

                <span className="border-[0.5px] border-gray-700" />

                <span>
                  {t('Price taking')} • {row.asset?.symbol} • {row.asset?.name}
                </span>

                <div className="flex items-center gap-8 flex-wrap">
                  <span className="flex flex-col">
                    <span className="text-muted text-xs">{t('Ends in')}</span>
                    <span>{t('5 epochs')}</span>
                  </span>

                  <span className="flex flex-col">
                    <span className="text-muted text-xs">
                      {t('Assessed over')}
                    </span>
                    <span>{t('5 epochs')}</span>
                  </span>
                </div>

                <span className="text-muted text-sm">
                  {t(
                    'Get rewards for taking prices on the order book and paying fees.'
                  )}
                </span>

                <span className="border-[0.5px] border-gray-700" />

                {/* <div className="grid grid-cols-3 items-center gap-3"> */}
                <div className="flex justify-between flex-wrap items-center gap-3">
                  <span className="flex flex-col gap-1">
                    <span className="flex items-center gap-1 text-muted text-xs">
                      {t('Entity scope')}{' '}
                    </span>

                    <span className="flex items-center gap-1">
                      <span className="flex items-center p-1 rounded-full border border-gray-600">
                        <VegaIcon name={VegaIconNames.MAN} size={16} />
                      </span>
                      <StatusIndicator
                        intent={Intent.Success}
                        icon={IconNames.TICK_CIRCLE}
                      />
                    </span>
                  </span>

                  <span className="flex flex-col gap-1">
                    <span className="flex items-center gap-1 text-muted text-xs">
                      {t('Amount staked')}{' '}
                    </span>
                    <span className="flex items-center gap-1">
                      {t('200 VEGA')}
                      <StatusIndicator
                        intent={Intent.Success}
                        icon={IconNames.TICK_CIRCLE}
                      />
                    </span>
                  </span>

                  <span className="flex flex-col gap-1">
                    <span className="flex items-center gap-1 text-muted text-xs">
                      {t('Average position')}{' '}
                    </span>
                    <span className="flex items-center gap-1">
                      {t('100 USDT')}
                      <StatusIndicator
                        intent={Intent.Success}
                        icon={IconNames.TICK_CIRCLE}
                      />
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// const getIconIntent = (status: string) => {
//   switch (status) {
//     case 'GOOD':
//       return { icon: IconNames.TICK_CIRCLE, intent: Intent.Success };
//     case 'RETIRED':
//       return { icon: IconNames.MOON, intent: Intent.None };
//     case 'UNKNOWN':
//       return { icon: IconNames.HELP, intent: Intent.Primary };
//     case 'MALICIOUS':
//       return { icon: IconNames.ERROR, intent: Intent.Danger };
//     case 'SUSPICIOUS':
//       return { icon: IconNames.ERROR, intent: Intent.Danger };
//     case 'COMPROMISED':
//       return { icon: IconNames.ERROR, intent: Intent.Danger };
//     default:
//       return { icon: IconNames.HELP, intent: Intent.Primary };
//   }
// };

const StatusIndicator = ({
  intent,
  icon,
}: {
  intent: Intent;
  icon: string;
}) => {
  return (
    <span
      className={classNames(
        {
          'text-gray-700 dark:text-gray-300': intent === Intent.None,
          'text-vega-blue': intent === Intent.Primary,
          'text-vega-green dark:text-vega-green': intent === Intent.Success,
          'dark:text-yellow text-yellow-600': intent === Intent.Warning,
          'text-vega-red': intent === Intent.Danger,
        },
        'flex items-start p-1 align-text-bottom'
      )}
    >
      <Icon size={3} name={icon as IconName} />
    </span>
  );
};

export const ActivityStreak = ({
  epoch,
  pubKey,
  assets,
}: {
  pubKey: string | null;
  epoch: number;
  assets: Record<string, AssetFieldsFragment>;
}) => {
  // const { data } = useActivityStreakQuery({
  //   variables: {
  //     partyId: pubKey || '',
  //   },
  // });

  const { benefitTiers } = useReferralProgram();

  // const streaks = data?.partiesConnection?.edges?.map(
  //   (edge) => edge?.node?.activityStreak
  // );

  // @Input()
  const progress = 30;
  const total = 100;

  const safeProgress = () => {
    return (progress / total) * 100;
  };

  const progressBarHeight = 'h-6';

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
                      <span className="text-sm">Tier {tier.tier}</span>
                      <span className="text-muted text-xs">7 days</span>
                    </span>

                    <span className="text-xs flex flex-col items-center justify-center px-2 py-1 rounded-lg text-white border border-pink-600 bg-pink-900">
                      <span>Reward 1x</span>
                      <span>Vesting 1.5x</span>
                    </span>

                    <span className="text-pink-500 text-xl">•</span>
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
                    className="absolute left-0 top-0 h-full rounded-[100px] bg-gradient-to-r from-vega-pink-600 to-vega-pink-500"
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
            <span>4 days streak</span>
            <span>
              <span className="text-vega-pink-500">3 days</span> &nbsp;to Tier 1
            </span>
          </span>
        </div>
      </div>
      {/* <div>{JSON.stringify(stakingTiers)}</div> */}
      {/* <div>{JSON.stringify(details)}</div> */}
      {/* <div>{JSON.stringify(benefitTiers)}</div> */}
      {/* <div>{JSON.stringify(streaks)}</div> */}
    </>
  );
};
