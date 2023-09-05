import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LedgerExportLink } from './ledger-export-link';
import * as Types from '@vegaprotocol/types';
import { ledgerEntries } from './ledger-entries.mock';
import type { LedgerEntry } from './ledger-entries-data-provider';

const VEGA_URL = 'https://vega-url.co.uk/querystuff';
const mockEnvironment = jest.fn(() => VEGA_URL);
jest.mock('@vegaprotocol/environment', () => ({
  useEnvironment: jest.fn(() => mockEnvironment()),
}));

const asset = {
  id: 'assetID',
  name: 'assetName',
  symbol: 'assetSymbol',
  decimals: 1,
  quantum: '1',
  status: Types.AssetStatus,
  source: {
    __typename: 'ERC20',
    contractAddress: 'contractAddres',
    lifetimeLimit: 'lifetimeLimit',
    withdrawThreshold: 'withdraw',
  },
};

describe('LedgerExportLink', () => {
  const partyId = 'partyId';
  const entries = ledgerEntries.map((entry) => {
    return {
      ...entry,
      asset: entry.assetId
        ? {
            ...asset,
            id: entry.assetId,
            name: `name ${entry.assetId}`,
            symbol: `symbol ${entry.assetId}`,
          }
        : null,
      marketSender: null,
      marketReceiver: null,
    } as LedgerEntry;
  });

  it('should be properly rendered', async () => {
    render(<LedgerExportLink partyId={partyId} entries={entries} />);
    await waitFor(() => {
      expect(screen.getByRole('link')).toBeInTheDocument();
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        `https://vega-url.co.uk/api/v2/ledgerentry/export?partyId=${partyId}&assetId=asset-id`
      );
      expect(
        screen.getByRole('button', { name: /^symbol asset-id/ })
      ).toBeInTheDocument();
    });
  });
  it('should be properly change link url', async () => {
    render(<LedgerExportLink partyId={partyId} entries={entries} />);
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /^symbol asset-id/ })
      ).toBeInTheDocument();
    });
    act(() => {
      userEvent.click(screen.getByRole('button', { name: /^symbol asset-id/ }));
    });
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    act(() => {
      userEvent.click(
        screen.getByRole('menuitem', { name: /^symbol asset-id-2/ })
      );
    });
    await waitFor(() => {
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        `https://vega-url.co.uk/api/v2/ledgerentry/export?partyId=${partyId}&assetId=asset-id-2`
      );
    });
  });
});
