import {
  act,
  render,
  screen,
  waitFor,
  fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import { LedgerExportForm } from './ledger-export-form';
import { AssetsDocument } from '@vegaprotocol/assets';
import { formatForInput, toNanoSeconds } from '@vegaprotocol/utils';

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
global.fetch = jest.fn().mockResolvedValue(mockResponse);
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

  afterEach(() => {
    jest.clearAllMocks();
  });
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2023-08-10T10:10:10.000Z'));
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  it('should be properly rendered', async () => {
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
      expect(screen.getByTestId('ledger-download-button')).toBeInTheDocument();
      userEvent.click(screen.getByTestId('ledger-download-button'));
      expect(global.fetch).toHaveBeenCalledWith(
        `https://vega-url.co.uk/api/v2/ledgerentry/export?partyId=${partyId}&assetId=asset-id&dateRange.startTimestamp=1691057410000000000`
      );
    });
  });

  it('assetID should be properly change request url', async () => {
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
    act(() => {
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
    act(() => {
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
    act(() => {
      userEvent.click(screen.getByTestId('ledger-download-button'));
    });
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `https://vega-url.co.uk/api/v2/ledgerentry/export?partyId=${partyId}&assetId=asset-id-2&dateRange.startTimestamp=1691057410000000000`
      );
    });
  });

  it('date-from should properly change request url', async () => {
    const newDate = new Date(1691230210000);
    render(
      <MockedProvider mocks={[assetMock]}>
        <LedgerExportForm partyId={partyId} />
      </MockedProvider>
    );
    await waitFor(() => {
      expect(screen.getByLabelText('Date from')).toBeInTheDocument();
    });
    await act(() => {
      fireEvent.change(screen.getByLabelText('Date from'), {
        target: { value: formatForInput(newDate) },
      });
    });
    await waitFor(() => {
      expect(screen.getByTestId('date-from')).toHaveValue(
        `${formatForInput(newDate)}.000`
      );
    });
    await act(() => {
      fireEvent.click(screen.getByTestId('ledger-download-button'));
    });
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `https://vega-url.co.uk/api/v2/ledgerentry/export?partyId=${partyId}&assetId=asset-id&dateRange.startTimestamp=${toNanoSeconds(
          newDate
        )}`
      );
    });
  });

  it('date-to should properly change request url', async () => {
    const newDate = new Date(1691230210000);
    render(
      <MockedProvider mocks={[assetMock]}>
        <LedgerExportForm partyId={partyId} />
      </MockedProvider>
    );
    await waitFor(() => {
      expect(screen.getByLabelText('Date to')).toBeInTheDocument();
    });
    await act(() => {
      fireEvent.change(screen.getByLabelText('Date to'), {
        target: { value: formatForInput(newDate) },
      });
    });
    await waitFor(() => {
      expect(screen.getByTestId('date-to')).toHaveValue(
        `${formatForInput(newDate)}.000`
      );
    });
    await act(() => {
      fireEvent.click(screen.getByTestId('ledger-download-button'));
    });
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `https://vega-url.co.uk/api/v2/ledgerentry/export?partyId=${partyId}&assetId=asset-id&dateRange.startTimestamp=1691057410000000000&dateRange.endTimestamp=${toNanoSeconds(
          newDate
        )}`
      );
    });
  });
});
