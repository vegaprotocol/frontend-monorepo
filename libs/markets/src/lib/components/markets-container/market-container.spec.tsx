import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as DataProviders from '@vegaprotocol/data-provider';
import { MockedProvider } from '@apollo/react-testing';
import type { MarketMaybeWithData } from '../../markets-provider';
import { MarketsContainer } from './markets-container';

const market = {
  id: 'id-1',
  tradableInstrument: {
    instrument: {
      product: { settlementAsset: { id: 'assetId-1' } },
    },
  },
  decimalPlaces: 1,
  positionDecimalPlaces: 1,
  state: 'STATE_ACTIVE',
  tradingMode: 'TRADING_MODE_OPENING_AUCTION',
  data: {
    bestBidPrice: 100,
  },
} as unknown as MarketMaybeWithData;

describe('MarketsContainer', () => {
  afterEach(() => {
    jest.useRealTimers();
  });
  it('context menu should stay open', async () => {
    const spyOnSelect = jest.fn();
    jest.useFakeTimers();
    jest
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .spyOn<typeof DataProviders, any>(DataProviders, 'useDataProvider')
      .mockImplementationOnce(() => {
        return {
          error: null,
          reload: jest.fn(),
          data: [market],
        };
      })
      .mockImplementationOnce(() => {
        return {
          error: null,
          reload: jest.fn(),
          data: [{ ...market, state: 'STATE_PENDING' }],
        };
      })
      .mockImplementation(() => {
        return {
          error: null,
          reload: jest.fn(),
          data: [{ ...market, state: 'STATE_SUSPENDED' }],
        };
      });

    let rerenderVar: (ui: React.ReactElement) => void;
    await act(() => {
      const { rerender } = render(
        <MockedProvider mocks={[]}>
          <MarketsContainer onSelect={spyOnSelect} />
        </MockedProvider>
      );
      rerenderVar = rerender;
    });
    await waitFor(() => {
      expect(
        screen.getByRole('rowgroup', {
          name: (_name, element) =>
            element.classList.contains('ag-pinned-right-cols-container'),
        })
      ).toBeInTheDocument();
    });
    await act(() => {
      userEvent.click(
        screen.getByRole('button', {
          name: (_name, element) =>
            (element.parentNode as Element)?.getAttribute('id') ===
            'cell-market-actions-8',
        })
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId('market-actions-content')).toBeInTheDocument();
    });
    expect(
      screen.getByRole('menuitem', { name: 'Copy Market ID' })
    ).toBeInTheDocument();
    await act(() => {
      rerenderVar(
        <MockedProvider mocks={[]}>
          <MarketsContainer onSelect={spyOnSelect} />
        </MockedProvider>
      );
    });
    await expect(screen.getByText('Copy Market ID')).toBeInTheDocument();
  });
});
