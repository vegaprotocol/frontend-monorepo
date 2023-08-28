import {
  act,
  render,
  screen,
  waitFor,
  fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LedgerExportForm } from './ledger-export-form';
import { formatForInput, toNanoSeconds } from '@vegaprotocol/utils';

const vegaUrl = 'https://vega-url.co.uk/querystuff';

const mockResponse = {
  headers: { get: jest.fn() },
  blob: () => '',
};
global.fetch = jest.fn().mockResolvedValue(mockResponse);

const assetsMock = {
  'asset-id': 'symbol asset-id',
  'asset-id-2': 'symbol asset-id-2',
};
describe('LedgerExportForm', () => {
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
      <LedgerExportForm
        partyId={partyId}
        vegaUrl={vegaUrl}
        assets={assetsMock}
      />
    );
    expect(await screen.getByText('symbol asset-id')).toBeInTheDocument();

    expect(
      await screen.getByTestId('ledger-download-button')
    ).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('ledger-download-button'));
    await waitFor(() => {
      expect(screen.getByTestId('download-spinner')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `https://vega-url.co.uk/api/v2/ledgerentry/export?partyId=${partyId}&assetId=asset-id&dateRange.startTimestamp=1691057410000000000`
      );
    });
    await waitFor(() => {
      expect(screen.queryByTestId('download-spinner')).not.toBeInTheDocument();
    });
  });

  it('assetID should be properly change request url', async () => {
    render(
      <LedgerExportForm
        partyId={partyId}
        vegaUrl={vegaUrl}
        assets={assetsMock}
      />
    );
    expect(await screen.getByText('symbol asset-id')).toBeInTheDocument();

    fireEvent.change(screen.getByTestId('select-ledger-asset'), {
      target: { value: 'asset-id-2' },
    });

    expect(await screen.getByText('symbol asset-id-2')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('ledger-download-button'));
    expect(await screen.getByTestId('download-spinner')).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `https://vega-url.co.uk/api/v2/ledgerentry/export?partyId=${partyId}&assetId=asset-id-2&dateRange.startTimestamp=1691057410000000000`
      );
    });
    await waitFor(() => {
      expect(screen.queryByTestId('download-spinner')).not.toBeInTheDocument();
    });
  });

  it('date-from should properly change request url', async () => {
    const newDate = new Date(1691230210000);
    render(
      <LedgerExportForm
        partyId={partyId}
        vegaUrl={vegaUrl}
        assets={assetsMock}
      />
    );
    expect(await screen.getByLabelText('Date from')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Date from'), {
      target: { value: formatForInput(newDate) },
    });

    await waitFor(() => {
      expect(screen.getByTestId('date-from')).toHaveValue(
        `${formatForInput(newDate)}.000`
      );
    });
    fireEvent.click(screen.getByTestId('ledger-download-button'));

    await waitFor(() => {
      expect(screen.getByTestId('download-spinner')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `https://vega-url.co.uk/api/v2/ledgerentry/export?partyId=${partyId}&assetId=asset-id&dateRange.startTimestamp=${toNanoSeconds(
          newDate
        )}`
      );
    });
    await waitFor(() => {
      expect(screen.queryByTestId('download-spinner')).not.toBeInTheDocument();
    });
  });

  it('date-to should properly change request url', async () => {
    const newDate = new Date(1691230210000);
    render(
      <LedgerExportForm
        partyId={partyId}
        vegaUrl={vegaUrl}
        assets={assetsMock}
      />
    );

    expect(await screen.getByLabelText('Date to')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Date to'), {
      target: { value: formatForInput(newDate) },
    });

    await waitFor(() => {
      expect(screen.getByTestId('date-to')).toHaveValue(
        `${formatForInput(newDate)}.000`
      );
    });

    fireEvent.click(screen.getByTestId('ledger-download-button'));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `https://vega-url.co.uk/api/v2/ledgerentry/export?partyId=${partyId}&assetId=asset-id&dateRange.startTimestamp=1691057410000000000&dateRange.endTimestamp=${toNanoSeconds(
          newDate
        )}`
      );
    });
    await waitFor(() => {
      expect(screen.queryByTestId('download-spinner')).not.toBeInTheDocument();
    });
  });
});
