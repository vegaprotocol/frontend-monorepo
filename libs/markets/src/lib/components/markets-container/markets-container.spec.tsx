import { render, screen, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as DataProviders from '@vegaprotocol/data-provider';
import { MockedProvider } from '@apollo/react-testing';
import type { MarketMaybeWithData } from '../../markets-provider';
import { MarketsContainer } from './markets-container';

const SuccessorMarketRenderer = ({ value }: { value: string }) => {
  return '-';
};

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
  it('context menu should stay open', async () => {
    const spyOnSelect = jest.fn();
    jest
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .spyOn<typeof DataProviders, any>(DataProviders, 'useDataProvider')
      .mockImplementation(() => {
        return {
          error: null,
          reload: jest.fn(),
          data: [market],
        };
      });

    let rerenderRef: (ui: React.ReactElement) => void;
    await act(async () => {
      const { rerender } = render(
        <MockedProvider>
          <MarketsContainer
            onSelect={spyOnSelect}
            SuccessorMarketRenderer={SuccessorMarketRenderer}
          />
        </MockedProvider>
      );
      rerenderRef = rerender;
    });

    // make sure ag grid is finished initializaing
    const rowContainer = await screen.findByRole('rowgroup', {
      name: (_name, element) =>
        element.classList.contains('ag-center-cols-container'),
    });
    expect(within(rowContainer).getAllByRole('row')).toHaveLength(1);
    expect(
      screen.getByRole('rowgroup', {
        name: (_name, element) =>
          element.classList.contains('ag-pinned-right-cols-container'),
      })
    ).toBeInTheDocument();

    // open the dropdown
    await userEvent.click(
      screen.getByRole('button', {
        name: (_name, element) =>
          (element.parentNode as Element)?.getAttribute('id') ===
          'cell-market-actions-9',
      })
    );

    await checkDropdown();

    // reset the mock and rerender so the component
    // updates with new data
    jest
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .spyOn<typeof DataProviders, any>(DataProviders, 'useDataProvider')
      .mockImplementation(() => {
        return {
          error: null,
          reload: jest.fn(),
          data: [{ ...market, state: 'STATE_PENDING' }],
        };
      });

    // @ts-ignore we await the act above so rerenderRef is definitely defined
    rerenderRef(
      <MockedProvider mocks={[]}>
        <MarketsContainer onSelect={spyOnSelect} />
      </MockedProvider>
    );

    // make sure dropdown is still open
    await checkDropdown();

    async function checkDropdown() {
      const dropdownContent = await screen.findByTestId(
        'market-actions-content'
      );
      expect(dropdownContent).toBeInTheDocument();
      expect(
        within(dropdownContent).getByRole('menuitem', {
          name: 'Copy Market ID',
        })
      ).toBeInTheDocument();
    }
  });
});
