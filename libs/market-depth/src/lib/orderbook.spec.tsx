import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { generateMockData } from './orderbook-data';
import { Orderbook, rowHeight } from './orderbook';

describe('Orderbook', () => {
  const params = {
    numberOfSellRows: 100,
    numberOfBuyRows: 100,
    midPrice: 122900,
    bestStaticBidPrice: 122905,
    bestStaticOfferPrice: 122895,
    decimalPlaces: 3,
    overlap: 10,
    indicativePrice: 122900,
    indicativeVolume: 11,
    resolution: 1,
  };
  const onResolutionChange = jest.fn();
  const decimalPlaces = 3;
  it('should scroll to mid price on init', async () => {
    window.innerHeight = 11 * rowHeight;
    const result = render(
      <Orderbook
        decimalPlaces={decimalPlaces}
        {...generateMockData(params)}
        onResolutionChange={onResolutionChange}
      />
    );
    await waitFor(() => screen.getByTestId(`bid-vol-${params.midPrice}`));
    expect(result.getByTestId('scroll').scrollTop).toBe(91 * rowHeight);
  });

  it('should keep mid price row in the middle', async () => {
    window.innerHeight = 11 * rowHeight;
    const result = render(
      <Orderbook
        decimalPlaces={decimalPlaces}
        {...generateMockData(params)}
        onResolutionChange={onResolutionChange}
      />
    );
    await waitFor(() => screen.getByTestId(`bid-vol-${params.midPrice}`));
    expect(result.getByTestId('scroll').scrollTop).toBe(91 * rowHeight);
    result.rerender(
      <Orderbook
        decimalPlaces={decimalPlaces}
        {...generateMockData({
          ...params,
          numberOfSellRows: params.numberOfSellRows - 1,
        })}
        onResolutionChange={onResolutionChange}
      />
    );
    await waitFor(() => screen.getByTestId(`bid-vol-${params.midPrice}`));
    expect(result.getByTestId('scroll').scrollTop).toBe(90 * rowHeight);
  });

  it('should scroll to mid price when it will change', async () => {
    window.innerHeight = 11 * rowHeight;
    const result = render(
      <Orderbook
        decimalPlaces={decimalPlaces}
        {...generateMockData(params)}
        onResolutionChange={onResolutionChange}
      />
    );
    await waitFor(() => screen.getByTestId(`bid-vol-${params.midPrice}`));
    expect(result.getByTestId('scroll').scrollTop).toBe(91 * rowHeight);
    result.rerender(
      <Orderbook
        decimalPlaces={decimalPlaces}
        {...generateMockData({
          ...params,
          bestStaticBidPrice: params.bestStaticBidPrice + 1,
          bestStaticOfferPrice: params.bestStaticOfferPrice + 1,
        })}
        onResolutionChange={onResolutionChange}
      />
    );
    await waitFor(() => screen.getByTestId(`bid-vol-${params.midPrice}`));
    expect(result.getByTestId('scroll').scrollTop).toBe(90 * rowHeight);
  });

  it('should should keep price it the middle', async () => {
    window.innerHeight = 11 * rowHeight;
    const result = render(
      <Orderbook
        decimalPlaces={decimalPlaces}
        {...generateMockData(params)}
        onResolutionChange={onResolutionChange}
      />
    );
    await waitFor(() => screen.getByTestId(`bid-vol-${params.midPrice}`));
    const scrollElement = result.getByTestId('scroll');
    expect(scrollElement.scrollTop).toBe(91 * rowHeight);
    scrollElement.scrollTop = 92 * rowHeight;
    fireEvent.scroll(scrollElement);
    result.rerender(
      <Orderbook
        decimalPlaces={decimalPlaces}
        {...generateMockData({
          ...params,
          numberOfSellRows: params.numberOfSellRows - 1,
        })}
        onResolutionChange={onResolutionChange}
      />
    );
    await waitFor(() => screen.getByTestId(`bid-vol-${params.midPrice}`));
    expect(result.getByTestId('scroll').scrollTop).toBe(91 * rowHeight);
  });

  it('should should get back to mid price on click', async () => {
    window.innerHeight = 11 * rowHeight;
    const result = render(
      <Orderbook
        decimalPlaces={decimalPlaces}
        {...generateMockData(params)}
        onResolutionChange={onResolutionChange}
      />
    );
    await waitFor(() => screen.getByTestId(`bid-vol-${params.midPrice}`));
    const scrollElement = result.getByTestId('scroll');
    expect(scrollElement.scrollTop).toBe(91 * rowHeight);
    scrollElement.scrollTop = 0;
    fireEvent.scroll(scrollElement);
    expect(result.getByTestId('scroll').scrollTop).toBe(0);
    const scrollToMidPriceButton = result.getByTestId('scroll-to-midprice');
    fireEvent.click(scrollToMidPriceButton);
    expect(result.getByTestId('scroll').scrollTop).toBe(91 * rowHeight);
  });

  it('should should get back to mid price on resolution change', async () => {
    window.innerHeight = 11 * rowHeight;
    const result = render(
      <Orderbook
        decimalPlaces={decimalPlaces}
        {...generateMockData(params)}
        onResolutionChange={onResolutionChange}
      />
    );
    await waitFor(() => screen.getByTestId(`bid-vol-${params.midPrice}`));
    const scrollElement = result.getByTestId('scroll');
    expect(scrollElement.scrollTop).toBe(91 * rowHeight);
    scrollElement.scrollTop = 0;
    fireEvent.scroll(scrollElement);
    expect(result.getByTestId('scroll').scrollTop).toBe(0);
    const resolutionSelect = result.getByTestId(
      'resolution'
    ) as HTMLSelectElement;
    fireEvent.change(resolutionSelect, { target: { value: '10' } });
    expect(onResolutionChange.mock.calls.length).toBe(1);
    expect(onResolutionChange.mock.calls[0][0]).toBe(10);
    result.rerender(
      <Orderbook
        decimalPlaces={decimalPlaces}
        {...generateMockData({
          ...params,
          resolution: 10,
        })}
        onResolutionChange={onResolutionChange}
      />
    );
    expect(result.getByTestId('scroll').scrollTop).toBe(5 * rowHeight);
  });
});
