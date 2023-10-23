import merge from 'lodash/merge';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { ProposalState } from '@vegaprotocol/types';
import type { ReactNode } from 'react';
import {
  PROPOSAL_STATES_TO_TOAST,
  useProposalNotificationToasts,
} from './use-proposal-notification-toasts';
import type {
  UpdateNetworkParameterProposalFragment,
  OnUpdateNetworkParametersSubscription,
} from './__generated__/Proposal';
import { OnUpdateNetworkParametersDocument } from './__generated__/Proposal';
import { useToasts } from '@vegaprotocol/ui-toolkit';
import { waitFor, renderHook } from '@testing-library/react';

const render = (mocks?: MockedResponse[]) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );
  return renderHook(() => useProposalNotificationToasts(), { wrapper });
};

const generateUpdateNetworkParametersProposal = (
  key: string,
  value: string,
  state: ProposalState = ProposalState.STATE_OPEN
): UpdateNetworkParameterProposalFragment => ({
  __typename: 'Proposal',
  id: Math.random().toString(),
  datetime: Math.random().toString(),
  state,
  terms: {
    __typename: 'ProposalTerms',
    enactmentDatetime: '2022-12-09T14:40:38Z',
    change: {
      __typename: 'UpdateNetworkParameter',
      networkParameter: {
        __typename: 'NetworkParameter',
        key,
        value,
      },
    },
  },
});

const INITIAL = useToasts.getState();

const clear = () => {
  useToasts.setState(INITIAL);
};

describe('useProposalNotificationToasts', () => {
  beforeEach(clear);
  afterAll(clear);

  it.each(PROPOSAL_STATES_TO_TOAST)(
    'toasts for %s network param proposals',
    async (state) => {
      const mockOpenProposal: MockedResponse<OnUpdateNetworkParametersSubscription> =
        {
          request: {
            query: OnUpdateNetworkParametersDocument,
          },
          result: {
            data: {
              proposals: generateUpdateNetworkParametersProposal(
                'abc.def',
                '123.456',
                state
              ),
            },
          },
        };
      const { result } = render([mockOpenProposal]);
      expect(result.current.loading).toBe(true);
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(useToasts.getState().count).toBe(1);
      });
    }
  );

  const IGNORE_STATES = Object.keys(ProposalState).filter((state) => {
    return !PROPOSAL_STATES_TO_TOAST.includes(state as ProposalState);
  }) as ProposalState[];
  it.each(IGNORE_STATES)('does not toast for %s proposals', async (state) => {
    const mockFailedProposal: MockedResponse<OnUpdateNetworkParametersSubscription> =
      {
        request: {
          query: OnUpdateNetworkParametersDocument,
        },
        result: {
          data: {
            proposals: generateUpdateNetworkParametersProposal(
              'abc.def',
              '123.456',
              state
            ),
          },
        },
      };
    const { result } = render([mockFailedProposal]);
    expect(result.current.loading).toBe(true);
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(useToasts.getState().count).toBe(0);
    });
  });

  it('does not return toast for empty propsal', async () => {
    const error = console.error;
    console.error = () => {
      /* no op */
    };
    const mockEmptyProposal: MockedResponse<OnUpdateNetworkParametersSubscription> =
      {
        request: {
          query: OnUpdateNetworkParametersDocument,
        },
        result: {
          data: {
            proposals:
              undefined as unknown as UpdateNetworkParameterProposalFragment,
          },
        },
      };

    const { result } = render([mockEmptyProposal]);
    expect(result.current.loading).toBe(true);
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(useToasts.getState().count).toBe(0);
    });
    console.error = error;
  });

  it('does not return toast for wrong proposal type', async () => {
    const wrongProposalType = merge(
      generateUpdateNetworkParametersProposal('a', 'b'),
      {
        terms: {
          change: {
            __typename: 'NewMarket',
          },
        },
      }
    );
    const mockWrongProposalType: MockedResponse<OnUpdateNetworkParametersSubscription> =
      {
        request: {
          query: OnUpdateNetworkParametersDocument,
        },
        result: {
          data: {
            proposals: wrongProposalType,
          },
        },
      };
    const { result } = render([mockWrongProposalType]);
    expect(result.current.loading).toBe(true);
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(useToasts.getState().count).toBe(0);
    });
  });
});
