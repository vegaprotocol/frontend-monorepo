import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { addDays } from "date-fns";
import * as faker from "faker";
import React from "react";

import {
  NodeStatus,
  ProposalState,
  VoteValue,
} from "../../../__generated__/globalTypes";
import { NetworkParams } from "../../../hooks/__generated__/NetworkParams";
import { NETWORK_PARAMS_QUERY } from "../../../hooks/use-network-param";
import { PROPOSAL_QUERY } from "../../../routes/governance/proposal";
import { Proposal } from "../../../routes/governance/proposal/__generated__/Proposal";
import { PROPOSALS_QUERY } from "../../../routes/governance/proposals";
import { Proposals } from "../../../routes/governance/proposals/__generated__/Proposals";
import {
  generateNoVotes,
  generateProposal,
  generateYesVotes,
} from "../../../routes/governance/test-helpers/generate-proposals";
import { REWARDS_QUERY } from "../../../routes/rewards/home";
import { Rewards } from "../../../routes/rewards/home/__generated__/Rewards";
import { Nodes } from "../../../routes/staking/__generated__/Nodes";
import { PartyDelegations } from "../../../routes/staking/__generated__/PartyDelegations";
import {
  Staking,
  Staking_nodeData,
  Staking_nodes,
} from "../../../routes/staking/__generated__/Staking";
import { NODES_QUERY } from "../../../routes/staking/node-list";
import { PARTY_DELEGATIONS_QUERY } from "../../../routes/staking/staking-form";
import { STAKING_QUERY } from "../../../routes/staking/staking-nodes-container";

const PARTY_ID = "pub";
const REWARD_ASSET_ID = "reward-asset-id";

const nodes: Staking_nodes[] = [
  {
    __typename: "Node",
    name: "node-1-name",
    id: "node-id-1",
    pubkey: "pubkey",
    infoUrl: "",
    location: "",
    ethereumAdddress: "",
    stakedByOperator: "100",
    stakedByDelegates: "100",
    stakedTotal: "200",
    pendingStake: "100",
    stakedByOperatorFormatted: "100",
    stakedByDelegatesFormatted: "100",
    stakedTotalFormatted: "200",
    pendingStakeFormatted: "100",
    epochData: {
      __typename: "EpochData",
      total: 6,
      offline: 1,
      online: 5,
    },
    status: NodeStatus.NonValidator,
  },
  {
    __typename: "Node",
    name: "node-2-name",
    id: "node-id-2",
    pubkey: "pubkey",
    infoUrl: "",
    location: "",
    ethereumAdddress: "",
    stakedByOperator: "100",
    stakedByDelegates: "100",
    stakedTotal: "200",
    pendingStake: "100",
    stakedByOperatorFormatted: "100",
    stakedByDelegatesFormatted: "100",
    stakedTotalFormatted: "200",
    pendingStakeFormatted: "100",
    epochData: {
      __typename: "EpochData",
      total: 6,
      offline: 1,
      online: 5,
    },
    status: NodeStatus.Validator,
  },
];

const nodeData: Staking_nodeData = {
  __typename: "NodeData",
  stakedTotal: "500",
  stakedTotalFormatted: "500",
  totalNodes: 5,
  inactiveNodes: 3,
  validatingNodes: 1,
  uptime: 1234567687,
};

const MOCK_STAKING_QUERY: MockedResponse<Staking> = {
  request: {
    query: STAKING_QUERY,
    variables: { partyId: PARTY_ID },
  },
  result: {
    data: {
      epoch: {
        __typename: "Epoch",
        id: "1",
        timestamps: {
          __typename: "EpochTimestamps",
          start: new Date().toISOString(),
          end: addDays(new Date(), 1).toISOString(),
          expiry: addDays(new Date(), 1).toISOString(),
        },
      },
      party: {
        __typename: "Party",
        stake: {
          __typename: "PartyStake",
          currentStakeAvailable: "0.00000000000001",
          currentStakeAvailableFormatted: "0.00000000000001",
        },
        id: PARTY_ID,
        delegations: [
          {
            __typename: "Delegation",
            amount: "100",
            amountFormatted: "100",
            node: nodes[0],
            epoch: 1,
          },
        ],
      },
      nodes,
      nodeData,
    },
  },
};

const MOCK_PARTY_DELEGATIONS: MockedResponse<PartyDelegations> = {
  request: {
    query: PARTY_DELEGATIONS_QUERY,
    variables: { partyId: PARTY_ID },
  },
  result: {
    data: {
      epoch: {
        __typename: "Epoch",
        id: "1",
      },
      party: {
        __typename: "Party",
        id: PARTY_ID,
        delegations: [
          {
            __typename: "Delegation",
            amount: "100",
            amountFormatted: "100",
            epoch: 1,
            node: {
              __typename: "Node",
              id: "node-id-1",
            },
          },
        ],
      },
    },
  },
};

const proposalNotVoted = generateProposal({
  terms: { change: { networkParameter: { key: "not.voted" } } },
  state: ProposalState.Open,
  party: { id: "123" },
  votes: {
    yes: { votes: null },
    no: { votes: null },
  },
});

const proposalNoTokens = generateProposal({
  terms: { change: { networkParameter: { key: "no.tokens" } } },
});

const proposalVotedAgainst = generateProposal({
  terms: { change: { networkParameter: { key: "voted.against" } } },
  party: { id: "123" },
  votes: {
    no: {
      votes: [
        {
          value: VoteValue.No,
          party: {
            id: "0680ffba6c2e0239ebaa2b941ee79675dd1f447ddcae37720f8f377101f46527",
            stake: {
              __typename: "PartyStake",
              currentStakeAvailable: "123",
            },
          },
          datetime: faker.date.past().toISOString(),
        },
      ],
    },
  },
});

const proposalDidNotVote = generateProposal({
  terms: { change: { networkParameter: { key: "voted.closed.did.not.vote" } } },
  state: ProposalState.Enacted,
  party: { id: "123" },
});

const propsoalVoteClosedVotedFor = generateProposal({
  terms: { change: { networkParameter: { key: "voted.closed.voted.for" } } },
  state: ProposalState.Enacted,
  party: { id: "123" },
  votes: {
    yes: {
      votes: [
        {
          value: VoteValue.Yes,
          party: {
            __typename: "Party",
            id: "0680ffba6c2e0239ebaa2b941ee79675dd1f447ddcae37720f8f377101f46527",
            stake: {
              __typename: "PartyStake",
              currentStakeAvailable: "12345678",
            },
          },
          datetime: faker.date.past().toISOString(),
          __typename: "Vote",
        },
      ],
    },
  },
});

const proposalDeclined = generateProposal({
  state: ProposalState.Rejected,
  votes: {
    __typename: "ProposalVotes",
    yes: generateYesVotes(50),
    no: generateNoVotes(100),
  },
});

const proposalPassed = generateProposal({
  state: ProposalState.Passed,
  votes: {
    __typename: "ProposalVotes",
    yes: generateYesVotes(250),
    no: generateNoVotes(100),
  },
});

const proposalRejected = generateProposal({
  state: ProposalState.Rejected,
});

const proposalRejectedNoVotes = generateProposal({
  state: ProposalState.Rejected,
  votes: {
    __typename: "ProposalVotes",
    yes: generateYesVotes(50),
    no: generateNoVotes(100),
  },
});

const proposalWaitingForNodeVote = generateProposal({
  state: ProposalState.WaitingForNodeVote,
});

const proposalYesVotesOnly = generateProposal({
  state: ProposalState.Open,
  votes: {
    __typename: "ProposalVotes",
    yes: generateYesVotes(100),
    no: {
      totalTokens: "0",
      totalNumber: "0",
      __typename: "ProposalVoteSide",
      votes: null,
    },
  },
});

const proposalNoVotesOnly = generateProposal({
  state: ProposalState.Open,
  votes: {
    __typename: "ProposalVotes",
    yes: {
      totalTokens: "0",
      totalNumber: "0",
      __typename: "ProposalVoteSide",
      votes: null,
    },
    no: generateNoVotes(100),
  },
});

const proposaSameYesNoVotes = generateProposal({
  state: ProposalState.Open,
  votes: {
    __typename: "ProposalVotes",
    yes: generateYesVotes(100),
    no: generateNoVotes(100),
  },
});

const proposaYesVotesWillWin = generateProposal({
  state: ProposalState.Open,
  votes: {
    __typename: "ProposalVotes",
    yes: generateYesVotes(100),
    no: generateNoVotes(50),
  },
});

const proposaNoVotesWillWin = generateProposal({
  state: ProposalState.Open,
  votes: {
    __typename: "ProposalVotes",
    yes: generateYesVotes(50),
    no: generateNoVotes(100),
  },
});

const proposaNotEnoughVotes = generateProposal({
  state: ProposalState.Declined,
  votes: {
    __typename: "ProposalVotes",
    yes: {
      totalTokens: "0",
      totalNumber: "0",
      __typename: "ProposalVoteSide",
      votes: null,
    },
    no: {
      totalTokens: "0",
      totalNumber: "0",
      __typename: "ProposalVoteSide",
      votes: null,
    },
  },
});

const MOCK_PROPOSALS: MockedResponse<Proposals> = {
  request: {
    query: PROPOSALS_QUERY,
  },
  result: {
    data: {
      proposals: [
        proposaNotEnoughVotes,
        proposaNoVotesWillWin,
        proposaYesVotesWillWin,
        proposaSameYesNoVotes,
        proposalNoVotesOnly,
        proposalYesVotesOnly,
        proposalWaitingForNodeVote,
        proposalRejectedNoVotes,
        proposalRejected,
        proposalPassed,
        proposalDeclined,
        proposalNotVoted,
        proposalNoTokens,
        proposalVotedAgainst,
        proposalDidNotVote,
        propsoalVoteClosedVotedFor,
      ],
    },
  },
};

const MOCK_PROPOSAL: MockedResponse<Proposal>[] = [
  proposaNotEnoughVotes,
  proposaNoVotesWillWin,
  proposaYesVotesWillWin,
  proposaSameYesNoVotes,
  proposalNoVotesOnly,
  proposalYesVotesOnly,
  proposalWaitingForNodeVote,
  proposalRejectedNoVotes,
  proposalRejected,
  proposalPassed,
  proposalDeclined,
  proposalNotVoted,
  proposalNoTokens,
  proposalVotedAgainst,
  proposalDidNotVote,
  propsoalVoteClosedVotedFor,
].map((p) => ({
  request: {
    query: PROPOSAL_QUERY,
    variables: {
      proposalId: p.id,
    },
  },
  result: {
    data: {
      proposal: p,
    },
  },
}));

const MOCK_REWARDS: MockedResponse<Rewards> = {
  request: {
    query: REWARDS_QUERY,
    variables: {
      partyId:
        // TODO: Figure out a better way to sync up vega key with party id for mocking
        "3d019f95a79e8aa82f2f9915bafac816100d40297cb432970772878f6e3ee92d",
    },
  },
  result: {
    data: {
      party: {
        __typename: "Party",
        // TODO: Figure out a better way to sync up vega key with party id for mocking
        id: "3d019f95a79e8aa82f2f9915bafac816100d40297cb432970772878f6e3ee92d",
        rewardDetails: [
          {
            __typename: "RewardPerAssetDetail",
            asset: {
              __typename: "Asset",
              id: REWARD_ASSET_ID,
              symbol: "asset-symbol",
            },
            rewards: [
              {
                __typename: "Reward",
                asset: {
                  __typename: "Asset",
                  id: REWARD_ASSET_ID,
                },
                party: {
                  __typename: "Party",
                  id: "3d019f95a79e8aa82f2f9915bafac816100d40297cb432970772878f6e3ee92d",
                },
                epoch: { __typename: "Epoch", id: "1" },
                amount: "100",
                amountFormatted: "100.00",
                percentageOfTotal: "50",
                receivedAt: "2020-01-01T00:00:00",
              },
              {
                __typename: "Reward",
                asset: {
                  __typename: "Asset",
                  id: REWARD_ASSET_ID,
                },
                party: {
                  __typename: "Party",
                  id: "3d019f95a79e8aa82f2f9915bafac816100d40297cb432970772878f6e3ee92d",
                },
                epoch: { __typename: "Epoch", id: "3" },
                amount: "110",
                amountFormatted: "110.00",
                percentageOfTotal: "50",
                receivedAt: "2020-01-01T00:00:00",
              },
              {
                __typename: "Reward",
                asset: {
                  __typename: "Asset",
                  id: REWARD_ASSET_ID,
                },
                party: {
                  __typename: "Party",
                  id: "3d019f95a79e8aa82f2f9915bafac816100d40297cb432970772878f6e3ee92d",
                },
                epoch: { __typename: "Epoch", id: "2" },
                amount: "120",
                amountFormatted: "120.00",
                percentageOfTotal: "50",
                receivedAt: "2020-01-01T00:00:00",
              },
            ],
            totalAmount: "130",
            totalAmountFormatted: "130.00",
          },
        ],
        delegations: [
          {
            __typename: "Delegation",
            amount: "100",
            amountFormatted: "100.00",
            epoch: 1,
          },
        ],
      },
      epoch: {
        __typename: "Epoch",
        id: "1",
        timestamps: {
          __typename: "EpochTimestamps",
          start: "2020-01-01T00:00:00",
          end: "2020-01-01T00:00:00",
          expiry: "2020-01-01T00:00:00",
        },
      },
    },
  },
};

const MOCK_NETWORK_PARAMS: MockedResponse<NetworkParams> = {
  request: {
    query: NETWORK_PARAMS_QUERY,
  },
  result: {
    data: {
      networkParameters: [
        {
          __typename: "NetworkParameter",
          key: "reward.asset",
          value: "reward-asset-id",
        },
      ],
    },
  },
};

const MOCK_NODES_QUERY: MockedResponse<Nodes> = {
  request: {
    query: NODES_QUERY,
  },
  result: {
    data: {
      nodes,
      nodeData,
    },
  },
};

export const GraphQlProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <MockedProvider
      mocks={[
        MOCK_PROPOSALS,
        MOCK_PROPOSALS,
        MOCK_PROPOSALS,
        MOCK_PROPOSALS,
        MOCK_PROPOSALS,
        MOCK_PROPOSALS,
        MOCK_PROPOSALS,
        MOCK_PROPOSALS,
        ...MOCK_PROPOSAL,
        ...MOCK_PROPOSAL,
        ...MOCK_PROPOSAL,
        ...MOCK_PROPOSAL,
        ...MOCK_PROPOSAL,
        ...MOCK_PROPOSAL,
        ...MOCK_PROPOSAL,
        ...MOCK_PROPOSAL,
        ...MOCK_PROPOSAL,
        ...MOCK_PROPOSAL,
        ...MOCK_PROPOSAL,
        ...MOCK_PROPOSAL,
        MOCK_STAKING_QUERY,
        MOCK_PARTY_DELEGATIONS,
        MOCK_NODES_QUERY,
        MOCK_REWARDS,
        MOCK_NETWORK_PARAMS,
      ]}
    >
      {children}
    </MockedProvider>
  );
};
