import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { generateMockData, VolumeType } from './orderbook-data';
import { Orderbook } from './orderbook';
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
    midPrice: 122900,
    markPrice: '122900',
    bestStaticBidPrice: 122905,
    bestStaticOfferPrice: 122895,
    decimalPlaces: 3,
    overlap: 0,
    resolution: 1,
  };
  const decimalPlaces = 3;

  beforeEach(() => {
    mockOffsetSize(800, 768);
  });
  it('markPrice should be in the middle', async () => {
    render(
      <Orderbook
        decimalPlaces={decimalPlaces}
        positionDecimalPlaces={0}
        {...generateMockData(params)}
      />
    );
    await waitFor(() =>
      screen.getByTestId(`middle-mark-price-${params.markPrice}`)
    );
    expect(
      screen.getByTestId(`middle-mark-price-${params.markPrice}`)
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
      />
    );
    expect(
      await screen.findByTestId(`bid-vol-${params.midPrice}`)
    ).toBeInTheDocument();
    // Before resolution change the price is 122.934
    await fireEvent.click(await screen.getByTestId('price-122901'));
    expect(onClickSpy).toBeCalledWith('122.901');
    const resolutionSelect = screen.getByTestId(
      'resolution'
    ) as HTMLSelectElement;
    await fireEvent.change(resolutionSelect, { target: { value: '10' } });
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
    await fireEvent.click(await screen.getByTestId('price-12294'));
    expect(onClickSpy).toBeCalledWith('122.94');
  });
});
