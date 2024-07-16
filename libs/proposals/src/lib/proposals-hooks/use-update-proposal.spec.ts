/* eslint-disable jest/no-conditional-expect */
import { renderHook } from '@testing-library/react';
import * as Schema from '@vegaprotocol/types';

import type { ProposalListFieldsFragment } from '../proposals-data-provider';
import { useAssetUpdateProposal } from './use-update-proposal';

type Proposal = Pick<
  ProposalListFieldsFragment,
  '__typename' | 'id' | 'terms' | 'state'
>;

const generateUpdateAssetProposal = (
  id: string,
  quantum = '',
  lifetimeLimit = '',
  withdrawThreshold = ''
): Proposal => ({
  __typename: 'Proposal',
  id,
  state: Schema.ProposalState.STATE_OPEN,
  terms: {
    __typename: 'ProposalTerms',
    closingDatetime: '',
    enactmentDatetime: undefined,
    change: {
      __typename: 'UpdateAsset',
      assetId: id,
      quantum,
      source: {
        __typename: 'UpdateERC20',
        lifetimeLimit,
        withdrawThreshold,
      },
    },
  },
});

const generateUpdateMarketProposal = (id: string) =>
  ({
    state: Schema.ProposalState.STATE_OPEN,
    terms: {
      __typename: 'ProposalTerms',
      closingDatetime: '',
      enactmentDatetime: undefined,
      change: {
        __typename: 'UpdateMarket',
        marketId: id,
      },
    },
  } as Proposal);

const mockDataProviderData: {
  data: Proposal[];
  error: Error | undefined;
  loading: boolean;
} = {
  data: [
    generateUpdateMarketProposal('123'),
    generateUpdateAssetProposal('456'),
  ],
  error: undefined,
  loading: false,
};

const mockDataProvider = jest.fn(() => {
  return mockDataProviderData;
});
jest.mock('@vegaprotocol/data-provider', () => ({
  ...jest.requireActual('@vegaprotocol/data-provider'),
  useDataProvider: jest.fn((args) => mockDataProvider()),
}));

describe('useAssetUpdateProposal', () => {
  it('returns update proposal for a given asset', () => {
    const { result } = renderHook(() =>
      useAssetUpdateProposal({
        id: '456',
        proposalType: Schema.ProposalType.TYPE_UPDATE_ASSET,
      })
    );

    expect(result.current.data).toMatchObject({
      __typename: 'Proposal',
    });
    // @ts-expect-error terms present as mock only includes a normal proposal
    expect(result.current.data?.terms?.change?.assetId).toEqual('456');
  });

  it('does not return a proposal if not found', () => {
    const { result } = renderHook(() =>
      useAssetUpdateProposal({
        id: '789',
        proposalType: Schema.ProposalType.TYPE_UPDATE_MARKET,
      })
    );
    expect(result.current.data).toBeFalsy();
  });
});
