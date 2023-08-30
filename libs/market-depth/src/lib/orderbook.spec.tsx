import { render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generateMockData, VolumeType } from './orderbook-data';
import { Orderbook, OrderbookMid } from './orderbook';
import * as orderbookData from './orderbook-data';

function mockOffsetSize(width: number, height: number) {
  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({ height, width }),
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    value: height,
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    value: width,
  });
}

describe('Orderbook', () => {
  const params = {
    numberOfSellRows: 100,
    numberOfBuyRows: 100,
    step: 1,
    lastTradedPrice: '122900',
    bestStaticBidPrice: 122905,
    bestStaticOfferPrice: 122895,
    decimalPlaces: 3,
    overlap: 0,
    resolution: 1,
  };
  const decimalPlaces = 3;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOffsetSize(800, 768);
  });
  it('markPrice should be in the middle', async () => {
    render(
      <Orderbook
        decimalPlaces={decimalPlaces}
        positionDecimalPlaces={0}
        {...generateMockData(params)}
        assetSymbol="USD"
        onClick={jest.fn()}
      />
    );
    await waitFor(() =>
      screen.getByTestId(`last-traded-${params.lastTradedPrice}`)
    );
    expect(
      screen.getByTestId(`last-traded-${params.lastTradedPrice}`)
    ).toHaveTextContent('122.90');
  });

  it('should format correctly the numbers on resolution change', async () => {
    const onClickSpy = jest.fn();
    jest.spyOn(orderbookData, 'compactRows');
    const mockedData = generateMockData(params);
    render(
      <Orderbook
        decimalPlaces={decimalPlaces}
        positionDecimalPlaces={0}
        onClick={onClickSpy}
        {...mockedData}
        assetSymbol="USD"
      />
    );
    expect(
      await screen.findByTestId(`last-traded-${params.lastTradedPrice}`)
    ).toBeInTheDocument();
    // Before resolution change the price is 122.934
    await userEvent.click(screen.getByTestId('price-122901'));
    expect(onClickSpy).toBeCalledWith({ price: '122.901' });

    await userEvent.click(screen.getByTestId('resolution'));

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    await userEvent.click(screen.getAllByRole('menuitem')[1]);

    expect(orderbookData.compactRows).toHaveBeenCalledWith(
      mockedData.bids,
      VolumeType.bid,
      10
    );
    expect(orderbookData.compactRows).toHaveBeenCalledWith(
      mockedData.asks,
      VolumeType.ask,
      10
    );
    await userEvent.click(screen.getByTestId('price-12294'));
    expect(onClickSpy).toBeCalledWith({ price: '122.94' });
  });

  it('plus - minus buttons should change resolution', async () => {
    const onClickSpy = jest.fn();
    jest.spyOn(orderbookData, 'compactRows');
    const mockedData = generateMockData(params);
    render(
      <Orderbook
        decimalPlaces={decimalPlaces}
        positionDecimalPlaces={0}
        onClick={onClickSpy}
        {...mockedData}
        assetSymbol="USD"
      />
    );
    expect((orderbookData.compactRows as jest.Mock).mock.lastCall[2]).toEqual(
      1
    );
    expect(screen.getByTestId('minus-button')).toBeDisabled();
    userEvent.click(screen.getByTestId('plus-button'));
    await waitFor(() => {
      expect((orderbookData.compactRows as jest.Mock).mock.lastCall[2]).toEqual(
        10
      );
    });
    expect(screen.getByTestId('minus-button')).not.toBeDisabled();
    userEvent.click(screen.getByTestId('minus-button'));
    await waitFor(() => {
      expect((orderbookData.compactRows as jest.Mock).mock.lastCall[2]).toEqual(
        1
      );
    });
    expect(screen.getByTestId('minus-button')).toBeDisabled();
    await userEvent.click(screen.getByTestId('resolution'));

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    await userEvent.click(screen.getAllByRole('menuitem')[5]);
    await waitFor(() => {
      expect((orderbookData.compactRows as jest.Mock).mock.lastCall[2]).toEqual(
        100000
      );
    });
    expect(screen.getByTestId('plus-button')).toBeDisabled();
  });

  it('two columns', () => {
    mockOffsetSize(200, 768);
    const onClickSpy = jest.fn();
    const mockedData = generateMockData(params);
    render(
      <Orderbook
        decimalPlaces={decimalPlaces}
        positionDecimalPlaces={0}
        onClick={onClickSpy}
        {...mockedData}
        assetSymbol="USD"
      />
    );
    screen.getAllByTestId('bid-rows-container').forEach((item) => {
      expect(item).toHaveClass('grid-cols-2');
    });
  });

  it('one column', () => {
    mockOffsetSize(140, 768);
    const onClickSpy = jest.fn();
    const mockedData = generateMockData(params);
    render(
      <Orderbook
        decimalPlaces={decimalPlaces}
        positionDecimalPlaces={0}
        onClick={onClickSpy}
        {...mockedData}
        assetSymbol="USD"
      />
    );
    screen.getAllByTestId('ask-rows-container').forEach((item) => {
      expect(item).toHaveClass('grid-cols-1');
    });
  });
});

describe('OrderbookMid', () => {
  const props = {
    lastTradedPrice: '100',
    decimalPlaces: 0,
    assetSymbol: 'BTC',
    bestOffer: '101',
    bestBid: '99',
  };

  it('renders no change until lastTradedPrice changes', () => {
    const { rerender } = render(<OrderbookMid {...props} />);
    expect(screen.getByTestId(/last-traded/)).toHaveTextContent(
      props.lastTradedPrice
    );
    expect(screen.getByText(props.assetSymbol)).toBeInTheDocument();
    expect(screen.queryByTestId(/icon-/)).not.toBeInTheDocument();
    expect(screen.getByTestId('spread')).toHaveTextContent('(2)');

    // rerender with no change should not show the icon
    rerender(<OrderbookMid {...props} />);
    expect(screen.queryByTestId(/icon-/)).not.toBeInTheDocument();

    rerender(<OrderbookMid {...props} lastTradedPrice="101" bestOffer="102" />);
    expect(screen.getByTestId('icon-arrow-up')).toBeInTheDocument();
    expect(screen.getByTestId('spread')).toHaveTextContent('(3)');

    // rerender again with the same price, should still be set to 'up'
    rerender(
      <OrderbookMid
        {...props}
        lastTradedPrice="101"
        bestOffer="102"
        bestBid="98"
      />
    );
    expect(screen.getByTestId('icon-arrow-up')).toBeInTheDocument();
    expect(screen.getByTestId('spread')).toHaveTextContent('(4)');

    rerender(<OrderbookMid {...props} lastTradedPrice="100" />);
    expect(screen.getByTestId('icon-arrow-down')).toBeInTheDocument();
  });
});
