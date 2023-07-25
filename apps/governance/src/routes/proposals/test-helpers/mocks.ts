import { NetworkParamsDocument } from '@vegaprotocol/network-parameters';
import type { MockedResponse } from '@apollo/client/testing';
import type { NetworkParamsQuery } from '@vegaprotocol/network-parameters';
import type { PubKey } from '@vegaprotocol/wallet';
import type { VoteValue } from '@vegaprotocol/types';
import type { UserVoteQuery } from '../components/vote-details/__generated__/Vote';
import { UserVoteDocument } from '../components/vote-details/__generated__/Vote';
import faker from 'faker';

export const mockPubkey: PubKey = {
  publicKey: '0x123',
  name: 'test key 1',
};

export const mockWalletContext = {
  pubKey: mockPubkey.publicKey,
  pubKeys: [mockPubkey],
  isReadOnly: false,
  sendTx: jest.fn().mockReturnValue(Promise.resolve(null)),
  connect: jest.fn(),
  disconnect: jest.fn(),
  selectPubKey: jest.fn(),
  connector: null,
};

const mockEthereumConfig = {
  network_id: '3',
  chain_id: '3',
  confirmations: 3,
  collateral_bridge_contract: {
    address: 'bridge address',
  },
};

export const networkParamsQueryMock: MockedResponse<NetworkParamsQuery> = {
  request: {
    query: NetworkParamsDocument,
  },
  result: {
    data: {
      networkParametersConnection: {
        edges: [
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'blockchains.ethereumConfig',
              value: JSON.stringify(mockEthereumConfig),
            },
          },
        ],
      },
    },
  },
};

export const mockNetworkParams = {
  governance_proposal_asset_requiredMajority: '0.66',
  governance_proposal_freeform_requiredMajority: '0.66',
  governance_proposal_market_requiredMajority: '0.66',
  governance_proposal_updateAsset_requiredMajority: '0.66',
  governance_proposal_updateMarket_requiredMajority: '0.66',
  governance_proposal_updateMarket_requiredMajorityLP: '0.66',
  governance_proposal_updateNetParam_requiredMajority: '0.5',
};

const oneMinute = 1000 * 60;
const oneHour = oneMinute * 60;
const oneDay = oneHour * 24;
const oneWeek = oneDay * 7;
const oneMonth = oneWeek * 4;

export const fiveMinutes = new Date(oneMinute * 5);
export const fiveHours = new Date(oneHour * 5);
export const fiveDays = new Date(oneDay * 5);
export const lastWeek = new Date(-oneWeek);
export const nextWeek = new Date(oneWeek);
export const lastMonth = new Date(-oneMonth);
export const nextMonth = new Date(oneMonth);

export const createUserVoteQueryMock = (
  proposalId: string,
  value: VoteValue
): MockedResponse<UserVoteQuery> => ({
  request: {
    query: UserVoteDocument,
    variables: {
      partyId: mockPubkey.publicKey,
    },
  },
  result: {
    data: {
      party: {
        votesConnection: {
          edges: [
            {
              node: {
                proposalId,
                vote: {
                  value,
                  datetime: faker.date.past().toISOString(),
                },
              },
            },
          ],
        },
      },
    },
  },
});
