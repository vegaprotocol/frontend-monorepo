import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { generateMockData } from './orderbook-data';
import Orderbook from './orderbook';

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
    window.innerHeight = 231; // 11 rows
    const result = render(
      <Orderbook
        decimalPlaces={decimalPlaces}
        {...generateMockData(params)}
        onResolutionChange={onResolutionChange}
      />
    );
    await waitFor(() => screen.getByTestId('bid-vol-122900'));
    expect(result.getByTestId('scroll').scrollTop).toBe(1911);
  });

  it('should keep mid price row in the middle', async () => {
    window.innerHeight = 231; // 11 rows
    const result = render(
      <Orderbook
        decimalPlaces={decimalPlaces}
        {...generateMockData(params)}
        onResolutionChange={onResolutionChange}
      />
    );
    await waitFor(() => screen.getByTestId('bid-vol-122900'));
    expect(result.getByTestId('scroll').scrollTop).toBe(1911);
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
    await waitFor(() => screen.getByTestId('bid-vol-122900'));
    expect(result.getByTestId('scroll').scrollTop).toBe(1911 - 21);
  });

  it('should scroll to mid price when it will change', async () => {
    window.innerHeight = 231; // 11 rows
    const result = render(
      <Orderbook
        decimalPlaces={decimalPlaces}
        {...generateMockData(params)}
        onResolutionChange={onResolutionChange}
      />
    );
    await waitFor(() => screen.getByTestId('bid-vol-122900'));
    expect(result.getByTestId('scroll').scrollTop).toBe(1911);
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
    await waitFor(() => screen.getByTestId('bid-vol-122900'));
    expect(result.getByTestId('scroll').scrollTop).toBe(1911 - 21);
  });
});
