import { Button, Callout, Intent, Splash } from '@vegaprotocol/ui-toolkit';
import { formatDistance } from 'date-fns';
// @ts-ignore No types available for duration-js
import Duration from 'duration-js';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ENV } from '../../../config';

import { EpochCountdown } from '../../../components/epoch-countdown';
import { Heading } from '../../../components/heading';
import { SplashLoader } from '../../../components/splash-loader';
import {
  AppStateActionType,
  useAppState,
} from '../../../contexts/app-state/app-state-context';
import { RewardInfo } from './reward-info';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import { useNetworkParams, NetworkParams } from '@vegaprotocol/react-helpers';
import { useRewardsQuery } from './__generated__/Rewards';

export const RewardsPage = () => {
  const { t } = useTranslation();
  const { pubKey, pubKeys } = useVegaWallet();
  const { openVegaWalletDialog } = useVegaWalletDialogStore((store) => ({
    openVegaWalletDialog: store.openVegaWalletDialog,
  }));
  const { appDispatch } = useAppState();
  const { delegationsPagination } = ENV;
  const { data, loading, error } = useRewardsQuery({
    variables: {
      partyId: pubKey || '',
      delegationsPagination: {
        first: Number(delegationsPagination),
      },
    },
    skip: !pubKey,
  });
  const { params } = useNetworkParams([
    NetworkParams.reward_staking_delegation_payoutDelay,
  ]);

  const payoutDuration = React.useMemo(() => {
    if (!params) {
      return 0;
    }
    return new Duration(
      params.reward_staking_delegation_payoutDelay
    ).milliseconds();
  }, [params]);

  if (error) {
    return (
      <section>
        <p>{t('Something went wrong')}</p>
        {error && <pre>{error.message}</pre>}
      </section>
    );
  }

  if (loading || !params) {
    return (
      <Splash>
        <SplashLoader />
      </Splash>
    );
  }

  return (
    <section className="rewards">
      <Heading title={t('pageTitleRewards')} />
      <p>{t('rewardsPara1')}</p>
      <p>{t('rewardsPara2')}</p>
      {payoutDuration ? (
        <div className="my-8">
          <Callout
            title={t('rewardsCallout', {
              duration: formatDistance(new Date(0), payoutDuration),
            })}
            headingLevel={3}
            intent={Intent.Warning}
          >
            <p className="mb-0">{t('rewardsPara3')}</p>
          </Callout>
        </div>
      ) : null}
      {!loading &&
        data &&
        !error &&
        data.epoch.timestamps.start &&
        data.epoch.timestamps.expiry && (
          <section className="mb-8">
            <EpochCountdown
              // eslint-disable-next-line
              id={data!.epoch.id}
              startDate={new Date(data.epoch.timestamps.start)}
              // eslint-disable-next-line
              endDate={new Date(data.epoch.timestamps.expiry!)}
            />
          </section>
        )}
      <section>
        {pubKey && pubKeys?.length ? (
          <RewardInfo currVegaKey={pubKey} data={data} />
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
    </section>
  );
};
