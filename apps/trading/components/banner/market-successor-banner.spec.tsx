import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/react-testing';
import * as dataProviders from '@vegaprotocol/data-provider';
import { MarketSuccessorBanner } from './market-successor-banner';
import * as Types from '@vegaprotocol/types';
import * as allUtils from '@vegaprotocol/utils';
import * as marketsTools from '@vegaprotocol/markets';
import type { Market } from '@vegaprotocol/markets';
import type { PartialDeep } from 'type-fest';

let mockLocations = {};
let mockParams = {};
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(() => mockLocations),
  useParams: jest.fn(() => mockParams),
}));

let mockDataMarket: PartialDeep<Market> | null = null;
let mockDataSuccessorMarket: PartialDeep<Market> | null = null;
jest.mock('@vegaprotocol/data-provider', () => ({
  ...jest.requireActual('@vegaprotocol/data-provider'),
  useDataProvider: jest.fn().mockImplementation((args) => {
    if (args.variables.marketId === 'marketId') {
      return {
        data: mockDataMarket,
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
  useCandles: () => mockCandles,
}));

describe('MarketSuccessorBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('should be hidden', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('on other pages than market', () => {
      mockLocations = { pathname: '/portfolio' };
      const { container } = render(<MarketSuccessorBanner />, {
        wrapper: MockedProvider,
      });
      expect(container).toBeEmptyDOMElement();
    });
    it('on markets page', () => {
      mockLocations = { pathname: '/markets/all' };
      const { container } = render(<MarketSuccessorBanner />, {
        wrapper: MockedProvider,
      });
      expect(container).toBeEmptyDOMElement();
    });
    it('when no marketID', () => {
      mockLocations = { pathname: '/markets/marketId' };
      const { container } = render(<MarketSuccessorBanner />, {
        wrapper: MockedProvider,
      });
      expect(container).toBeEmptyDOMElement();
    });

    it('when no successorMarketID', () => {
      mockLocations = { pathname: '/markets/marketId' };
      mockParams = { marketId: 'marketId' };
      mockDataMarket = {
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
      };

      const { container } = render(<MarketSuccessorBanner />, {
        wrapper: MockedProvider,
      });
      expect(container).toBeEmptyDOMElement();
      expect(dataProviders.useDataProvider).nthCalledWith(
        1,
        expect.objectContaining({
          variables: { marketId: 'marketId' },
          skip: false,
        })
      );
      expect(dataProviders.useDataProvider).lastCalledWith(
        expect.objectContaining({ skip: true })
      );
    });

    it('no successor market data', () => {
      mockLocations = { pathname: '/markets/marketId' };
      mockParams = { marketId: 'marketId' };
      mockDataMarket = {
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
        successorMarketID: 'successorMarketID',
      };
      const { container } = render(<MarketSuccessorBanner />, {
        wrapper: MockedProvider,
      });
      expect(container).toBeEmptyDOMElement();
      expect(dataProviders.useDataProvider).nthCalledWith(
        1,
        expect.objectContaining({
          variables: { marketId: 'marketId' },
          skip: false,
        })
      );
      expect(dataProviders.useDataProvider).lastCalledWith(
        expect.objectContaining({
          variables: { marketId: 'successorMarketID' },
          skip: false,
        })
      );
    });

    it('successor market not in continuous mode', () => {
      mockLocations = { pathname: '/markets/marketId' };
      mockParams = { marketId: 'marketId' };
      mockDataMarket = {
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
        successorMarketID: 'successorMarketID',
      };
      mockDataSuccessorMarket = {
        id: 'successorMarketID',
        state: Types.MarketState.STATE_ACTIVE,
        tradingMode: Types.MarketTradingMode.TRADING_MODE_NO_TRADING,
      };
      jest.spyOn(allUtils, 'getMarketExpiryDate');
      const { container } = render(<MarketSuccessorBanner />, {
        wrapper: MockedProvider,
      });
      expect(container).toBeEmptyDOMElement();
      expect(dataProviders.useDataProvider).nthCalledWith(
        1,
        expect.objectContaining({
          variables: { marketId: 'marketId' },
          skip: false,
        })
      );
      expect(dataProviders.useDataProvider).lastCalledWith(
        expect.objectContaining({
          variables: { marketId: 'successorMarketID' },
          skip: false,
        })
      );
      expect(allUtils.getMarketExpiryDate).toHaveBeenCalled();
    });

    it('successor market is not active', () => {
      mockLocations = { pathname: '/markets/marketId' };
      mockParams = { marketId: 'marketId' };
      mockDataMarket = {
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
        successorMarketID: 'successorMarketID',
      };
      mockDataSuccessorMarket = {
        id: 'successorMarketID',
        state: Types.MarketState.STATE_PENDING,
        tradingMode: Types.MarketTradingMode.TRADING_MODE_CONTINUOUS,
      };
      jest.spyOn(allUtils, 'getMarketExpiryDate');
      const { container } = render(<MarketSuccessorBanner />, {
        wrapper: MockedProvider,
      });
      expect(container).toBeEmptyDOMElement();
      expect(dataProviders.useDataProvider).nthCalledWith(
        1,
        expect.objectContaining({
          variables: { marketId: 'marketId' },
          skip: false,
        })
      );
      expect(dataProviders.useDataProvider).lastCalledWith(
        expect.objectContaining({
          variables: { marketId: 'successorMarketID' },
          skip: false,
        })
      );
      expect(allUtils.getMarketExpiryDate).toHaveBeenCalled();
    });
  });

  describe('should be displayed', () => {
    beforeAll(() => {
      mockLocations = { pathname: '/markets/marketId' };
      mockParams = { marketId: 'marketId' };
      mockDataMarket = {
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
        successorMarketID: 'successorMarketID',
      };
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
    it('should be rendered', () => {
      render(<MarketSuccessorBanner />, {
        wrapper: MockedProvider,
      });
      expect(
        screen.getByText('This market has been succeeded')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Successor Market Name' })
      ).toHaveAttribute('href', '/markets/successorMarketID');
    });

    it('should display optionally successor volume ', () => {
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

      const { container, debug } = render(<MarketSuccessorBanner />, {
        wrapper: MockedProvider,
      });
      debug(container);
      expect(screen.getByText('has 101.367 24h vol.')).toBeInTheDocument();
    });

    it('should display optionally duration', () => {
      jest
        .spyOn(allUtils, 'getMarketExpiryDate')
        .mockReturnValue(new Date(Date.now() - 24 * 60 * 60 * 1000));
      const { container, debug } = render(<MarketSuccessorBanner />, {
        wrapper: MockedProvider,
      });
      debug(container);
      expect(
        screen.getByText('This market expires in 1 day.')
      ).toBeInTheDocument();
    });
  });
});
