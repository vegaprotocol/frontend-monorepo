import * as faker from "faker";
import merge from "lodash/merge";

import { ProposalState, VoteValue } from "../../../__generated__/globalTypes";
import { DeepPartial } from "../../../lib/type-helpers";
import {
  ProposalFields,
  ProposalFields_votes_no,
  ProposalFields_votes_yes,
} from "../__generated__/ProposalFields";

export function generateProposal(
  override: DeepPartial<ProposalFields> = {}
): ProposalFields {
  const defaultProposal: ProposalFields = {
    __typename: "Proposal",
    id: faker.datatype.uuid(),
    reference: "ref" + faker.datatype.uuid(),
    state: ProposalState.Open,
    datetime: faker.date.past().toISOString(),
    rejectionReason: null,
    errorDetails: null,
    party: {
      __typename: "Party",
      id: faker.datatype.uuid(),
    },
    terms: {
      __typename: "ProposalTerms",
      closingDatetime:
        !override.state || // defaults to Open
        override.state === ProposalState.Open ||
        override.state === ProposalState.WaitingForNodeVote
          ? faker.date.soon().toISOString()
          : faker.date.past().toISOString(),
      enactmentDatetime:
        !override.state || // defaults to Open
        override.state === ProposalState.Open ||
        override.state === ProposalState.WaitingForNodeVote
          ? faker.date.future().toISOString()
          : faker.date.past().toISOString(),
      change: {
        networkParameter: {
          key: faker.lorem.words(),
          value: faker.datatype.number({ min: 0, max: 100 }).toString(),
          __typename: "NetworkParameter",
        },
        __typename: "UpdateNetworkParameter",
      },
    },
    votes: {
      __typename: "ProposalVotes",
      yes: generateYesVotes(),
      no: generateNoVotes(),
    },
  };

  return merge<ProposalFields, DeepPartial<ProposalFields>>(
    defaultProposal,
    override
  );
}

export const generateYesVotes = (
  numberOfVotes = 5
): ProposalFields_votes_yes => {
  return {
    __typename: "ProposalVoteSide",
    totalNumber: faker.datatype.number({ min: 0, max: 100 }).toString(),
    totalTokens: faker.datatype.number({ min: 1, max: 10000 }).toString(),
    votes: Array.from(Array(numberOfVotes)).map(() => {
      return {
        __typename: "Vote",
        value: VoteValue.Yes,
        party: {
          id: faker.datatype.uuid(),
          __typename: "Party",
          stake: {
            __typename: "PartyStake",
            currentStakeAvailable: faker.datatype
              .number({
                min: 1,
                max: 10000,
              })
              .toString(),
          },
        },
        datetime: faker.date.past().toISOString(),
      };
    }),
  };
};

export const generateNoVotes = (numberOfVotes = 5): ProposalFields_votes_no => {
  return {
    __typename: "ProposalVoteSide",
    totalNumber: faker.datatype.number({ min: 0, max: 100 }).toString(),
    totalTokens: faker.datatype.number({ min: 1, max: 10000 }).toString(),
    votes: Array.from(Array(numberOfVotes)).map(() => {
      return {
        __typename: "Vote",
        value: VoteValue.No,
        party: {
          id: faker.datatype.uuid(),
          __typename: "Party",
          stake: {
            __typename: "PartyStake",
            currentStakeAvailable: faker.datatype
              .number({
                min: 1,
                max: 10000,
              })
              .toString(),
          },
        },
        datetime: faker.date.past().toISOString(),
      };
    }),
  };
};
