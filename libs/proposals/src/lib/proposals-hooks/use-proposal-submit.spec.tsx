import { act, renderHook } from '@testing-library/react-hooks';
import type {
  VegaKeyExtended,
  VegaWalletContextShape,
} from '@vegaprotocol/wallet';
import { VegaTxStatus, VegaWalletContext } from '@vegaprotocol/wallet';
import {
  VegaWalletOrderSide,
  VegaWalletOrderTimeInForce,
  VegaWalletOrderType,
} from '@vegaprotocol/wallet';
import type { ReactNode } from 'react';
import { useProposalSubmit } from './use-proposal-submit';
import type {
  ProposalEvent,
  ProposalEvent_busEvents,
} from './__generated__/ProposalEvent';
import { PROPOSAL_EVENT_SUB } from './proposal-event-query';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { toNanoSeconds } from '@vegaprotocol/react-helpers';

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(0);
});

afterEach(() => {
  jest.useRealTimers();
});

const defaultProposal = {
  rationale: {
    description: 'Update governance.proposal.freeform.minVoterBalance',
  },
  terms: {
    updateNetworkParameter: {
      changes: {
        key: 'governance.proposal.freeform.minVoterBalance',
        value: '300',
      },
    },
    closingTimestamp: 1657721401,
    enactmentTimestamp: 1657807801,
  },
};

const defaultWalletContext = {
  keypair: null,
  keypairs: [],
  sendTx: jest.fn().mockReturnValue(Promise.resolve(null)),
  connect: jest.fn(),
  disconnect: jest.fn(),
  selectPublicKey: jest.fn(),
  connector: null,
};

function setup(
  context?: Partial<VegaWalletContextShape>,
  proposal = defaultProposal
) {
  const mocks: MockedResponse<ProposalEvent> = {
    request: {
      query: PROPOSAL_EVENT_SUB,
      variables: {
        partyId: context?.keypair?.pub || '',
      },
    },
    result: {
      data: {
        busEvents: [
          {
            type: 'Order',
            event: {
              type: 'Limit',
              id: '9c70716f6c3698ac7bbcddc97176025b985a6bb9a0c4507ec09c9960b3216b62',
              status: 'Active',
              rejectionReason: null,
              createdAt: '2022-07-05T14:25:47.815283706Z',
              size: '10',
              price: '300000',
              timeInForce: 'GTC',
              side: 'Buy',
              market: {
                name: 'UNIDAI Monthly (30 Jun 2022)',
                decimalPlaces: 5,
                __typename: 'Market',
              },
              __typename: 'Order',
            },
            __typename: 'BusEvent',
          } as ProposalEvent_busEvents,
        ],
      },
    },
  };
  const filterMocks: MockedResponse<ProposalEvent> = {
    request: {
      query: PROPOSAL_EVENT_SUB,
      variables: {
        partyId: context?.keypair?.pub || '',
      },
    },
    result: {
      data: {
        busEvents: [
          {
            type: 'Order',
            event: {
              type: 'Limit',
              id: '9c70716f6c3698ac7bbcddc97176025b985a6bb9a0c4507ec09c9960b3216b62',
              status: 'Active',
              rejectionReason: null,
              createdAt: '2022-07-05T14:25:47.815283706Z',
              size: '10',
              price: '300000',
              timeInForce: 'GTC',
              side: 'Buy',
              market: {
                name: 'UNIDAI Monthly (30 Jun 2022)',
                decimalPlaces: 5,
                __typename: 'Market',
              },
              __typename: 'Order',
            },
            __typename: 'BusEvent',
          } as ProposalEvent_busEvents,
        ],
      },
    },
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={[mocks, filterMocks]}>
      <VegaWalletContext.Provider
        value={{ ...defaultWalletContext, ...context }}
      >
        {children}
      </VegaWalletContext.Provider>
    </MockedProvider>
  );
  return renderHook(() => useProposalSubmit(proposal), { wrapper });
}

describe('useProposalSubmit', () => {
  // it('should submit a correctly formatted proposal', async () => {
  //   const mockSendTx = jest.fn().mockReturnValue(Promise.resolve({}));
  //   const keypair = {
  //     pub: '0x123',
  //   } as VegaKeyExtended;
  //   const { result } = setup({
  //     sendTx: mockSendTx,
  //     keypairs: [keypair],
  //     keypair,
  //   });
  //
  //   const order = {
  //     type: VegaWalletOrderType.Limit,
  //     size: '10',
  //     timeInForce: VegaWalletOrderTimeInForce.GTT,
  //     side: VegaWalletOrderSide.Buy,
  //     price: '1234567.89',
  //     expiration: new Date('2022-01-01'),
  //   };
  //   await act(async () => {
  //     result.current.submit();
  //   });
  //
  //   expect(mockSendTx).toHaveBeenCalledWith({
  //     pubKey: keypair.pub,
  //     propagate: true,
  //     orderSubmission: {
  //       type: VegaWalletOrderType.Limit,
  //       marketId: defaultMarket.id, // Market provided from hook argument
  //       size: '100', // size adjusted based on positionDecimalPlaces
  //       side: VegaWalletOrderSide.Buy,
  //       timeInForce: VegaWalletOrderTimeInForce.GTT,
  //       price: '123456789', // Decimal removed
  //       expiresAt: order.expiration
  //         ? toNanoSeconds(order.expiration)
  //         : undefined,
  //     },
  //   });
  // });

  it('has the correct default state', () => {
    const { result } = setup();
    expect(typeof result.current.submit).toEqual('function');
    expect(typeof result.current.reset).toEqual('function');
    expect(result.current.transaction.status).toEqual(VegaTxStatus.Default);
    expect(result.current.transaction.txHash).toEqual(null);
    expect(result.current.transaction.error).toEqual(null);
  });

  // it('should not sendTx if no keypair', async () => {
  //   const mockSendTx = jest.fn();
  //   const { result } = setup({
  //     sendTx: mockSendTx,
  //     keypairs: [],
  //     keypair: null,
  //   });
  //   await act(async () => {
  //     result.current.submit({} as Order);
  //   });
  //   expect(mockSendTx).not.toHaveBeenCalled();
  // });
});
