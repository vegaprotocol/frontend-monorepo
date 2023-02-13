// @ts-ignore No types available for duration-js
import Duration from 'duration-js';
import React, { useMemo, useState } from 'react';
import { formatDistance } from 'date-fns';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Callout,
  Intent,
  AsyncRenderer,
  Toggle,
  ExternalLink,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import {
  useNetworkParams,
  NetworkParams,
  createDocsLinks,
} from '@vegaprotocol/react-helpers';
import {
  AppStateActionType,
  useAppState,
} from '../../../contexts/app-state/app-state-context';
import { useEpochQuery } from './__generated__/Rewards';

import { EpochCountdown } from '../../../components/epoch-countdown';
import { Heading, SubHeading } from '../../../components/heading';
import { RewardInfo } from '../epoch-individual-awards/reward-info';
import { EpochRewards } from '../epoch-total-rewards/epoch-rewards';
import { useRefreshAfterEpoch } from '../../../hooks/use-refresh-after-epoch';
import { useEnvironment } from '@vegaprotocol/environment';

type RewardsView = 'total' | 'individual';

export const RewardsPage = () => {
  const { t } = useTranslation();
  const { VEGA_DOCS_URL } = useEnvironment();
  const { pubKey, pubKeys } = useVegaWallet();
  const [toggleRewardsView, setToggleRewardsView] =
    useState<RewardsView>('total');

  const { openVegaWalletDialog } = useVegaWalletDialogStore((store) => ({
    openVegaWalletDialog: store.openVegaWalletDialog,
  }));
  const { appDispatch } = useAppState();

  const {
    params,
    loading: paramsLoading,
    error: paramsError,
  } = useNetworkParams([NetworkParams.reward_staking_delegation_payoutDelay]);

  const {
    data: epochData,
    loading: epochLoading,
    error: epochError,
    refetch,
  } = useEpochQuery();
  useRefreshAfterEpoch(epochData?.epoch.timestamps.expiry, refetch);

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

          {epochData &&
            epochData.epoch.id &&
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
            <EpochRewards />
          ) : (
            <section>
              {pubKey && pubKeys?.length ? (
                <RewardInfo />
              ) : (
                <div>
                  <Button
                    data-testid="connect-to-vega-wallet-btn"
                    onClick={() => {
                      appDispatch({
                        type: AppStateActionType.SET_VEGA_WALLET_OVERLAY,
                        isOpen: true,
                      });
                      openVegaWalletDialog();
                    }}
                  >
                    {t('connectVegaWallet')}
                  </Button>
                </div>
              )}
            </section>
          )}
        </section>
      )}
    />
  );
};
