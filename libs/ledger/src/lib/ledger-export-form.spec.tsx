import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { createDownloadUrl, LedgerExportForm } from './ledger-export-form';
import { formatForInput, toNanoSeconds } from '@vegaprotocol/utils';

const vegaUrl = 'https://vega-url.co.uk/querystuff';

const mockResponse = {
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

    expect(screen.getByTestId('download-spinner')).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `https://vega-url.co.uk/api/v2/ledgerentry/export?partyId=${partyId}&assetId=${
          Object.keys(assetsMock)[0]
        }&dateRange.startTimestamp=1691057410000000000`
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
    expect(screen.getByText('symbol asset-id')).toBeInTheDocument();

    fireEvent.change(screen.getByTestId('select-ledger-asset'), {
      target: { value: Object.keys(assetsMock)[1] },
    });

    expect(screen.getByText('symbol asset-id-2')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('ledger-download-button'));

    expect(screen.getByTestId('download-spinner')).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `https://vega-url.co.uk/api/v2/ledgerentry/export?partyId=${partyId}&assetId=${
          Object.keys(assetsMock)[1]
        }&dateRange.startTimestamp=1691057410000000000`
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
    expect(screen.getByLabelText('Date from')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Date from'), {
      target: { value: formatForInput(newDate) },
    });

    expect(screen.getByTestId('date-from')).toHaveValue(
      `${formatForInput(newDate)}.000`
    );

    fireEvent.click(screen.getByTestId('ledger-download-button'));

    expect(screen.getByTestId('download-spinner')).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `https://vega-url.co.uk/api/v2/ledgerentry/export?partyId=${partyId}&assetId=${
          Object.keys(assetsMock)[0]
        }&dateRange.startTimestamp=${toNanoSeconds(newDate)}`
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

    await waitFor(() => {
      expect(screen.queryByTestId('download-spinner')).not.toBeInTheDocument();
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

  it('should throw if invalid args are provided', () => {
    // invalid url
    expect(() => {
      // @ts-ignore override z.infer type
      createDownloadUrl({ ...args, protohost: 'foo' });
    }).toThrow();

    // invalid partyId
    expect(() => {
      // @ts-ignore override z.infer type
      createDownloadUrl({ ...args, partyId: 'z'.repeat(64) });
    }).toThrow();
  });
});
