import { gql } from 'graphql-request';
import { requestGQL } from './request';

export async function getPartyStake(partyId: string) {
  const query = gql`
    {
      party(id:"${partyId}") {
        stakingSummary {
          currentStakeAvailable
        }
      }
    }
  `;

  const res = await requestGQL<{
    party: {
      stakingSummary: {
        currentStakeAvailable: string;
      };
    };
  }>(query);

  return res;
}
