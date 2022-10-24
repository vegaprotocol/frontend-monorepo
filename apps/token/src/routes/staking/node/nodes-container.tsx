import { gql, useQuery } from '@apollo/client';
import { Callout, Intent, Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { SplashLoader } from '../../../components/splash-loader';
import type { Staking as StakingQueryResult } from './__generated__/Staking';

// TODO should only request a single node. When migrating from deprecated APIs we should address this.
export const STAKING_QUERY = gql`
  query Staking($partyId: ID!) {
    party(id: $partyId) {
      id
      stake {
        currentStakeAvailable
        currentStakeAvailableFormatted @client
      }
      delegations {
        amount
        amountFormatted @client
        epoch
        node {
          id
        }
      }
    }
    epoch {
      id
      timestamps {
        start
        end
        expiry
      }
    }
    nodes {
      id
      name
      pubkey
      infoUrl
      location
      ethereumAddress
      stakedByOperator
      stakedByDelegates
      stakedTotal
      pendingStake
      stakedByOperatorFormatted @client
      stakedByDelegatesFormatted @client
      stakedTotalFormatted @client
      pendingStakeFormatted @client
      epochData {
        total
        offline
        online
      }
      status
      rankingScore {
        rankingScore
        stakeScore
        performanceScore
        votingPower
        stakeScore
      }
    }
    nodeData {
      stakedTotal
      stakedTotalFormatted @client
      totalNodes
      inactiveNodes
      validatingNodes
      uptime
    }
  }
`;

const RPC_ERROR = 'rpc error: code = NotFound desc = NotFound error';

export const NodeContainer = ({
  children,
}: {
  children: ({ data }: { data?: StakingQueryResult }) => React.ReactElement;
}) => {
  const { t } = useTranslation();
  const { pubKey } = useVegaWallet();
  const { data, loading, error, refetch } = useQuery<StakingQueryResult>(
    STAKING_QUERY,
    {
      variables: { partyId: pubKey || '' },
    }
  );

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

  return children({ data });
};

export default NodeContainer;
