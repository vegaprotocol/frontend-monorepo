import * as Schema from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';
import * as faker from 'faker';
import isArray from 'lodash/isArray';
import mergeWith from 'lodash/mergeWith';

import type { PartialDeep } from 'type-fest';
import type { ProposalQuery } from '../proposal/__generated__/Proposal';

export function generateProposal(
  override: PartialDeep<ProposalQuery['proposal']> = {}
): ProposalQuery['proposal'] {
  const defaultProposal: ProposalQuery['proposal'] = {
    __typename: 'Proposal',
    id: faker.datatype.uuid(),
    rationale: {
      __typename: 'ProposalRationale',
      title: '',
      description: '',
    },
    reference: 'ref' + faker.datatype.uuid(),
    state: Schema.ProposalState.STATE_OPEN,
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
        !override?.state || // defaults to Open
        override.state === Schema.ProposalState.STATE_OPEN ||
        override.state === Schema.ProposalState.STATE_WAITING_FOR_NODE_VOTE
          ? faker.date.soon().toISOString()
          : faker.date.past().toISOString(),
      enactmentDatetime:
        !override?.state || // defaults to Open
        override.state === Schema.ProposalState.STATE_OPEN ||
        override.state === Schema.ProposalState.STATE_WAITING_FOR_NODE_VOTE
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

  return mergeWith<
    ProposalQuery['proposal'],
    PartialDeep<ProposalQuery['proposal']>
  >(defaultProposal, override, (objValue, srcValue) => {
    if (!isArray(objValue)) {
      return;
    }
    return srcValue;
  });
}

type Vote = Pick<Schema.Vote, '__typename' | 'value' | 'party' | 'datetime'>;
type Votes = Pick<
  Schema.ProposalVoteSide,
  '__typename' | 'totalNumber' | 'totalTokens' | 'totalEquityLikeShareWeight'
> & {
  votes: Vote[];
};

export const generateYesVotes = (
  numberOfVotes = 5,
  fixedTokenValue?: number,
  totalEquityLikeShareWeight?: string
): Votes => {
  const votes = Array.from(Array(numberOfVotes)).map(() => {
    const vote: Vote = {
      __typename: 'Vote',
      value: Schema.VoteValue.VALUE_YES,
      party: {
        __typename: 'Party',
        id: faker.datatype.uuid(),
        stakingSummary: {
          __typename: 'StakingSummary',
          linkings: {
            pageInfo: {
              startCursor: '00',
              endCursor: '01',
              hasPreviousPage: false,
              hasNextPage: false,
            },
          },
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

    return vote;
  });
  return {
    __typename: 'ProposalVoteSide',
    totalNumber: votes.length.toString(),
    totalTokens: votes
      .reduce((acc, cur) => {
        return acc.plus(cur.party.stakingSummary.currentStakeAvailable);
      }, new BigNumber(0))
      .toString(),
    votes,
    totalEquityLikeShareWeight: totalEquityLikeShareWeight || '0',
  };
};

export const generateNoVotes = (
  numberOfVotes = 5,
  fixedTokenValue?: number,
  totalEquityLikeShareWeight?: string
): Votes => {
  const votes = Array.from(Array(numberOfVotes)).map(() => {
    const vote: Vote = {
      __typename: 'Vote',
      value: Schema.VoteValue.VALUE_NO,
      party: {
        id: faker.datatype.uuid(),
        __typename: 'Party',
        stakingSummary: {
          __typename: 'StakingSummary',
          linkings: {
            pageInfo: {
              startCursor: '00',
              endCursor: '01',
              hasPreviousPage: false,
              hasNextPage: false,
            },
          },
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
    return vote;
  });
  return {
    __typename: 'ProposalVoteSide',
    totalNumber: votes.length.toString(),
    totalTokens: votes
      .reduce((acc, cur) => {
        return acc.plus(cur.party.stakingSummary.currentStakeAvailable);
      }, new BigNumber(0))
      .toString(),
    votes,
    totalEquityLikeShareWeight: totalEquityLikeShareWeight || '0',
  };
};
