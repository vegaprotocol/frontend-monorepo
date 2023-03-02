// @ts-ignore No types available for duration-js
import Duration from 'duration-js';
import { useMemo, useState } from 'react';
import { formatDistance } from 'date-fns';
import { useTranslation } from 'react-i18next';
import {
  Callout,
  Intent,
  AsyncRenderer,
  Toggle,
  ExternalLink,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { createDocsLinks } from '@vegaprotocol/utils';
import { useNetworkParams, NetworkParams } from '@vegaprotocol/react-helpers';
import { useEpochQuery } from './__generated__/Rewards';
import { EpochCountdown } from '../../../components/epoch-countdown';
import { Heading, SubHeading } from '../../../components/heading';
import { EpochIndividualRewards } from '../epoch-individual-rewards/epoch-individual-rewards';
import { useRefreshAfterEpoch } from '../../../hooks/use-refresh-after-epoch';
import { useEnvironment } from '@vegaprotocol/environment';
import { ConnectToSeeRewards } from '../connect-to-see-rewards';
import { EpochTotalRewards } from '../epoch-total-rewards/epoch-total-rewards';

type RewardsView = 'total' | 'individual';

export const RewardsPage = () => {
  const { t } = useTranslation();
  const { VEGA_DOCS_URL } = useEnvironment();
  const { pubKey, pubKeys } = useVegaWallet();
  const [toggleRewardsView, setToggleRewardsView] =
    useState<RewardsView>('total');

  const {
    data: epochData,
    loading: epochLoading,
    error: epochError,
    refetch,
  } = useEpochQuery();

  useRefreshAfterEpoch(epochData?.epoch.timestamps.expiry, refetch);

  const {
    params,
    loading: paramsLoading,
    error: paramsError,
  } = useNetworkParams([NetworkParams.reward_staking_delegation_payoutDelay]);

  const payoutDuration = useMemo(() => {
    if (!params) {
      return 0;
    }
    return new Duration(
      params.reward_staking_delegation_payoutDelay
    ).milliseconds();
  }, [params]);

  return (
    <AsyncRenderer
      loading={paramsLoading || epochLoading}
      error={paramsError || epochError}
      data={epochData}
      render={() => (
        <section className="rewards">
          <Heading title={t('pageTitleRewards')} />
          <p className="mb-12">
            {t('rewardsIntro')}{' '}
            {VEGA_DOCS_URL && (
              <ExternalLink
                href={createDocsLinks(VEGA_DOCS_URL).REWARDS_GUIDE}
                target="_blank"
                data-testid="rewards-guide-link"
                className="text-white"
              >
                {t('seeHowRewardsAreCalculated')}
              </ExternalLink>
            )}
          </p>

          {payoutDuration ? (
            <div className="my-8">
              <Callout
                title={t('rewardsCallout', {
                  duration: formatDistance(new Date(0), payoutDuration),
                })}
                headingLevel={3}
                intent={Intent.Warning}
              >
                <p className="mb-0">{t('rewardsCalloutDetail')}</p>
              </Callout>
            </div>
          ) : null}

          {epochData?.epoch &&
            epochData.epoch?.id &&
            epochData.epoch.timestamps.start &&
            epochData.epoch.timestamps.expiry && (
              <section className="mb-16">
                <EpochCountdown
                  id={epochData.epoch.id}
                  startDate={new Date(epochData.epoch.timestamps.start)}
                  endDate={new Date(epochData.epoch.timestamps.expiry)}
                />
              </section>
            )}

          <section className="grid xl:grid-cols-2 gap-12 items-center mb-8">
            <div>
              <SubHeading title={t('rewardsAndFeesReceived')} />
              <p>
                {t(
                  'ThisDoesNotIncludeFeesReceivedForMakersOrLiquidityProviders'
                )}
              </p>
            </div>

            <div className="max-w-[600px]">
              <Toggle
                name="epoch-reward-view-toggle"
                toggles={[
                  {
                    label: t('totalDistributed'),
                    value: 'total',
                  },
                  {
                    label: t('earnedByMe'),
                    value: 'individual',
                  },
                ]}
                checkedValue={toggleRewardsView}
                onChange={(e) =>
                  setToggleRewardsView(e.target.value as RewardsView)
                }
              />
            </div>
          </section>

          {toggleRewardsView === 'total' ? (
            <EpochTotalRewards />
          ) : (
            <section>
              {pubKey && pubKeys?.length ? (
                <EpochIndividualRewards />
              ) : (
                <ConnectToSeeRewards />
              )}
            </section>
          )}
        </section>
      )}
    />
  );
};
