import { gql } from 'graphql-request';
import { requestGQL } from './request';

export async function getProposal(id: string) {
  const query = gql`
    {
      proposal(id: "${id}") {
        id
        state
      }
    }
  `;

  const res = await requestGQL<{
    proposal: {
      id: string;
      state: string;
    };
  }>(query);

  return res;
}
