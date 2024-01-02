import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarketOracleBanner } from './market-oracle-banner';

jest.mock('@vegaprotocol/markets', () => ({
  ...jest.requireActual('@vegaprotocol/markets'),
  OracleDialog: ({ open }: { open: boolean }) => {
    return <div data-testid="oracle-dialog">{open ? 'open' : 'closed'}</div>;
  },
}));

const oracle = {
  dataSourceSpecId: 'someId',
  provider: {
    name: 'Test oracle',
    url: 'https://zombo.com',
    description_markdown:
      'Some markdown describing the oracle provider.\n\nTwitter: @FacesPics2\n',
    oracle: {
      status: 'COMPROMISED' as const,
      status_reason: 'Reason here',
      first_verified: '2021-01-01T00:00:00Z',
      last_verified: '2022-01-01T00:00:00Z',
      type: 'public_key' as const,
      public_key: '0xfCEAdAFab14d46e20144F48824d0C09B1a03F2BC',
    },
    proofs: [
      {
        format: 'url' as const,
        available: true,
        type: 'web' as const,
        url: 'https://proofweb.com',
      },
      {
        format: 'signed_message' as const,
        available: true,
        type: 'public_key' as const,
        public_key: '0xfCEAdAFab14d46e20144F48824d0C09B1a03F2BC',
        message: 'SOMEHEX',
      },
    ],
    github_link:
      'https://github.com/vegaprotocol/well-known/blob/main/oracle-providers/eth_address-0xfCEAdAFab14d46e20144F48824d0C09B1a03F2BC.toml',
  },
};

describe('MarketOracleBanner', () => {
  it('should render successfully', async () => {
    render(<MarketOracleBanner oracle={oracle} />);

    expect(screen.getByTestId('oracle-dialog')).toHaveTextContent('closed');
    expect(screen.getByTestId('oracle-banner-status')).toHaveTextContent(
      'COMPROMISED'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Show more' }));
    expect(screen.getByTestId('oracle-dialog')).toHaveTextContent('open');
  });
});
