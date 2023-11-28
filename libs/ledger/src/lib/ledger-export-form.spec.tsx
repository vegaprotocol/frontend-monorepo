import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { createDownloadUrl, LedgerExportForm } from './ledger-export-form';
import { formatForInput, toNanoSeconds } from '@vegaprotocol/utils';
import {
  useLedgerDownloadManager,
  useLedgerDownloadFile,
} from './ledger-download-store';
import { Intent } from '@vegaprotocol/ui-toolkit';

const mockSetToast = jest.fn();
jest.mock('@vegaprotocol/ui-toolkit', () => ({
  ...jest.requireActual('@vegaprotocol/ui-toolkit'),
  useToasts: jest.fn(() => [mockSetToast, jest.fn(), jest.fn(() => false)]),
}));
const vegaUrl = 'https://vega-url.co.uk/querystuff';

const mockResponse = {
  ok: true,
  headers: { get: jest.fn() },
  blob: () => '',
};
global.fetch = jest.fn().mockResolvedValue(mockResponse);

const assetsMock = {
  ['a'.repeat(64)]: 'symbol asset-id',
  ['b'.repeat(64)]: 'symbol asset-id-2',
};

describe('LedgerExportForm', () => {
  const partyId = 'c'.repeat(64);

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2023-08-10T10:10:10.000Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should be properly rendered', async () => {
    render(
      <LedgerExportForm
        partyId={partyId}
        vegaUrl={vegaUrl}
        assets={assetsMock}
      />
    );
    expect(screen.getByText('symbol asset-id')).toBeInTheDocument();

    // userEvent does not work with faked timers
    fireEvent.click(screen.getByTestId('ledger-download-button'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `https://vega-url.co.uk/api/v2/ledgerentry/export?partyId=${partyId}&assetId=${
          Object.keys(assetsMock)[0]
        }&dateRange.startTimestamp=1691057410000000000`
      );
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
    expect(screen.getByText('symbol asset-id')).toBeInTheDocument();

    fireEvent.change(screen.getByTestId('select-ledger-asset'), {
      target: { value: Object.keys(assetsMock)[1] },
    });

    expect(screen.getByText('symbol asset-id-2')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('ledger-download-button'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `https://vega-url.co.uk/api/v2/ledgerentry/export?partyId=${partyId}&assetId=${
          Object.keys(assetsMock)[1]
        }&dateRange.startTimestamp=1691057410000000000`
      );
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
    expect(screen.getByLabelText('Date from')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Date from'), {
      target: { value: formatForInput(newDate) },
    });

    expect(screen.getByTestId('date-from')).toHaveValue(
      `${formatForInput(newDate)}.000`
    );

    fireEvent.click(screen.getByTestId('ledger-download-button'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `https://vega-url.co.uk/api/v2/ledgerentry/export?partyId=${partyId}&assetId=${
          Object.keys(assetsMock)[0]
        }&dateRange.startTimestamp=${toNanoSeconds(newDate)}`
      );
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

    expect(screen.getByLabelText('Date to')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Date to'), {
      target: { value: formatForInput(newDate) },
    });

    expect(screen.getByTestId('date-to')).toHaveValue(
      `${formatForInput(newDate)}.000`
    );

    fireEvent.click(screen.getByTestId('ledger-download-button'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `https://vega-url.co.uk/api/v2/ledgerentry/export?partyId=${partyId}&assetId=${
          Object.keys(assetsMock)[0]
        }&dateRange.startTimestamp=1691057410000000000&dateRange.endTimestamp=${toNanoSeconds(
          newDate
        )}`
      );
    });
  });

  it('Time zone sentence should be properly displayed', () => {
    let timeZoneOffset = -120;
    Date.prototype.getTimezoneOffset = jest.fn(() => timeZoneOffset);

    const { rerender } = render(
      <LedgerExportForm
        partyId={partyId}
        vegaUrl={vegaUrl}
        assets={assetsMock}
      />
    );

    expect(
      screen.getByText(/^The downloaded file uses the UTC/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Your time zone is UTC-02:00\.$/)
    ).toBeInTheDocument();

    timeZoneOffset = 270;
    rerender(
      <LedgerExportForm
        partyId={partyId}
        vegaUrl={vegaUrl}
        assets={assetsMock}
      />
    );
    expect(
      screen.getByText(/Your time zone is UTC\+04:30\.$/)
    ).toBeInTheDocument();

    timeZoneOffset = 0;
    rerender(
      <LedgerExportForm
        partyId={partyId}
        vegaUrl={vegaUrl}
        assets={assetsMock}
      />
    );
    expect(
      screen.queryByText(/^The downloaded file uses the UTC/)
    ).not.toBeInTheDocument();
  });

  it('A toast notification should be displayed', async () => {
    useLedgerDownloadFile.setState({ queue: [] });
    const TestWrapper = () => {
      useLedgerDownloadManager();
      return (
        <LedgerExportForm
          partyId={partyId}
          vegaUrl={vegaUrl}
          assets={assetsMock}
        />
      );
    };

    render(<TestWrapper />);
    expect(screen.getByText('symbol asset-id')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('ledger-download-button'));

    const link = `https://vega-url.co.uk/api/v2/ledgerentry/export?partyId=${partyId}&assetId=${
      Object.keys(assetsMock)[0]
    }&dateRange.startTimestamp=1691057410000000000`;

    await waitFor(() => {
      expect(mockSetToast).toHaveBeenCalledWith({
        id: link,
        content: expect.any(Object),
        onClose: expect.any(Function),
        intent: Intent.Primary,
        loader: true,
      });

      expect(global.fetch).toHaveBeenCalledWith(link);
    });

    mockSetToast.mockClear();
    (global.fetch as jest.Mock).mockClear();
    fireEvent.click(screen.getByTestId('ledger-download-button')); // click again

    await waitFor(() => {
      expect(mockSetToast).toHaveBeenCalled();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});

describe('createDownloadUrl', () => {
  const fromTimestamp = 1690848000000;
  const toTimestamp = 1691107200000;
  const args = {
    protohost: 'https://vega-url.co.uk',
    partyId: 'a'.repeat(64),
    assetId: 'b'.repeat(64),
    dateFrom: new Date(fromTimestamp).toISOString(),
  };

  it('formats url with without an end date', () => {
    expect(createDownloadUrl(args)).toEqual(
      `${args.protohost}/api/v2/ledgerentry/export?partyId=${
        args.partyId
      }&assetId=${args.assetId}&dateRange.startTimestamp=${toNanoSeconds(
        args.dateFrom
      )}`
    );
  });

  it('formats url with with an end date', () => {
    const dateTo = new Date(toTimestamp).toISOString();
    expect(
      createDownloadUrl({
        ...args,
        dateTo,
      })
    ).toEqual(
      `${args.protohost}/api/v2/ledgerentry/export?partyId=${
        args.partyId
      }&assetId=${args.assetId}&dateRange.startTimestamp=${toNanoSeconds(
        args.dateFrom
      )}&dateRange.endTimestamp=${toNanoSeconds(dateTo)}`
    );
  });
});
