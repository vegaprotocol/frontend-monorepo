import * as faker from 'faker';
import isArray from 'lodash/isArray';
import mergeWith from 'lodash/mergeWith';

import { ProposalState, VoteValue } from '@vegaprotocol/types';
import type { DeepPartial } from '../../../lib/type-helpers';
import type {
  ProposalFields,
  ProposalFields_votes_no,
  ProposalFields_votes_yes,
} from '../__generated__/ProposalFields';

export function generateProposal(
  override: DeepPartial<ProposalFields> = {}
): ProposalFields {
  const defaultProposal: ProposalFields = {
    __typename: 'Proposal',
    id: faker.datatype.uuid(),
    reference: 'ref' + faker.datatype.uuid(),
    state: ProposalState.STATE_OPEN,
    datetime: faker.date.past().toISOString(),
    rejectionReason: null,
    errorDetails: null,
    party: {
      __typename: 'Party',
      id: faker.datatype.uuid(),
    },
    terms: {
      __typename: 'ProposalTerms',
      closingDatetime:
        !override.state || // defaults to Open
        override.state === ProposalState.STATE_OPEN ||
        override.state === ProposalState.STATE_WAITING_FOR_NODE_VOTE
          ? faker.date.soon().toISOString()
          : faker.date.past().toISOString(),
      enactmentDatetime:
        !override.state || // defaults to Open
        override.state === ProposalState.STATE_OPEN ||
        override.state === ProposalState.STATE_WAITING_FOR_NODE_VOTE
          ? faker.date.future().toISOString()
          : faker.date.past().toISOString(),
      change: {
        networkParameter: {
          key: faker.lorem.words(),
          value: faker.datatype.number({ min: 0, max: 100 }).toString(),
          __typename: 'NetworkParameter',
        },
        __typename: 'UpdateNetworkParameter',
      },
    },
    votes: {
      __typename: 'ProposalVotes',
      yes: generateYesVotes(),
      no: generateNoVotes(),
    },
  };

  return mergeWith<ProposalFields, DeepPartial<ProposalFields>>(
    defaultProposal,
    override,
    (objValue, srcValue) => {
      if (!isArray(objValue)) {
        return;
      }
      return srcValue;
    }
  );
}

export const generateYesVotes = (
  numberOfVotes = 5,
  fixedTokenValue?: number
): ProposalFields_votes_yes => {
  return {
    __typename: 'ProposalVoteSide',
    totalNumber: faker.datatype.number({ min: 0, max: 100 }).toString(),
    totalTokens: faker.datatype
      .number({ min: 1, max: 10000000000000000000000 })
      .toString(),
    votes: Array.from(Array(numberOfVotes)).map(() => {
      return {
        __typename: 'Vote',
        value: VoteValue.VALUE_YES,
        party: {
          id: faker.datatype.uuid(),
          __typename: 'Party',
          stake: {
            __typename: 'PartyStake',
            currentStakeAvailable: fixedTokenValue
              ? fixedTokenValue.toString()
              : faker.datatype
                  .number({
                    min: 1000000000000000000,
                    max: 10000000000000000000000,
                  })
                  .toString(),
          },
        },
        datetime: faker.date.past().toISOString(),
      };
    }),
  };
};

export const generateNoVotes = (
  numberOfVotes = 5,
  fixedTokenValue?: number
): ProposalFields_votes_no => {
  return {
    __typename: 'ProposalVoteSide',
    totalNumber: faker.datatype.number({ min: 0, max: 100 }).toString(),
    totalTokens: faker.datatype
      .number({ min: 1000000000000000000, max: 10000000000000000000000 })
      .toString(),
    votes: Array.from(Array(numberOfVotes)).map(() => {
      return {
        __typename: 'Vote',
        value: VoteValue.VALUE_NO,
        party: {
          id: faker.datatype.uuid(),
          __typename: 'Party',
          stake: {
            __typename: 'PartyStake',
            currentStakeAvailable: fixedTokenValue
              ? fixedTokenValue.toString()
              : faker.datatype
                  .number({
                    min: 1000000000000000000,
                    max: 10000000000000000000000,
                  })
                  .toString(),
          },
        },
        datetime: faker.date.past().toISOString(),
      };
    }),
  };
};
