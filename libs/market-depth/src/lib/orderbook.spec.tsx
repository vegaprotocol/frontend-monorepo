import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { generateMockData } from './orderbook-data';
import { Orderbook } from './orderbook';

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
  const onResolutionChange = jest.fn();
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
        onResolutionChange={onResolutionChange}
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
    const result = render(
      <Orderbook
        decimalPlaces={decimalPlaces}
        positionDecimalPlaces={0}
        onClick={onClickSpy}
        {...generateMockData(params)}
        onResolutionChange={onResolutionChange}
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
    await result.rerender(
      <Orderbook
        decimalPlaces={decimalPlaces}
        positionDecimalPlaces={0}
        onClick={onClickSpy}
        {...generateMockData({
          ...params,
          resolution: 10,
        })}
        onResolutionChange={onResolutionChange}
      />
    );
    await fireEvent.click(await screen.getByTestId('price-12294'));
    expect(onResolutionChange.mock.calls[0][0]).toBe(10);
    expect(onClickSpy).toBeCalledWith('122.94');
  });
});
