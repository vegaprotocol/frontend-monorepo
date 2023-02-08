import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import type { MockedResponse } from '@apollo/client/testing';
import { render, waitFor } from '@testing-library/react';
import { AssetLink } from './asset-link';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { AssetDocument } from '@vegaprotocol/assets';
import { AssetStatus } from '@vegaprotocol/types';

function renderComponent(id: string, mock: MockedResponse[]) {
  return (
    <MockedProvider mocks={mock} addTypename={false}>
      <MemoryRouter>
        <AssetLink assetId={id} />
      </MemoryRouter>
    </MockedProvider>
  );
}

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

const mock = {
  request: {
    query: AssetDocument,
    variables: {
      assetId: '123',
    },
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
        ],
      },
    },
  },
};

describe('AssetLink', () => {
  it('renders the asset id when not found and makes the button disabled', async () => {
    const res = render(renderComponent('123', []));
    expect(res.getByText('123')).toBeInTheDocument();
    expect(await res.findByTestId('asset-link')).toBeDisabled();
    await waitFor(async () => {
      expect(await res.queryByText('A ONE')).toBeFalsy();
    });
  });

  it('renders the asset name when found and make the button enabled', async () => {
    const res = render(renderComponent('123', [mock]));
    expect(res.getByText('123')).toBeInTheDocument();

    await waitFor(async () => {
      expect(await res.findByText('A ONE')).toBeInTheDocument();
      expect(await res.findByTestId('asset-link')).not.toBeDisabled();
    });
  });
});
