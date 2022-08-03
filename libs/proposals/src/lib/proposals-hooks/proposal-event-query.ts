import { gql } from '@apollo/client';

export const PROPOSAL_EVENT_SUB = gql`
  subscription ProposalEvent($partyId: ID!) {
    busEvents(partyId: $partyId, batchSize: 0, types: [Proposal]) {
      type
      event {
        ... on Proposal {
          id
          reference
          state
          rejectionReason
          errorDetails
        }
      }
    }
  }
`;
