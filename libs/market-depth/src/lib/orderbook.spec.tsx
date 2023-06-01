import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { generateMockData } from './orderbook-data';
import { Orderbook, rowHeight } from './orderbook';

describe('Orderbook', () => {
  const params = {
    numberOfSellRows: 100,
    numberOfBuyRows: 100,
    step: 1,
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
    render(
      <Orderbook
        decimalPlaces={decimalPlaces}
        positionDecimalPlaces={0}
        {...generateMockData(params)}
        onResolutionChange={onResolutionChange}
      />
    );
    await waitFor(() => screen.getByTestId(`bid-vol-${params.midPrice}`));
    expect(screen.getByTestId('scroll').scrollTop).toBe(91 * rowHeight);
  });

  it('should keep mid price row in the middle', async () => {
    window.innerHeight = 11 * rowHeight;
    const result = render(
      <Orderbook
        decimalPlaces={decimalPlaces}
        positionDecimalPlaces={0}
        {...generateMockData(params)}
        onResolutionChange={onResolutionChange}
      />
    );
    await waitFor(() => screen.getByTestId(`bid-vol-${params.midPrice}`));
    expect(screen.getByTestId('scroll').scrollTop).toBe(91 * rowHeight);
    result.rerender(
      <Orderbook
        decimalPlaces={decimalPlaces}
        positionDecimalPlaces={0}
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
        positionDecimalPlaces={0}
        {...generateMockData(params)}
        onResolutionChange={onResolutionChange}
      />
    );
    await waitFor(() => screen.getByTestId(`bid-vol-${params.midPrice}`));
    expect(result.getByTestId('scroll').scrollTop).toBe(91 * rowHeight);
    result.rerender(
      <Orderbook
        decimalPlaces={decimalPlaces}
        positionDecimalPlaces={0}
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

  it('should keep price it the middle', async () => {
    window.innerHeight = 11 * rowHeight;
    const result = render(
      <Orderbook
        decimalPlaces={decimalPlaces}
        positionDecimalPlaces={0}
        {...generateMockData(params)}
        onResolutionChange={onResolutionChange}
      />
    );
    await waitFor(() => screen.getByTestId(`bid-vol-${params.midPrice}`));
    const scrollElement = result.getByTestId('scroll');
    expect(scrollElement.scrollTop).toBe(91 * rowHeight);
    scrollElement.scrollTop = 92 * rowHeight + 0.01;
    fireEvent.scroll(scrollElement);
    result.rerender(
      <Orderbook
        decimalPlaces={decimalPlaces}
        positionDecimalPlaces={0}
        {...generateMockData({
          ...params,
          numberOfSellRows: params.numberOfSellRows - 1,
        })}
        onResolutionChange={onResolutionChange}
      />
    );
    await waitFor(() => screen.getByTestId(`bid-vol-${params.midPrice}`));
    expect(screen.getByTestId('scroll').scrollTop).toBe(91 * rowHeight + 0.01);
  });

  it('should get back to mid price on click', async () => {
    window.innerHeight = 11 * rowHeight;
    const result = render(
      <Orderbook
        decimalPlaces={decimalPlaces}
        positionDecimalPlaces={0}
        {...generateMockData(params)}
        onResolutionChange={onResolutionChange}
      />
    );
    await waitFor(() => screen.getByTestId(`bid-vol-${params.midPrice}`));
    const scrollElement = result.getByTestId('scroll');
    expect(scrollElement.scrollTop).toBe(91 * rowHeight);
    scrollElement.scrollTop = 1;
    fireEvent.scroll(scrollElement);
    expect(result.getByTestId('scroll').scrollTop).toBe(1);
    const scrollToMidPriceButton = result.getByTestId('scroll-to-midprice');
    fireEvent.click(scrollToMidPriceButton);
    expect(screen.getByTestId('scroll').scrollTop).toBe(91 * rowHeight + 1);
  });

  it('should get back to mid price on resolution change', async () => {
    window.innerHeight = 11 * rowHeight;
    const result = render(
      <Orderbook
        decimalPlaces={decimalPlaces}
        positionDecimalPlaces={0}
        {...generateMockData(params)}
        onResolutionChange={onResolutionChange}
      />
    );
    await waitFor(() => screen.getByTestId(`bid-vol-${params.midPrice}`));
    const scrollElement = screen.getByTestId('scroll');
    expect(scrollElement.scrollTop).toBe(91 * rowHeight);
    scrollElement.scrollTop = 1;
    fireEvent.scroll(scrollElement);
    expect(screen.getByTestId('scroll').scrollTop).toBe(1);
    const resolutionSelect = screen.getByTestId(
      'resolution'
    ) as HTMLSelectElement;
    fireEvent.change(resolutionSelect, { target: { value: '10' } });
    expect(onResolutionChange.mock.calls.length).toBe(1);
    expect(onResolutionChange.mock.calls[0][0]).toBe(10);
    result.rerender(
      <Orderbook
        decimalPlaces={decimalPlaces}
        positionDecimalPlaces={0}
        {...generateMockData({
          ...params,
          resolution: 10,
        })}
        onResolutionChange={onResolutionChange}
      />
    );
    expect(screen.getByTestId('scroll').scrollTop).toBe(6 * rowHeight);
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
    await fireEvent.click(await screen.getByTestId('price-122934'));
    expect(onClickSpy).toBeCalledWith('122.934');
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
    await fireEvent.click(await screen.getByTestId('price-12299'));
    // After resolution change the price is 122.99
    expect(onResolutionChange.mock.calls[0][0]).toBe(10);
    expect(onClickSpy).toBeCalledWith('122.99');
  });

  it('should have three or four columns', async () => {
    window.innerHeight = 11 * rowHeight;
    const { rerender } = render(
      <Orderbook
        decimalPlaces={decimalPlaces}
        positionDecimalPlaces={0}
        {...generateMockData({
          ...params,
          overlap: 0,
        })}
        onResolutionChange={onResolutionChange}
      />
    );
    await waitFor(() => {
      expect(screen.queryByText('Bid / Ask vol')).toBeInTheDocument();
    });
    rerender(
      <Orderbook
        decimalPlaces={decimalPlaces}
        positionDecimalPlaces={0}
        {...generateMockData(params)}
        onResolutionChange={onResolutionChange}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('Bid vol')).toBeInTheDocument();
      expect(screen.getByText('Ask vol')).toBeInTheDocument();
    });
    await expect(screen.queryByText('Bid / Ask vol')).not.toBeInTheDocument();
  });
});
