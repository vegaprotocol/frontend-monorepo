import { render, screen } from '@testing-library/react';
import { ListAsset } from './list-asset';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type {
  AssetListBundleQuery,
  ProposalAssetQuery,
} from './__generated___/Asset';
import { AssetListBundleDocument } from './__generated___/Asset';
import { ProposalAssetDocument } from './__generated___/Asset';
import { AssetStatus } from '@vegaprotocol/types';

// jest.mock('@vegaprotocol/react-helpers', () => ({
//   ...jest.requireActual('@vegaprotocol/react-helpers'),
//   useNetworkParams: jest.fn(() => ({
//     params: {
//       governance_proposal_asset_minVoterBalance: '1',
//       governance_proposal_freeform_minVoterBalance: '0',
//       governance_proposal_market_minVoterBalance: '1',
//       governance_proposal_updateAsset_minVoterBalance: '0',
//       governance_proposal_updateMarket_minVoterBalance: '1',
//       governance_proposal_updateNetParam_minVoterBalance: '1',
//       spam_protection_voting_min_tokens: '1000000000000000000',
//     },
//     loading: false,
//     error: null,
//   })),
// }));

const ASSET_ID = 'foo';

const DEFAULT__ASSET: ProposalAssetQuery = {
  __typename: 'Query',
  asset: {
    __typename: 'Asset',
    status: AssetStatus.STATUS_PENDING_LISTING,
    source: {
      __typename: 'ERC20',
      contractAddress: '0x0',
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
        assetSource: '',
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

it('Renders with data-testid', async () => {
  renderComponent(ASSET_ID);
  screen.debug();
  expect(await screen.findByTestId('proposal')).toBeInTheDocument();
});
