import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { MarketList } from '../markets-container/__generated__/MarketList';
import { SelectMarketList } from './select-market-list';

jest.mock(
  'next/link',
  () =>
    ({ children }: { children: ReactNode }) =>
      children
);

describe('SelectMarketList', () => {
  it('should render', () => {
    const { container } = render(
      <SelectMarketList
        data={mockData.data as MarketList}
        onSelect={jest.fn()}
      />
    );
    expect(screen.getByText('AAPL.MF21')).toBeTruthy();
    expect(screen.getByText('-3.14%')).toBeTruthy();
    expect(container).toHaveTextContent(/141\.75/);
    expect(screen.getByText('Or view full market list')).toBeTruthy();
  });

  it('should call onSelect callback', () => {
    const onSelect = jest.fn();
    const expectedMarket = mockData.data.markets[0];
    render(
      <SelectMarketList
        data={mockData.data as MarketList}
        onSelect={onSelect}
      />
    );
    fireEvent.click(screen.getByTestId(`market-link-${expectedMarket.id}`));
    expect(onSelect).toHaveBeenCalledWith(expectedMarket.id);
  });
});

const mockData = {
  data: {
    markets: [
      {
        __typename: 'Market',
        id: '062ddcb97beae5b7cc4fa20621fe0c83b2a6f7e76cf5b129c6bd3dc14e8111ef',
        decimalPlaces: 2,
        tradableInstrument: {
          __typename: 'TradableInstrument',
          instrument: {
            __typename: 'Instrument',
            name: 'APEUSD (May 2022)',
            code: 'APEUSD',
          },
        },
        marketTimestamps: {
          __typename: 'MarketTimestamps',
          open: '2022-05-18T13:08:27.693537312Z',
          close: null,
        },
        candles: [
          {
            __typename: 'Candle',
            open: '822',
            close: '798',
          },
          {
            __typename: 'Candle',
            open: '793',
            close: '792',
          },
          {
            __typename: 'Candle',
            open: '794',
            close: '776',
          },
          {
            __typename: 'Candle',
            open: '785',
            close: '786',
          },
          {
            __typename: 'Candle',
            open: '803',
            close: '770',
          },
          {
            __typename: 'Candle',
            open: '785',
            close: '774',
          },
        ],
      },
      {
        __typename: 'Market',
        id: '3e6671566ccf5c33702e955fe8b018683fcdb812bfe3ed283fc250bb4f798ff3',
        decimalPlaces: 5,
        tradableInstrument: {
          __typename: 'TradableInstrument',
          instrument: {
            __typename: 'Instrument',
            name: 'Apple Monthly (30 Jun 2022)',
            code: 'AAPL.MF21',
          },
        },
        marketTimestamps: {
          __typename: 'MarketTimestamps',
          open: '2022-05-18T13:00:39.328347732Z',
          close: null,
        },
        candles: [
          {
            __typename: 'Candle',
            open: '14707175',
            close: '14633864',
          },
          {
            __typename: 'Candle',
            open: '14658400',
            close: '14550193',
          },
          {
            __typename: 'Candle',
            open: '14550193',
            close: '14373526',
          },
          {
            __typename: 'Candle',
            open: '14307141',
            close: '14339846',
          },
          {
            __typename: 'Candle',
            open: '14357485',
            close: '14179971',
          },
          {
            __typename: 'Candle',
            open: '14179972',
            close: '14174855',
          },
        ],
      },
    ],
  },
};
