import { render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generateMockData, VolumeType } from './orderbook-data';
import { Orderbook } from './orderbook';
import * as orderbookData from './orderbook-data';


let widthMock = 800
const heightMock = 768
function mockOffsetSize() {
  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({ height: heightMock, width: widthMock }),
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    value: heightMock,
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    value: widthMock,
  });
}

describe('Orderbook', () => {
  const params = {
    numberOfSellRows: 100,
    numberOfBuyRows: 100,
    step: 1,
    midPrice: '122900',
    bestStaticBidPrice: 122905,
    bestStaticOfferPrice: 122895,
    decimalPlaces: 3,
    overlap: 0,
    resolution: 1,
  };
  const decimalPlaces = 3;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOffsetSize();
  });
  it('markPrice should be in the middle', async () => {
    render(
      <Orderbook
        decimalPlaces={decimalPlaces}
        positionDecimalPlaces={0}
        {...generateMockData(params)}
        assetSymbol="USD"
      />
    );
    await waitFor(() =>
      screen.getByTestId(`middle-mark-price-${params.midPrice}`)
    );
    expect(
      screen.getByTestId(`middle-mark-price-${params.midPrice}`)
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
      await screen.findByTestId(`middle-mark-price-${params.midPrice}`)
    ).toBeInTheDocument();
    // Before resolution change the price is 122.934
    await userEvent.click(await screen.getByTestId('price-122901'));
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
    await userEvent.click(await screen.getByTestId('price-12294'));
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
    expect((orderbookData.compactRows as jest.Mock).mock.lastCall[2]).toEqual(1);
    expect(screen.getByTestId('minus-button')).toBeDisabled();
    userEvent.click(screen.getByTestId('plus-button'));
    await waitFor(() => {
      expect((orderbookData.compactRows as jest.Mock).mock.lastCall[2]).toEqual(10);
    })
    expect(screen.getByTestId('minus-button')).not.toBeDisabled();
    userEvent.click(screen.getByTestId('minus-button'));
    await waitFor(() => {
      expect((orderbookData.compactRows as jest.Mock).mock.lastCall[2]).toEqual(1);
    })
    expect(screen.getByTestId('minus-button')).toBeDisabled();
    await userEvent.click(screen.getByTestId('resolution'));

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    await userEvent.click(screen.getAllByRole('menuitem')[5]);
    await waitFor(() => {
      expect((orderbookData.compactRows as jest.Mock).mock.lastCall[2]).toEqual(100000);
    });
    expect(screen.getByTestId('plus-button')).toBeDisabled();
  });

});
