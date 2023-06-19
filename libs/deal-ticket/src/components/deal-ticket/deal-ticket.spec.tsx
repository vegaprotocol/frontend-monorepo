/* eslint-disable @typescript-eslint/no-explicit-any */
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generateMarket, generateMarketData } from '../../test-helpers';
import { DealTicket, normalizeOrderSubmission } from './deal-ticket';
import * as Schema from '@vegaprotocol/types';
import { MockedProvider } from '@apollo/client/testing';
import { addDecimal } from '@vegaprotocol/utils';
import type { OrderObj } from '@vegaprotocol/orders';
import { useOrderStore } from '@vegaprotocol/orders';

jest.mock('zustand');
jest.mock('./deal-ticket-fee-details', () => ({
  DealTicketFeeDetails: () => <div data-testid="deal-ticket-fee-details" />,
}));

const pubKey = 'pubKey';
const market = generateMarket();
const marketData = generateMarketData();
const submit = jest.fn();

function generateJsx() {
  return (
    <MockedProvider>
      <VegaWalletContext.Provider value={{ pubKey, isReadOnly: false } as any}>
        <DealTicket market={market} marketData={marketData} submit={submit} />
      </VegaWalletContext.Provider>
    </MockedProvider>
  );
}

describe('DealTicket', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should display ticket defaults', () => {
    const { container } = render(generateJsx());

    // place order button should always be enabled
    expect(screen.getByTestId('place-order')).toBeEnabled();

    // Assert defaults are used
    expect(
      screen.getByTestId(`order-type-${Schema.OrderType.TYPE_MARKET}`)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`order-type-${Schema.OrderType.TYPE_LIMIT}`)
    ).toBeInTheDocument();

    const oderTypeLimitToggle = container.querySelector(
      `[data-testid="order-type-${Schema.OrderType.TYPE_LIMIT}"] input[type="radio"]`
    );
    expect(oderTypeLimitToggle).toBeChecked();

    expect(
      screen.queryByTestId('order-side-SIDE_BUY')?.querySelector('input')
    ).toBeChecked();
    expect(
      screen.queryByTestId('order-side-SIDE_SELL')?.querySelector('input')
    ).not.toBeChecked();
    expect(screen.getByTestId('order-size')).toHaveDisplayValue('0');
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_GTC
    );
  });

  it('should display last price for market type order', () => {
    render(generateJsx());
    act(() => {
      screen.getByTestId(`order-type-${Schema.OrderType.TYPE_MARKET}`).click();
    });
    // Assert last price is shown
    expect(screen.getByTestId('last-price')).toHaveTextContent(
      // eslint-disable-next-line
      `~${addDecimal(marketData.markPrice, market.decimalPlaces)} ${
        market.tradableInstrument.instrument.product.quoteName
      }`
    );
  });

  it('should use local storage state for initial values', () => {
    const expectedOrder = {
      marketId: market.id,
      type: Schema.OrderType.TYPE_LIMIT,
      side: Schema.Side.SIDE_SELL,
      size: '0.1',
      price: '300.22',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
      persist: true,
    };

    useOrderStore.setState({
      orders: {
        [expectedOrder.marketId]: expectedOrder,
      },
    });

    render(generateJsx());

    // Assert correct defaults are used from store
    expect(
      screen
        .getByTestId(`order-type-${Schema.OrderType.TYPE_LIMIT}`)
        .querySelector('input')
    ).toBeChecked();
    expect(
      screen.queryByTestId('order-side-SIDE_SELL')?.querySelector('input')
    ).toBeChecked();
    expect(
      screen.queryByTestId('order-side-SIDE_BUY')?.querySelector('input')
    ).not.toBeChecked();
    expect(screen.getByTestId('order-size')).toHaveDisplayValue(
      expectedOrder.size
    );
    expect(screen.getByTestId('order-tif')).toHaveValue(
      expectedOrder.timeInForce
    );
    expect(screen.getByTestId('order-price')).toHaveDisplayValue(
      expectedOrder.price
    );
  });

  it('should set values for a non-persistent reduce only order and disable post only checkbox', () => {
    const expectedOrder = {
      marketId: market.id,
      type: Schema.OrderType.TYPE_LIMIT,
      side: Schema.Side.SIDE_SELL,
      size: '0.1',
      price: '300.22',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
      persist: false,
      reduceOnly: true,
      postOnly: false,
    };

    useOrderStore.setState({
      orders: {
        [expectedOrder.marketId]: expectedOrder,
      },
    });

    render(generateJsx());

    // Assert correct defaults are used from store
    expect(
      screen
        .getByTestId(`order-type-${Schema.OrderType.TYPE_LIMIT}`)
        .querySelector('input')
    ).toBeChecked();
    expect(
      screen.queryByTestId('order-side-SIDE_SELL')?.querySelector('input')
    ).toBeChecked();
    expect(
      screen.queryByTestId('order-side-SIDE_BUY')?.querySelector('input')
    ).not.toBeChecked();
    expect(screen.getByTestId('order-size')).toHaveDisplayValue(
      expectedOrder.size
    );
    expect(screen.getByTestId('order-tif')).toHaveValue(
      expectedOrder.timeInForce
    );
    expect(screen.getByTestId('order-price')).toHaveDisplayValue(
      expectedOrder.price
    );
    expect(screen.getByTestId('post-only')).toBeDisabled();
    expect(screen.getByTestId('reduce-only')).toBeEnabled();
    expect(screen.getByTestId('reduce-only')).toBeChecked();
    expect(screen.getByTestId('post-only')).not.toBeChecked();
  });

  it('should set values for a persistent post only order and disable reduce only checkbox', () => {
    const expectedOrder = {
      marketId: market.id,
      type: Schema.OrderType.TYPE_LIMIT,
      side: Schema.Side.SIDE_SELL,
      size: '0.1',
      price: '300.22',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
      persist: true,
      reduceOnly: false,
      postOnly: true,
    };

    useOrderStore.setState({
      orders: {
        [expectedOrder.marketId]: expectedOrder,
      },
    });

    render(generateJsx());

    // Assert correct defaults are used from store
    expect(
      screen
        .getByTestId(`order-type-${Schema.OrderType.TYPE_LIMIT}`)
        .querySelector('input')
    ).toBeChecked();
    expect(
      screen.queryByTestId('order-side-SIDE_SELL')?.querySelector('input')
    ).toBeChecked();
    expect(
      screen.queryByTestId('order-side-SIDE_BUY')?.querySelector('input')
    ).not.toBeChecked();
    expect(screen.getByTestId('order-size')).toHaveDisplayValue(
      expectedOrder.size
    );
    expect(screen.getByTestId('order-tif')).toHaveValue(
      expectedOrder.timeInForce
    );
    expect(screen.getByTestId('order-price')).toHaveDisplayValue(
      expectedOrder.price
    );
    expect(screen.getByTestId('post-only')).toBeEnabled();
    expect(screen.getByTestId('reduce-only')).toBeDisabled();
    expect(screen.getByTestId('post-only')).toBeChecked();
    expect(screen.getByTestId('reduce-only')).not.toBeChecked();
  });

  it('handles TIF select box dependent on order type', async () => {
    render(generateJsx());

    act(() => {
      screen.getByTestId(`order-type-${Schema.OrderType.TYPE_MARKET}`).click();
    });

    // Only FOK and IOC should be present for type market order
    expect(
      Array.from(screen.getByTestId('order-tif').children).map(
        (o) => o.textContent
      )
    ).toEqual(['Fill or Kill (FOK)', 'Immediate or Cancel (IOC)']);

    // IOC should be default
    expect(screen.getByTestId('order-tif')).toHaveDisplayValue(
      'Immediate or Cancel (IOC)'
    );

    // Select FOK - FOK should be selected
    await userEvent.selectOptions(
      screen.getByTestId('order-tif'),
      Schema.OrderTimeInForce.TIME_IN_FORCE_FOK
    );
    expect(screen.getByTestId('order-tif')).toHaveDisplayValue(
      'Fill or Kill (FOK)'
    );

    // Switch to type limit order -> all TIF options should be shown
    await userEvent.click(screen.getByTestId('order-type-TYPE_LIMIT'));
    expect(screen.getByTestId('order-tif').children).toHaveLength(
      Object.keys(Schema.OrderTimeInForce).length
    );

    // expect GTC as LIMIT default
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_GTC
    );

    // Select GTT -> GTT should be selected
    await userEvent.selectOptions(
      screen.getByTestId('order-tif'),
      Schema.OrderTimeInForce.TIME_IN_FORCE_GTT
    );
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_GTT
    );

    // Switch back to type market order -> FOK should be preserved from previous selection
    await userEvent.click(screen.getByTestId('order-type-TYPE_MARKET'));
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_FOK
    );

    // Select IOC -> IOC should be selected
    await userEvent.selectOptions(
      screen.getByTestId('order-tif'),
      Schema.OrderTimeInForce.TIME_IN_FORCE_IOC
    );
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_IOC
    );

    // Switch back type limit order -> GTT should be preserved
    await userEvent.click(screen.getByTestId('order-type-TYPE_LIMIT'));
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_GTT
    );

    // Select GFN -> GFN should be selected
    await userEvent.selectOptions(
      screen.getByTestId('order-tif'),
      Schema.OrderTimeInForce.TIME_IN_FORCE_GFN
    );
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_GFN
    );

    // Switch to type market order -> IOC should be preserved
    await userEvent.click(screen.getByTestId('order-type-TYPE_MARKET'));
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_IOC
    );
  });

  it('can edit deal ticket', async () => {
    render(generateJsx());

    // BUY is selected by default
    expect(
      screen.getByTestId('order-side-SIDE_BUY')?.querySelector('input')
    ).toBeChecked();

    await userEvent.type(screen.getByTestId('order-size'), '200');

    expect(screen.getByTestId('order-size')).toHaveDisplayValue('200');

    await userEvent.selectOptions(
      screen.getByTestId('order-tif'),
      Schema.OrderTimeInForce.TIME_IN_FORCE_IOC
    );
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_IOC
    );

    // Switch to limit order
    await userEvent.click(screen.getByTestId('order-type-TYPE_LIMIT'));

    // Check all TIF options shown
    expect(screen.getByTestId('order-tif').children).toHaveLength(
      Object.keys(Schema.OrderTimeInForce).length
    );
  });

  describe('normalizeOrderSubmission', () => {
    it('sets and formats price only for limit orders', () => {
      expect(
        normalizeOrderSubmission({ price: '100' } as unknown as OrderObj, 2, 1)
          .price
      ).toBeUndefined();
      expect(
        normalizeOrderSubmission(
          {
            price: '100',
            type: Schema.OrderType.TYPE_LIMIT,
          } as unknown as OrderObj,
          2,
          1
        ).price
      ).toEqual('10000');
    });

    it('sets and formats expiresAt only for time in force orders', () => {
      expect(
        normalizeOrderSubmission(
          {
            expiresAt: '2022-01-01T00:00:00.000Z',
          } as OrderObj,
          2,
          1
        ).expiresAt
      ).toBeUndefined();
      expect(
        normalizeOrderSubmission(
          {
            expiresAt: '2022-01-01T00:00:00.000Z',
            timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTT,
          } as OrderObj,
          2,
          1
        ).expiresAt
      ).toEqual(BigInt('1640995200000000000'));
    });

    it('formats size', () => {
      expect(
        normalizeOrderSubmission(
          {
            size: '100',
          } as OrderObj,
          2,
          1
        ).size
      ).toEqual(BigInt('1000'));
    });
  });
});
