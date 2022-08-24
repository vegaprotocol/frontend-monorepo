import { gql, useQuery } from '@apollo/client';
import { WithdrawManager } from './withdraw-manager';

export const ASSET_FRAGMENT = gql`
  fragment AssetFields on Asset {
    id
    symbol
    name
    decimals
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
    assets {
      ...AssetFields
    }
  }
`;

export const WithdrawFormContainer = ({ partyId }: { partyId?: string }) => {
  const { data, loading, error } = useQuery(WITHDRAW_FORM_QUERY, {
    variables: { partyId },
  });

  if (loading || !data) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Something went wrong</div>;
  }

  return (
    <WithdrawManager
      assets={data.assets}
      accounts={data.party?.accounts || []}
    />
  );
};
