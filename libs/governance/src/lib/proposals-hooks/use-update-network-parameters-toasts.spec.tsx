import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react-hooks';
import { ProposalState } from '@vegaprotocol/types';
import type { ReactNode } from 'react';
import { useUpdateNetworkParametersToasts } from './use-update-network-paramaters-toasts';
import type {
  UpdateNetworkParameterFieldsFragment,
  OnUpdateNetworkParametersSubscription,
} from './__generated__/Proposal';
import { OnUpdateNetworkParametersDocument } from './__generated__/Proposal';
import waitForNextTick from 'flush-promises';
import { useToasts } from '@vegaprotocol/ui-toolkit';

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
): UpdateNetworkParameterFieldsFragment => ({
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
    const { waitForNextUpdate } = render([mockedEvent]);
    await act(async () => {
      waitForNextUpdate();
      await waitForNextTick();
    });
    expect(useToasts.getState().count).toBe(1);
  });

  it('does not return toast for empty event', async () => {
    const { waitForNextUpdate } = render([mockedEmptyEvent]);
    await act(async () => {
      waitForNextUpdate();
      await waitForNextTick();
    });
    expect(useToasts.getState().count).toBe(0);
  });

  it('does not return toast for wrong event', async () => {
    const { waitForNextUpdate } = render([mockedWrongEvent]);
    await act(async () => {
      waitForNextUpdate();
      await waitForNextTick();
    });
    expect(useToasts.getState().count).toBe(0);
  });
});
