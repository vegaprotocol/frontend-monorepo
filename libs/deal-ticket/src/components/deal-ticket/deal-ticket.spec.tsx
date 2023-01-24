/* eslint-disable @typescript-eslint/no-explicit-any */
import { VegaWalletContext } from '@vegaprotocol/wallet';
import {
  fireEvent,
  render,
  screen,
  act,
  waitFor,
} from '@testing-library/react';
import { generateMarket } from '../../test-helpers';
import { DealTicket } from './deal-ticket';
import * as Schema from '@vegaprotocol/types';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type { ChainIdQuery } from '@vegaprotocol/react-helpers';
import { ChainIdDocument, addDecimal } from '@vegaprotocol/react-helpers';
import * as utils from '../../utils';

let mockHasNoBalance = false;
jest.mock('../../hooks/use-has-no-balance', () => {
  return {
    useHasNoBalance: () => mockHasNoBalance,
  };
});

const market = generateMarket();
const submit = jest.fn();

const mockChainId = 'chain-id';

function generateJsx(order?: OrderSubmissionBody['orderSubmission']) {
  const chainIdMock: MockedResponse<ChainIdQuery> = {
    request: {
      query: ChainIdDocument,
    },
    result: {
      data: {
        statistics: {
          chainId: mockChainId,
        },
      },
    },
  };
  return (
    <MockedProvider mocks={[chainIdMock]}>
      <VegaWalletContext.Provider value={{ pubKey: mockChainId } as any}>
        <DealTicket market={market} submit={submit} />
      </VegaWalletContext.Provider>
    </MockedProvider>
  );
}

describe('DealTicket', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  afterEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it('should display ticket defaults', () => {
    render(generateJsx());

    // Assert defaults are used
    expect(
      screen.getByTestId(`order-type-${Schema.OrderType.TYPE_MARKET}`)
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('order-side-SIDE_BUY')?.querySelector('input')
    ).toBeChecked();
    expect(
      screen.queryByTestId('order-side-SIDE_SELL')?.querySelector('input')
    ).not.toBeChecked();
    expect(screen.getByTestId('order-size')).toHaveDisplayValue(
      String(1 / Math.pow(10, market.positionDecimalPlaces))
    );
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_IOC
    );

    // Assert last price is shown
    expect(screen.getByTestId('last-price')).toHaveTextContent(
      // eslint-disable-next-line
      `~${addDecimal(market!.data.markPrice, market.decimalPlaces)} ${
        market.tradableInstrument.instrument.product.settlementAsset.symbol
      }`
    );
  });

  it('handles TIF select box dependent on order type', () => {
    render(generateJsx());

    // Only FOK and IOC should be present by default (type market order)
    expect(
      Array.from(screen.getByTestId('order-tif').children).map(
        (o) => o.textContent
      )
    ).toEqual(['Fill or Kill (FOK)', 'Immediate or Cancel (IOC)']);

    // Switch to type limit order -> all TIF options should be shown
    fireEvent.click(screen.getByTestId('order-type-TYPE_LIMIT'));
    expect(screen.getByTestId('order-tif').children).toHaveLength(
      Object.keys(Schema.OrderTimeInForce).length
    );

    // Select GTC -> GTC should be selected
    fireEvent.change(screen.getByTestId('order-tif'), {
      target: { value: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC },
    });
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_GTC
    );

    // Switch to type market order -> IOC should be selected (default)
    fireEvent.click(screen.getByTestId('order-type-TYPE_MARKET'));
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_IOC
    );

    // Select IOC -> IOC should be selected
    fireEvent.change(screen.getByTestId('order-tif'), {
      target: { value: Schema.OrderTimeInForce.TIME_IN_FORCE_IOC },
    });
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_IOC
    );

    // Switch to type limit order -> GTC should be selected
    fireEvent.click(screen.getByTestId('order-type-TYPE_LIMIT'));
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_GTC
    );

    // Select GTT -> GTT should be selected
    fireEvent.change(screen.getByTestId('order-tif'), {
      target: { value: Schema.OrderTimeInForce.TIME_IN_FORCE_GTT },
    });
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_GTT
    );

    // Switch to type market order -> IOC should be selected
    fireEvent.click(screen.getByTestId('order-type-TYPE_MARKET'));
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_IOC
    );
  });

  it('validation should be reset', async () => {
    mockHasNoBalance = true;
    jest.spyOn(utils, 'validateMarketState').mockReturnValue('Wrong state');
    jest
      .spyOn(utils, 'validateMarketTradingMode')
      .mockReturnValue('Wrong trading mode');
    const { rerender } = render(generateJsx());

    await act(async () => {
      fireEvent.click(screen.getByTestId('place-order'));
    });
    await waitFor(async () => {
      expect(
        await screen.getByTestId('dealticket-error-message-summary')
      ).toHaveTextContent('Wrong state');
    });

    jest.spyOn(utils, 'validateMarketState').mockReturnValue(true);
    await act(async () => {
      rerender(generateJsx());
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('place-order'));
    });
    await waitFor(async () => {
      expect(
        await screen.getByTestId('dealticket-error-message-zero-balance')
      ).toHaveTextContent('Insufficient balance.');
    });

    mockHasNoBalance = false;
    await act(async () => {
      rerender(generateJsx());
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('place-order'));
    });
    await waitFor(async () => {
      expect(
        await screen.getByTestId('dealticket-error-message-summary')
      ).toHaveTextContent('Wrong trading mode');
    });
  });

  it('can edit deal ticket', async () => {
    render(generateJsx());

    // BUY is selected by default
    expect(
      screen.getByTestId('order-side-SIDE_BUY')?.querySelector('input')
    ).toBeChecked();

    await act(async () => {
      fireEvent.change(screen.getByTestId('order-size'), {
        target: { value: '200' },
      });
    });

    expect(screen.getByTestId('order-size')).toHaveDisplayValue('200');

    fireEvent.change(screen.getByTestId('order-tif'), {
      target: { value: Schema.OrderTimeInForce.TIME_IN_FORCE_IOC },
    });
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_IOC
    );

    // Switch to limit order
    fireEvent.click(screen.getByTestId('order-type-TYPE_LIMIT'));

    // Check all TIF options shown
    expect(screen.getByTestId('order-tif').children).toHaveLength(
      Object.keys(Schema.OrderTimeInForce).length
    );
  });
});
