import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type { ProposalRejectionReason } from '@vegaprotocol/types';
import {
  ProposalChangeMapping,
  ProposalState,
  ProposalStateMapping,
} from '@vegaprotocol/types';
import type { ReactNode } from 'react';
import {
  PROPOSAL_STATES_TO_TOAST,
  ProposalToastContent,
  useProposalToasts,
} from './use-proposal-toasts';
import { useToasts } from '@vegaprotocol/ui-toolkit';
import { waitFor, renderHook, render } from '@testing-library/react';
import {
  OnProposalDocument,
  type OnProposalFragmentFragment,
  type OnProposalSubscription,
} from './__generated__/Proposal';
import sample from 'lodash/sample';

const renderUseProposalToasts = (mocks?: MockedResponse[]) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );
  return renderHook(() => useProposalToasts(), { wrapper });
};

type ProposalChange = OnProposalFragmentFragment['terms']['change'];

const NEW_MARKET_CHANGE: ProposalChange = { __typename: 'NewMarket' };
const UPDATE_MARKET_CHANGE: ProposalChange = { __typename: 'UpdateMarket' };
const UPDATE_NETWORK_PARAMETER_CHANGE: ProposalChange = {
  __typename: 'UpdateNetworkParameter',
  networkParameter: {
    __typename: 'NetworkParameter',
    key: 'abc.def',
    value: '123',
  },
};
const NEW_ASSET_CHANGE: ProposalChange = { __typename: 'NewAsset' };
const UPDATE_ASSET_CHANGE: ProposalChange = { __typename: 'UpdateAsset' };
const NEW_FREEFORM_CHANGE: ProposalChange = { __typename: 'NewFreeform' };
const NEW_TRANSFER_CHANGE: ProposalChange = { __typename: 'NewTransfer' };
const CANCEL_TRANSFER_CHANGE: ProposalChange = { __typename: 'CancelTransfer' };
const UPDATE_MARKET_STATE_CHANGE: ProposalChange = {
  __typename: 'UpdateMarketState',
};
const NEW_SPOT_MARKET_CHANGE: ProposalChange = { __typename: 'NewSpotMarket' };
const UPDATE_SPOT_MARKET_CHANGE: ProposalChange = {
  __typename: 'UpdateSpotMarket',
};
const UPDATE_VOLUME_DISCOUNT_PROGRAM_CHANGE: ProposalChange = {
  __typename: 'UpdateVolumeDiscountProgram',
};
const UPDATE_REFERRAL_PROGRAM_CHANGE: ProposalChange = {
  __typename: 'UpdateReferralProgram',
};

const GenericToastProposals = [
  NEW_MARKET_CHANGE,
  UPDATE_MARKET_CHANGE,
  NEW_ASSET_CHANGE,
  UPDATE_ASSET_CHANGE,
  NEW_FREEFORM_CHANGE,
  NEW_TRANSFER_CHANGE,
  CANCEL_TRANSFER_CHANGE,
  UPDATE_MARKET_STATE_CHANGE,
  NEW_SPOT_MARKET_CHANGE,
  UPDATE_SPOT_MARKET_CHANGE,
  UPDATE_VOLUME_DISCOUNT_PROGRAM_CHANGE,
  UPDATE_REFERRAL_PROGRAM_CHANGE,
];

const generateProposal = (
  title: string,
  state: ProposalState = ProposalState.STATE_OPEN,
  change: ProposalChange = { __typename: undefined },
  rejectionReason: ProposalRejectionReason | null = null
): OnProposalFragmentFragment => ({
  __typename: 'Proposal',
  id: Math.random().toString(),
  datetime: Math.random().toString(),
  rationale: {
    title,
    description: '',
  },
  rejectionReason,
  state,
  terms: {
    __typename: 'ProposalTerms',
    enactmentDatetime: '2022-12-09T14:40:38Z',
    change,
  },
});

const INITIAL = useToasts.getState();

const clear = () => {
  useToasts.setState(INITIAL);
};

describe('useProposalToasts', () => {
  beforeEach(clear);
  afterAll(clear);

  it.each(PROPOSAL_STATES_TO_TOAST)(
    'renders toast for %s proposal',
    async (state) => {
      const mockProposal: MockedResponse<OnProposalSubscription> = {
        request: {
          query: OnProposalDocument,
        },
        result: {
          data: {
            proposals: generateProposal(
              'Things to change',
              state,
              NEW_MARKET_CHANGE
            ),
          },
        },
      };
      const { result } = renderUseProposalToasts([mockProposal]);
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
  it.each(IGNORE_STATES)(
    'does not render toast for %s proposal',
    async (state) => {
      const mockFailedProposal: MockedResponse<OnProposalSubscription> = {
        request: {
          query: OnProposalDocument,
        },
        result: {
          data: {
            proposals: generateProposal('Things to change but ignored', state),
          },
        },
      };
      const { result } = renderUseProposalToasts([mockFailedProposal]);
      expect(result.current.loading).toBe(true);
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(useToasts.getState().count).toBe(0);
      });
    }
  );

  it('does not render toast for empty proposal', async () => {
    const error = console.error;
    console.error = () => {
      /* no op */
    };
    const mockEmptyProposal: MockedResponse<OnProposalSubscription> = {
      request: {
        query: OnProposalDocument,
      },
      result: {
        data: {
          proposals: undefined as unknown as OnProposalFragmentFragment,
        },
      },
    };

    const { result } = renderUseProposalToasts([mockEmptyProposal]);
    expect(result.current.loading).toBe(true);
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(useToasts.getState().count).toBe(0);
    });
    console.error = error;
  });

  const allTypes: [
    ProposalChange['__typename'],
    ProposalChange,
    ProposalState?
  ][] = [...GenericToastProposals, UPDATE_NETWORK_PARAMETER_CHANGE].map(
    (ch) => [ch.__typename, ch, sample(PROPOSAL_STATES_TO_TOAST)]
  );
  it.each(allTypes)(
    'renders toast for %s proposal',
    async (_, change, state) => {
      const proposalData = generateProposal('Things to change', state, change);
      const mockProposal: MockedResponse<OnProposalSubscription> = {
        request: {
          query: OnProposalDocument,
        },
        result: {
          data: {
            proposals: proposalData,
          },
        },
      };
      const { result } = renderUseProposalToasts([mockProposal]);
      expect(result.current.loading).toBe(true);
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(useToasts.getState().count).toBe(1);
      });
    }
  );
});

describe('ProposalToastContent', () => {
  const genericTypes: [
    ProposalChange['__typename'],
    ProposalChange,
    ProposalState?
  ][] = GenericToastProposals.map((ch) => [
    ch.__typename,
    ch,
    sample(PROPOSAL_STATES_TO_TOAST),
  ]);
  it.each(genericTypes)(
    'renders generic toast content for %s',
    async (_, change, state) => {
      const proposalData = generateProposal('Things to change', state, change);
      const { container } = render(
        <ProposalToastContent proposal={proposalData} />
      );
      const title = container.querySelector(
        '[data-testid="proposal-toast-title"]'
      );
      const rationale = container.querySelector(
        '[data-testid="proposal-toast-rationale-title"]'
      );
      const expectedChangeName = change.__typename
        ? ProposalChangeMapping[change.__typename]
        : '';
      const expectedState =
        ProposalStateMapping[proposalData.state].toLocaleLowerCase();
      expect(title).toHaveTextContent(
        `${expectedChangeName} proposal ${expectedState}`
      );
      expect(rationale).toHaveTextContent('Things to change');
    }
  );

  it('renders specific content for UpdateNetworkParameter proposal', () => {
    const proposalData = generateProposal(
      'Things to change',
      ProposalState.STATE_OPEN,
      UPDATE_NETWORK_PARAMETER_CHANGE
    );
    const { container } = render(
      <ProposalToastContent proposal={proposalData} />
    );
    const title = container.querySelector(
      '[data-testid="proposal-toast-title"]'
    );
    const rationale = container.querySelector(
      '[data-testid="proposal-toast-rationale-title"]'
    );
    const param = container.querySelector(
      '[data-testid="proposal-toast-network-param"]'
    );
    expect(title).toHaveTextContent('Update network parameter proposal open');
    expect(rationale).toBe(null);
    expect(param).toHaveTextContent('Update abc.def to 123');
  });
});
