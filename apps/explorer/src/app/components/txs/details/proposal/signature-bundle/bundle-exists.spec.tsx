import { MockedProvider } from '@apollo/client/testing';
import { render } from '@testing-library/react';
import { AssetStatus } from '@vegaprotocol/types';
import { MemoryRouter } from 'react-router-dom';
import { BundleExists } from './bundle-exists';

jest.mock('../../../../links/proposal-link/proposal-link');
jest.mock('./bundle-signers');

describe('Bundle Exists', () => {
  const NON_ENABLED_STATUS: AssetStatus[] = [
    AssetStatus.STATUS_PENDING_LISTING,
    AssetStatus.STATUS_PROPOSED,
    AssetStatus.STATUS_REJECTED,
  ];

  const ENABLED_STATUS: AssetStatus[] = [AssetStatus.STATUS_ENABLED];

  const MOCK_SIGNATURES =
    '0x1760ce4efec01d5bb9fe57c0660a39a27e0b5a1bd39b4d3fc0452bf142a4ef733baaf4dbedd74cd676c759f96ac7f412ec05e136bbff8a81d9f0c2428df8e099004c4d166ece0527d86e202386e8758580790d0a46f6429baaa268b4bf5c11c9e3402e175a9022ae8295e543853c01383ef17cd58458ddfc9c706fca0ecffa0d3d0160eb5234e63a78b9649428ca7659eb693fdde86edfc6c2707ef2e8fbf4c76a9f0eebe183da571a58837e2fa995d7b10955ecf04c138dc0ce964f17c3de1f5c6d0060ec132cc515cf974ead1da38e2ff8d4b870335865e8d4d8c982182bddea18bb513e2d37fd32de7fedc0c4f694e6bcdcf20f8547f19e7d9d25ce32c6ca9ea51e01ad3b92475778d9da7251d3943071f59107c9cd7ad9dd1923c06e88d3352869d919a591bf30732bad2c3fcf30a9f664dbb7a9c65a64875a48cbeb5741bd0a853901';
  const MOCK_NONCE =
    '18250011763873610289536200551900545467959221115607409799241178172533618346952';
  const MOCK_PROPOSAL_ID =
    '285923fed8c66ffb416b163e8ec72d3a87b9b8e2570e7ee7fe97d7092a918bc8';

  const PROPOSAL_LINK_TEXT = 'Visit our Governance site to submit this';

  it.each(NON_ENABLED_STATUS)(
    'shows a handy ProposalLink if the status is anything except enabled',
    (status) => {
      const screen = render(
        <MemoryRouter>
          <MockedProvider>
            <BundleExists
              nonce={MOCK_NONCE}
              proposalId={MOCK_PROPOSAL_ID}
              signatures={MOCK_SIGNATURES}
              assetAddress={'0x123413423'}
              status={status}
            />
          </MockedProvider>
        </MemoryRouter>
      );

      expect(screen.getByText(PROPOSAL_LINK_TEXT)).toBeInTheDocument();
    }
  );

  it.each(ENABLED_STATUS)(
    'hides ProposalLink if the status is enabled',
    (status) => {
      const screen = render(
        <MemoryRouter>
          <MockedProvider>
            <BundleExists
              nonce={MOCK_NONCE}
              proposalId={MOCK_PROPOSAL_ID}
              signatures={MOCK_SIGNATURES}
              assetAddress={'0x123413423'}
              status={status}
            />
          </MockedProvider>
        </MemoryRouter>
      );

      expect(screen.queryAllByText(PROPOSAL_LINK_TEXT)).toEqual([]);
    }
  );
});
