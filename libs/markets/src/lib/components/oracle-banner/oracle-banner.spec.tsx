import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MockedProvider } from '@apollo/client/testing';
import { OracleBanner } from './oracle-banner';

describe('OracleBanner', () => {
  const mockOracleData = {
    data: {
      dataSourceSpecId: 'someId',
      provider: {
        name: 'Test oracle',
        url: 'https://zombo.com',
        description_markdown:
          'Some markdown describing the oracle provider.\n\nTwitter: @FacesPics2\n',
        oracle: {
          status: 'COMPROMISED',
          status_reason: 'Reason here',
          first_verified: '2021-01-01T00:00:00Z',
          last_verified: '2022-01-01T00:00:00Z',
          type: 'public_key',
          public_key: '0xfCEAdAFab14d46e20144F48824d0C09B1a03F2BC',
        },
        proofs: [
          {
            format: 'url',
            available: true,
            type: 'web',
            url: 'https://proofweb.com',
          },
          {
            format: 'signed_message',
            available: true,
            type: 'public_key',
            public_key: '0xfCEAdAFab14d46e20144F48824d0C09B1a03F2BC',
            message: 'SOMEHEX',
          },
        ],
        github_link:
          'https://github.com/vegaprotocol/well-known/blob/main/oracle-providers/eth_address-0xfCEAdAFab14d46e20144F48824d0C09B1a03F2BC.toml',
      },
    },
  };

  // Mock the hook
  const mockUseMarketOracle = jest.fn();
  jest.mock('../../hooks', () => ({
    ...jest.requireActual('../../hooks'),
    useMarketOracle: mockUseMarketOracle,
  }));

  describe('OracleBanner', () => {
    beforeEach(() => {
      mockUseMarketOracle.mockReturnValue(mockOracleData);
    });

    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('should render successfully', async () => {
      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <OracleBanner marketId="someMarketId" />
        </MockedProvider>
      );
      await waitFor(() => {
        const component = screen.getByTestId('oracle-banner-status');
        expect(component).toBeTruthy();
      });
    });
  });
});
