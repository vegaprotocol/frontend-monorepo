import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { render, waitFor } from '@testing-library/react';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { AssetsDocument } from '@vegaprotocol/assets';
import { AssetStatus } from '@vegaprotocol/types';
import { MemoryRouter } from 'react-router-dom';
import Assets from './index';

const component = (mocks: MockedResponse[]) => (
  <MemoryRouter>
    <MockedProvider mocks={mocks}>
      <Assets />
    </MockedProvider>
  </MemoryRouter>
);

const A1: AssetFieldsFragment = {
  __typename: 'Asset',
  id: '123',
  name: 'A ONE',
  symbol: 'A1',
  decimals: 0,
  quantum: '',
  status: AssetStatus.STATUS_ENABLED,
  source: {
    __typename: 'BuiltinAsset',
    maxFaucetAmountMint: '',
  },
  infrastructureFeeAccount: {
    __typename: 'AccountBalance',
    balance: '',
  },
  globalRewardPoolAccount: {
    __typename: 'AccountBalance',
    balance: '',
  },
  lpFeeRewardAccount: {
    __typename: 'AccountBalance',
    balance: '',
  },
  makerFeeRewardAccount: {
    __typename: 'AccountBalance',
    balance: '',
  },
  marketProposerRewardAccount: {
    __typename: 'AccountBalance',
    balance: '',
  },
  takerFeeRewardAccount: {
    __typename: 'AccountBalance',
    balance: '',
  },
};

const A2: AssetFieldsFragment = {
  __typename: 'Asset',
  id: '456',
  name: 'A TWO',
  symbol: 'A2',
  decimals: 0,
  quantum: '',
  status: AssetStatus.STATUS_ENABLED,
  source: {
    __typename: 'BuiltinAsset',
    maxFaucetAmountMint: '',
  },
  infrastructureFeeAccount: {
    __typename: 'AccountBalance',
    balance: '',
  },
  globalRewardPoolAccount: {
    __typename: 'AccountBalance',
    balance: '',
  },
  lpFeeRewardAccount: {
    __typename: 'AccountBalance',
    balance: '',
  },
  makerFeeRewardAccount: {
    __typename: 'AccountBalance',
    balance: '',
  },
  marketProposerRewardAccount: {
    __typename: 'AccountBalance',
    balance: '',
  },
  takerFeeRewardAccount: {
    __typename: 'AccountBalance',
    balance: '',
  },
};

const mock = {
  request: {
    query: AssetsDocument,
  },
  result: {
    data: {
      assetsConnection: {
        __typename: 'AssetsConnection',
        edges: [
          {
            __typename: 'AssetEdge',
            node: A1,
          },
          {
            __typename: 'AssetEdge',
            node: A2,
          },
        ],
      },
    },
  },
};

describe('Assets', () => {
  it('shows loading message on first render', async () => {
    const res = render(component([mock]));
    expect(await res.findByText('Loading...')).toBeInTheDocument();
  });

  it('shows no data message if no assets found', async () => {
    const res = render(
      component([
        {
          request: {
            query: AssetsDocument,
          },
          result: { data: null },
        },
      ])
    );
    expect(
      await res.findByText('This chain has no assets')
    ).toBeInTheDocument();
  });

  it('shows a table/list with all the assets', async () => {
    const res = render(component([mock]));
    await waitFor(() => {
      const rowA1 = res.container.querySelector('[row-id="123"]');
      expect(rowA1).toBeInTheDocument();

      const rowA2 = res.container.querySelector('[row-id="456"]');
      expect(rowA2).toBeInTheDocument();
    });
  });
});
