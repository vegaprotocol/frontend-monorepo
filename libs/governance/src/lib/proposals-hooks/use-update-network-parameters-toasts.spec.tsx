import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react-hooks';
import { ProposalState } from '@vegaprotocol/types';
import type { ReactNode } from 'react';
import { useUpdateNetworkParametersToasts } from './use-update-network-paramaters-toasts';
import type {
  UpdateNetworkParameterProposalFragment,
  OnUpdateNetworkParametersSubscription,
} from './__generated__/Proposal';
import { OnUpdateNetworkParametersDocument } from './__generated__/Proposal';
import { useToasts } from '@vegaprotocol/ui-toolkit';
import { waitFor } from '@testing-library/react';

const render = (mocks?: MockedResponse[]) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );
  return renderHook(() => useUpdateNetworkParametersToasts(), { wrapper });
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

const mockedWrongEvent: MockedResponse<OnUpdateNetworkParametersSubscription> =
  {
    request: {
      query: OnUpdateNetworkParametersDocument,
    },
    result: {
      data: {
        __typename: 'Subscription',
        busEvents: [
          {
            __typename: 'BusEvent',
            event: {
              __typename: 'Asset',
            },
          },
        ],
      },
    },
  };

const mockedEmptyEvent: MockedResponse<OnUpdateNetworkParametersSubscription> =
  {
    request: {
      query: OnUpdateNetworkParametersDocument,
    },
    result: {
      data: {
        __typename: 'Subscription',
        busEvents: [],
      },
    },
  };

const mockedEvent: MockedResponse<OnUpdateNetworkParametersSubscription> = {
  request: {
    query: OnUpdateNetworkParametersDocument,
  },
  result: {
    data: {
      __typename: 'Subscription',
      busEvents: [
        {
          __typename: 'BusEvent',
          event: generateUpdateNetworkParametersProposal('abc.def', '123.456'),
        },
      ],
    },
  },
};

const INITIAL = useToasts.getState();

const clear = () => {
  useToasts.setState(INITIAL);
};

describe('useUpdateNetworkParametersToasts', () => {
  beforeEach(clear);
  afterAll(clear);

  it('returns toast for update network parameters bus event', async () => {
    render([mockedEvent]);
    await waitFor(() => {
      expect(useToasts.getState().count).toBe(1);
    });
  });

  it('does not return toast for empty event', async () => {
    render([mockedEmptyEvent]);
    await waitFor(() => {
      expect(useToasts.getState().count).toBe(0);
    });
  });

  it('does not return toast for wrong event', async () => {
    render([mockedWrongEvent]);
    await waitFor(() => {
      expect(useToasts.getState().count).toBe(0);
    });
  });
});
