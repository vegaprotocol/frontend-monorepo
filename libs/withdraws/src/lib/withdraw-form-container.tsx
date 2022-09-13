import compact from 'lodash/compact';
import { gql, useQuery } from '@apollo/client';
import { t } from '@vegaprotocol/react-helpers';
import { useMemo } from 'react';
import type { WithdrawalArgs } from './use-create-withdraw';
import { WithdrawManager } from './withdraw-manager';
import type { WithdrawFormQuery } from './__generated__/WithdrawFormQuery';
import { AssetStatus } from '@vegaprotocol/types';

export const ASSET_FRAGMENT = gql`
  fragment AssetFields on Asset {
    id
    symbol
    name
    decimals
    status
    source {
      ... on ERC20 {
        contractAddress
      }
    }
  }
`;

const WITHDRAW_FORM_QUERY = gql`
  ${ASSET_FRAGMENT}
  query WithdrawFormQuery($partyId: ID!) {
    party(id: $partyId) {
      id
      withdrawals {
        id
        txHash
      }
      accounts {
        type
        balance
        asset {
          id
          symbol
        }
      }
    }
    assetsConnection {
      edges {
        node {
          ...AssetFields
        }
      }
    }
  }
`;

interface WithdrawFormContainerProps {
  partyId?: string;
  submit: (args: WithdrawalArgs) => void;
}

export const WithdrawFormContainer = ({
  partyId,
  submit,
}: WithdrawFormContainerProps) => {
  const { data, loading, error } = useQuery<WithdrawFormQuery>(
    WITHDRAW_FORM_QUERY,
    {
      variables: { partyId },
    }
  );

  const assets = useMemo(() => {
    if (!data?.assetsConnection?.edges) {
      return [];
    }

    return compact(data.assetsConnection.edges)
      .map((e) => e.node)
      .filter((a) => a.status === AssetStatus.STATUS_ENABLED);
  }, [data]);

  if (loading || !data) {
    return <div>{t('Loading...')}</div>;
  }

  if (error) {
    return <div>{t('Something went wrong')}</div>;
  }

  return (
    <WithdrawManager
      assets={assets}
      accounts={data.party?.accounts || []}
      submit={submit}
    />
  );
};
