import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import { LedgerExportForm } from './ledger-export-form';
import * as Types from '@vegaprotocol/types';
import { AssetsDocument } from '@vegaprotocol/assets';

const VEGA_URL = 'https://vega-url.co.uk/querystuff';
const mockEnvironment = jest.fn(() => VEGA_URL);
jest.mock('@vegaprotocol/environment', () => ({
  useEnvironment: jest.fn(() => mockEnvironment()),
}));

const mockHeadersGetter = jest.fn();
const mockResponse = {
  headers: { get: mockHeadersGetter },
  blob: () => 'file',
};
global.fetch = jest.fn(() =>
  Promise.resolve(mockResponse as unknown as Response)
);
// global.fetch = jest.fn().mockImplementation(() => {});
global.URL.createObjectURL = jest.fn();

const assetMock = {
  request: {
    query: AssetsDocument,
  },
  result: {
    data: {
      assetsConnection: {
        edges: [
          {
            node: {
              id: 'asset-id',
              symbol: 'symbol asset-id',
            },
          },
          {
            node: {
              id: 'asset-id-2',
              symbol: 'symbol asset-id-2',
            },
          },
        ],
      },
    },
  },
};

describe('LedgerExportLink', () => {
  const partyId = 'partyId';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be properly rendered', async () => {
    const { container, debug } = render(
      <MockedProvider mocks={[assetMock]}>
        <LedgerExportForm partyId={partyId} />
      </MockedProvider>
    );
    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: (accessibleName, element) =>
            element.textContent === 'symbol asset-id',
        })
      ).toBeInTheDocument();
      expect(screen.getByTestId('ledger-download-button')).toBeInTheDocument();
      userEvent.click(screen.getByTestId('ledger-download-button'));
      expect(global.fetch).toHaveBeenCalledWith(
        `https://vega-url.co.uk/api/v2/ledgerentry/export?partyId=${partyId}&assetId=asset-id`
      );
    });
  });
  it('should be properly change link url', async () => {
    render(
      <MockedProvider mocks={[assetMock]}>
        <LedgerExportForm partyId={partyId} />
      </MockedProvider>
    );
    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: (accessibleName, element) =>
            element.textContent === 'symbol asset-id',
        })
      ).toBeInTheDocument();
    });
    await act(() => {
      userEvent.click(
        screen.getByRole('button', {
          name: (accessibleName, element) =>
            element.textContent === 'symbol asset-id',
        })
      );
    });
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    await act(() => {
      userEvent.click(
        screen.getByRole('menuitem', {
          name: (accessibleName, element) =>
            element.textContent === 'symbol asset-id-2',
        })
      );
    });
    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: (accessibleName, element) =>
            element.textContent === 'symbol asset-id-2',
        })
      ).toBeInTheDocument();
    });
    await act(() => {
      userEvent.click(screen.getByTestId('ledger-download-button'));
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `https://vega-url.co.uk/api/v2/ledgerentry/export?partyId=${partyId}&assetId=asset-id-2`
      );
    });
  });
});
