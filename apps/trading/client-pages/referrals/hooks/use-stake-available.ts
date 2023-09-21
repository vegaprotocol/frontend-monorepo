import { gql, useQuery } from '@apollo/client';
import { useVegaWallet } from '@vegaprotocol/wallet';

const STAKE_QUERY = gql`
  query CreateCode($partyId: ID!) {
    party(id: $partyId) {
      stakingSummary {
        currentStakeAvailable
      }
    }
    networkParameter(key: "referralProgram.minStakedVegaTokens") {
      value
    }
  }
`;

export const useStakeAvailable = () => {
  const { pubKey } = useVegaWallet();
  const { data } = useQuery(STAKE_QUERY, {
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
    // TODO: remove when network params available
    errorPolicy: 'ignore',
  });

  return {
    stakeAvailable: data
      ? BigInt(data.party?.stakingSummary.currentStakeAvailable || '0')
      : undefined,
    requiredStake: data
      ? BigInt(data.networkParameter?.value || '0')
      : undefined,
  };
};
