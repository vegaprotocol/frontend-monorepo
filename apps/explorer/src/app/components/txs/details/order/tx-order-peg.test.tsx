import { render } from '@testing-library/react';
import type { TxDetailsOrderProps } from './tx-order-peg';
import { TxOrderPeggedReference, getMarketDecimals } from './tx-order-peg';
import { useExplorerMarketQuery } from '../../../links/market-link/__generated__/Market';
import type { ExplorerMarketQuery } from '../../../links/market-link/__generated__/Market';
import { PeggedReference, Side } from '@vegaprotocol/types';

// Mock the useExplorerMarketQuery hook
jest.mock('../../../links/market-link/__generated__/Market', () => ({
  useExplorerMarketQuery: jest.fn().mockReturnValue({
    data: {
      market: { decimalPlaces: 0 },
    },
    loading: false,
  }),
}));

describe('getSettlementAsset', () => {
  it('should return the decimal places if data is defined', () => {
    const data = {
      market: {
        __typename: 'Market',
        id: '123',
        decimalPlaces: 8,
      },
    };

    const result = getMarketDecimals(data as Partial<ExplorerMarketQuery>);

    expect(result).toEqual(8);
  });

  it('should return 0 if data is undefined', () => {
    const result = getMarketDecimals(undefined);

    expect(result).toEqual(0);
  });
});

describe('TxOrderPeggedReference', () => {
  beforeEach(() => {
    // Mock the useExplorerMarketQuery hook return value
    (useExplorerMarketQuery as jest.Mock).mockReturnValue({
      data: {
        settlementAsset: 'some-settlement-asset',
      },
      loading: false,
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render the offset and reference correctly', () => {
    const props: TxDetailsOrderProps = {
      side: Side.SIDE_BUY,
      offset: '10',
      reference: PeggedReference.PEGGED_REFERENCE_MID,
      marketId: 'some-market-id',
    };

    const { getByTestId } = render(<TxOrderPeggedReference {...props} />);

    expect(getByTestId('pegged-reference')).toHaveTextContent('Mid + 10');
  });

  it('should return null if the reference is "PEGGED_REFERENCE_UNSPECIFIED"', () => {
    const props: TxDetailsOrderProps = {
      side: Side.SIDE_BUY,
      offset: '10',
      reference: 'PEGGED_REFERENCE_UNSPECIFIED',
      marketId: 'some-market-id',
    };

    const { container } = render(<TxOrderPeggedReference {...props} />);

    expect(container.firstChild).toBeNull();
  });

  it('should render the offset without formatting initially, then render the formatted version', () => {
    const props: TxDetailsOrderProps = {
      side: Side.SIDE_BUY,
      offset: '10',
      reference: PeggedReference.PEGGED_REFERENCE_BEST_ASK,
      marketId: 'some-market-id',
    };

    (useExplorerMarketQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
    });

    const screen = render(<TxOrderPeggedReference {...props} />);
    expect(screen.getByTestId('pegged-reference')).toHaveTextContent(
      'Ask + 10'
    );

    (useExplorerMarketQuery as jest.Mock).mockReturnValue({
      data: {
        market: {
          decimalPlaces: 10,
        },
      },
      loading: false,
    });

    screen.rerender(<TxOrderPeggedReference {...props} />);
    expect(screen.getByTestId('pegged-reference')).toHaveTextContent(
      'Ask + 0.000000001'
    );
  });
});
