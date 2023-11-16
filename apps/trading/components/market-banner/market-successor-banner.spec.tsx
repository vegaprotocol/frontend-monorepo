import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/react-testing';
import { MarketSuccessorBanner } from './market-successor-banner';
import * as Types from '@vegaprotocol/types';
import * as allUtils from '@vegaprotocol/utils';
import type { Market } from '@vegaprotocol/markets';
import type { PartialDeep } from 'type-fest';

const market = {
  id: 'marketId',
  tradableInstrument: {
    instrument: {
      metadata: {
        tags: [],
      },
    },
  },
  marketTimestamps: {
    close: null,
  },
} as unknown as Market;

let mockDataSuccessorMarket: PartialDeep<Market> | null = null;
let mockDataMarketState: Market['state'] | null = null;
jest.mock('@vegaprotocol/data-provider', () => ({
  ...jest.requireActual('@vegaprotocol/data-provider'),
  useDataProvider: jest.fn().mockImplementation((args) => {
    if (args.skip) {
      return {
        data: null,
        error: null,
      };
    }
    return {
      data: mockDataSuccessorMarket,
      error: null,
    };
  }),
}));
jest.mock('@vegaprotocol/utils', () => ({
  ...jest.requireActual('@vegaprotocol/utils'),
  getMarketExpiryDate: jest.fn(),
}));
let mockCandles = {};
jest.mock('@vegaprotocol/markets', () => ({
  ...jest.requireActual('@vegaprotocol/markets'),
  useMarketState: (marketId: string) =>
    marketId
      ? {
          data: mockDataMarketState,
        }
      : { data: undefined },
  useSuccessorMarket: (marketId: string) =>
    marketId
      ? {
          data: mockDataSuccessorMarket,
        }
      : { data: undefined },
  useCandles: () => mockCandles,
}));

describe('MarketSuccessorBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDataSuccessorMarket = {
      id: 'successorMarketID',
      state: Types.MarketState.STATE_ACTIVE,
      tradingMode: Types.MarketTradingMode.TRADING_MODE_CONTINUOUS,
      tradableInstrument: {
        instrument: {
          name: 'Successor Market Name',
        },
      },
    };
  });
  describe('should be hidden', () => {
    it('when no market', () => {
      const { container } = render(<MarketSuccessorBanner market={null} />, {
        wrapper: MockedProvider,
      });
      expect(container).toBeEmptyDOMElement();
    });

    it('no successor market data', () => {
      mockDataSuccessorMarket = null;
      const { container } = render(<MarketSuccessorBanner market={market} />, {
        wrapper: MockedProvider,
      });
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('should be displayed', () => {
    it('should be rendered', () => {
      render(<MarketSuccessorBanner market={market} />, {
        wrapper: MockedProvider,
      });
      expect(
        screen.getByText('This market has been succeeded')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Successor Market Name' })
      ).toHaveAttribute('href', '/#/markets/successorMarketID');
    });

    it('no successor market data, market settled', () => {
      mockDataSuccessorMarket = null;
      mockDataMarketState = Types.MarketState.STATE_SETTLED;
      render(<MarketSuccessorBanner market={market} />, {
        wrapper: MockedProvider,
      });
      expect(
        screen.getByText('This market has been settled')
      ).toBeInTheDocument();
    });

    it('should display optionally successor volume', () => {
      mockDataSuccessorMarket = {
        ...mockDataSuccessorMarket,
        positionDecimalPlaces: 3,
      };
      mockCandles = {
        oneDayCandles: [
          { volume: 123 },
          { volume: 456 },
          { volume: 789 },
          { volume: 99999 },
        ],
      };

      render(<MarketSuccessorBanner market={market} />, {
        wrapper: MockedProvider,
      });
      expect(
        screen.getByText('has a 24h trading volume of 101.367', {
          exact: false,
        })
      ).toBeInTheDocument();
    });

    it('should display optionally duration', () => {
      jest
        .spyOn(allUtils, 'getMarketExpiryDate')
        .mockReturnValue(
          new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 1000)
        );
      render(<MarketSuccessorBanner market={market} />, {
        wrapper: MockedProvider,
      });
      expect(
        screen.getByText(/^This market expires in 1 day/)
      ).toBeInTheDocument();
    });
  });
});
