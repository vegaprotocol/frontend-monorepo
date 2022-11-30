import { Callout, Intent, Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useStakingQuery } from './__generated___/Staking';
import { SplashLoader } from '../../../components/splash-loader';
import { usePreviousEpochQuery } from '../__generated___/PreviousEpoch';
import type { StakingQuery } from './__generated___/Staking';
import type { PreviousEpochQuery } from '../__generated___/PreviousEpoch';

// TODO should only request a single node. When migrating from deprecated APIs we should address this.

const RPC_ERROR = 'rpc error: code = NotFound desc = NotFound error';

export const NodeContainer = ({
  children,
}: {
  children: ({
    data,
    previousEpochData,
  }: {
    data?: StakingQuery;
    previousEpochData?: PreviousEpochQuery;
  }) => React.ReactElement;
}) => {
  const { t } = useTranslation();
  const { pubKey } = useVegaWallet();
  const { data, loading, error, refetch } = useStakingQuery({
    variables: { partyId: pubKey || '' },
  });
  const { data: previousEpochData } = usePreviousEpochQuery({
    variables: {
      epochId: (Number(data?.epoch.id) - 1).toString(),
    },
    skip: !data?.epoch.id,
  });

  // @todo - this epoch querying needs to be hoisted as the validator tables rely
  // on it too
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!data?.epoch.timestamps.expiry) return;
      const now = Date.now();
      const expiry = new Date(data.epoch.timestamps.expiry).getTime();

      if (now > expiry) {
        refetch();
        clearInterval(interval);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [data?.epoch.timestamps.expiry, refetch]);

  if (error) {
    return (
      <Callout intent={Intent.Danger} title={t('Something went wrong')}>
        <pre>
          {error.message.includes(RPC_ERROR)
            ? t('resourceNotFound')
            : error.message}
        </pre>
      </Callout>
    );
  }

  if (loading) {
    return (
      <Splash>
        <SplashLoader />
      </Splash>
    );
  }

  return children({ data, previousEpochData });
};

export default NodeContainer;
