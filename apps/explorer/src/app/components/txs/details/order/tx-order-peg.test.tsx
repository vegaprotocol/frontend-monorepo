import { render } from '@testing-library/react';
import type { TxDetailsOrderProps } from './tx-order-peg';
import {
  TxOrderPeggedReference,
  TxOrderPeggedReferenceRow,
  getSettlementAsset,
} from './tx-order-peg';
import { useExplorerMarketQuery } from '../../../links/market-link/__generated__/Market';
import { PeggedReference } from '@vegaprotocol/types';

// Mock the useExplorerMarketQuery hook
jest.mock('../../../links/market-link/__generated__/Market', () => ({
  useExplorerMarketQuery: jest.fn().mockReturnValue({
    data: {},
  }),
}));

describe('getSettlementAsset', () => {
  it('should return the decimal places if data is defined', () => {
    const data = {
      market: {
        decimalPlaces: 8,
      },
    };

    const result = getSettlementAsset(data);

    expect(result).toEqual(8);
  });

  it('should return 0 if data is undefined', () => {
    const result = getSettlementAsset(undefined);

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
      offset: '10',
      reference: PeggedReference.PEGGED_REFERENCE_MID,
      marketId: 'some-market-id',
    };

    const { getByText } = render(<TxOrderPeggedReference {...props} />);

    expect(getByText('10 from Mid')).toBeInTheDocument();
  });

  it('should return null if the reference is "PEGGED_REFERENCE_UNSPECIFIED"', () => {
    const props: TxDetailsOrderProps = {
      offset: '10',
      reference: 'PEGGED_REFERENCE_UNSPECIFIED',
      marketId: 'some-market-id',
    };

    const { container } = render(<TxOrderPeggedReference {...props} />);

    expect(container.firstChild).toBeNull();
  });

  it('should render the offset without formatting initially, then render the formatted version', () => {
    const props: TxDetailsOrderProps = {
      offset: '10',
      reference: PeggedReference.PEGGED_REFERENCE_BEST_ASK,
      marketId: 'some-market-id',
    };

    (useExplorerMarketQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
    });

    const screen = render(<TxOrderPeggedReference {...props} />);
    expect(screen.getByText('10 from Ask')).toBeInTheDocument();

    (useExplorerMarketQuery as jest.Mock).mockReturnValue({
      data: {
        market: {
          decimalPlaces: 10,
        },
      },
      loading: false,
    });

    const screenTwo = render(<TxOrderPeggedReference {...props} />);
    expect(screenTwo.getByText('0.000000001 from Ask')).toBeInTheDocument();
  });
});

describe('TxOrderPeggedReferenceRow', () => {
  it('should render the component correctly', () => {
    // Arrange
    const props = {
      offset: '1',
      reference: PeggedReference.PEGGED_REFERENCE_BEST_BID,
      marketId: '123',
    };

    const screen = render(
      <table>
        <tbody>
          <TxOrderPeggedReferenceRow {...props} />
        </tbody>
      </table>
    );

    // Assert
    expect(screen.getByText('Pegged order')).toBeInTheDocument();
    expect(screen.getByText('1 from Bid')).toBeInTheDocument();
  });
});
