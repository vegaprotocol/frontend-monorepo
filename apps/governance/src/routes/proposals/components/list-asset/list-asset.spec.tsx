import { fireEvent, render, screen } from '@testing-library/react';
import { ListAsset } from './list-asset';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type {
  AssetListBundleQuery,
  ProposalAssetQuery,
} from './__generated__/Asset';
import { AssetListBundleDocument } from './__generated__/Asset';
import { ProposalAssetDocument } from './__generated__/Asset';
import * as Schema from '@vegaprotocol/types';
import type { useWeb3React } from '@web3-react/core';

const mockUseEthTx = {
  perform: jest.fn(),
  Dialog: () => null,
};

jest.mock('@vegaprotocol/web3', () => {
  const orig = jest.requireActual('@vegaprotocol/web3');
  return {
    ...orig,
    useBridgeContract: jest.fn().mockReturnValue({
      listAsset: jest.fn(),
    }),
    useEthereumTransaction: jest.fn(() => mockUseEthTx),
  };
});

const defaultHookValue = {
  isActive: false,
  error: undefined,
  connector: null,
  chainId: 3,
  account: null,
} as unknown as ReturnType<typeof useWeb3React>;
let mockHookValue: ReturnType<typeof useWeb3React>;

jest.mock('@web3-react/core', () => {
  const original = jest.requireActual('@web3-react/core');
  return {
    ...original,
    useWeb3React: jest.fn(() => mockHookValue),
  };
});

const ASSET_ID = 'foo';

const DEFAULT__ASSET: ProposalAssetQuery = {
  __typename: 'Query',
  asset: {
    __typename: 'Asset',
    status: Schema.AssetStatus.STATUS_PENDING_LISTING,
    source: {
      __typename: 'ERC20',
      contractAddress: '0x0',
      chainId: '1',
    },
  },
};

const proposalAssetMock: MockedResponse<ProposalAssetQuery> = {
  request: {
    query: ProposalAssetDocument,
    variables: {
      assetId: ASSET_ID,
    },
  },
  result: {
    data: {
      ...DEFAULT__ASSET,
    },
  },
};

const assetBundleMock: MockedResponse<AssetListBundleQuery> = {
  request: {
    query: AssetListBundleDocument,
    variables: {
      assetId: ASSET_ID,
    },
  },
  result: {
    data: {
      erc20ListAssetBundle: {
        assetSource: '0xf00',
        vegaAssetId: ASSET_ID,
        nonce: '1',
        signatures: '0x0',
      },
    },
  },
};

const renderComponent = (assetId: string) => {
  return render(
    <MockedProvider mocks={[proposalAssetMock, assetBundleMock]}>
      <ListAsset
        assetId={assetId}
        withdrawalThreshold={'1'}
        lifetimeLimit={'100'}
      />
    </MockedProvider>
  );
};

it('Renders connect state if not connected', async () => {
  mockHookValue = defaultHookValue;
  renderComponent(ASSET_ID);

  expect(
    await screen.findByText('Connect Ethereum wallet')
  ).toBeInTheDocument();
});

it('Renders title, description and button when connected', async () => {
  mockHookValue = {
    ...defaultHookValue,
    account: 'foo',
  };
  renderComponent(ASSET_ID);
  expect(await screen.findByText('List asset')).toBeInTheDocument();
  expect(
    await screen.findByText(
      'This asset needs to be listed on the collateral bridge before it can be used.'
    )
  ).toBeInTheDocument();
  expect(await screen.findByTestId('list-asset')).toHaveTextContent(
    'List asset'
  );
});

it('Sends transaction correctly when button is pressed', async () => {
  mockHookValue = {
    ...defaultHookValue,
    account: 'foo',
  };
  renderComponent(ASSET_ID);
  expect(await screen.findByTestId('list-asset')).toHaveTextContent(
    'List asset'
  );
  fireEvent.click(screen.getByTestId('list-asset'));
  expect(mockUseEthTx.perform).toBeCalledWith(
    '0xf00',
    '0xfoo',
    '100',
    '1',
    '1',
    '0x0'
  );
});
