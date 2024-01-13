import * as Schema from '@vegaprotocol/types';
import { ProtocolUpgradeProposalStatus } from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';
import * as faker from 'faker';
import isArray from 'lodash/isArray';
import mergeWith from 'lodash/mergeWith';

import { type PartialDeep } from 'type-fest';
import { type ProposalQuery } from '../proposal/__generated__/Proposal';
import { type ProtocolUpgradeProposalFieldsFragment } from '@vegaprotocol/proposals';

type Proposal = Extract<ProposalQuery['proposal'], { __typename?: 'Proposal' }>;

export function generateProtocolUpgradeProposal(
  override: PartialDeep<ProtocolUpgradeProposalFieldsFragment> = {}
): ProtocolUpgradeProposalFieldsFragment {
  const defaultProposal: ProtocolUpgradeProposalFieldsFragment = {
    __typename: 'ProtocolUpgradeProposal',
    upgradeBlockHeight: '3917600',
    vegaReleaseTag: 'v0.71.6',
    approvers: [
      '0ac70c4ccc7f961614fe49b93e639ddf916269b7dcf8391db264cefeadf5a6b7',
      '63a1755006642bda9ab1bfa84660f944d30a113d1609590ca90c50b24aede472',
      '68ed0770fc3e67b74d09c05443243d27e29a8513dc0e8628beb98338cd509159',
      'a6e6f7daf8610f9242ab6ab46b394f6fb79cf9533d48051ca7a2f142b8b700a8',
      'aad2be546ba83cbcab4c1d57ebe22b4a942f294f54333f1a7c2c9ef0e9fe19bb',
      'acc55c7205cfcd5480e0235acab56a01487a39dc858a641fc04df6ba016870ee',
      'b7e500deb24cc19bd6ebb2311997f0904ca0d9e51541249e9650ab41fd8ac376',
      'cf295dff6d9506e8a905d168a44dfcff2f64bd0a6671783a469f8322959c62e2',
      'f4686749895bf51c6df4092ef6be4279c384a3c380c24ea7a2fd20afc602a35d',
    ],
    status:
      ProtocolUpgradeProposalStatus.PROTOCOL_UPGRADE_PROPOSAL_STATUS_APPROVED,
  };

  return mergeWith<
    ProtocolUpgradeProposalFieldsFragment,
    PartialDeep<ProtocolUpgradeProposalFieldsFragment>
  >(defaultProposal, override, (objValue, srcValue) => {
    if (!isArray(objValue)) {
      return;
    }
    return srcValue;
  });
}

export function generateProposal(
  override: PartialDeep<
    Extract<ProposalQuery['proposal'], { __typename?: 'Proposal' }>
  > = {}
): Extract<ProposalQuery['proposal'], { __typename?: 'Proposal' }> {
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

  return mergeWith<Proposal, PartialDeep<Proposal>>(
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
  const votes = [];
  for (let i = 0; i < numberOfVotes; i++) {
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
        vestingBalancesSummary: {
          __typename: 'PartyVestingBalancesSummary',
          epoch: null,
          lockedBalances: [],
          vestingBalances: [],
        },
      },
      datetime: faker.date.past().toISOString(),
    };

    votes.push(vote);
  }

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
  const votes = [];
  for (let i = 0; i < numberOfVotes; i++) {
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
        vestingBalancesSummary: {
          __typename: 'PartyVestingBalancesSummary',
          epoch: null,
          lockedBalances: [],
          vestingBalances: [],
        },
      },
      datetime: faker.date.past().toISOString(),
    };
    votes.push(vote);
  }

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
