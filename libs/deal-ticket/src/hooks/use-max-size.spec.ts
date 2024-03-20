import { MarginMode, OrderType, Side } from '@vegaprotocol/types';
import { type UseMaxSizeProps, useMaxSize } from './use-max-size';
import { renderHook } from '@testing-library/react';
import { removeDecimal } from '@vegaprotocol/utils';

describe('useMaxSize', () => {
  const positionDecimalPlaces = 1;
  const decimalPlaces = 2;
  const accountDecimals = 3;
  const initialProps: UseMaxSizeProps = {
    openVolume: '0',
    positionDecimalPlaces,
    generalAccountBalance: removeDecimal('100', accountDecimals),
    side: Side.SIDE_BUY,
    marginMode: MarginMode.MARGIN_MODE_ISOLATED_MARGIN,
    marginFactor: '0.1',
    type: OrderType.TYPE_MARKET,
    marginAccountBalance: '0',
    accountDecimals,
    price: removeDecimal('8', decimalPlaces), // 8.0
    marketPrice: removeDecimal('10', decimalPlaces), // 10.0
    decimalPlaces,
    activeOrders: [],
    riskFactors: {
      long: '0.9',
      short: '0.8',
      market: '',
    },
    scalingFactors: {
      initialMargin: 1.5,
    },
  };

  const renderUseMaxSizeHook = (initialProps: UseMaxSizeProps) =>
    renderHook((props: UseMaxSizeProps) => useMaxSize(props), {
      initialProps,
    });
  describe('in MARGIN_MODE_ISOLATED_MARGIN', () => {
    it('calculates maxSize = collateral / marginFactor / price', () => {
      const { result } = renderUseMaxSizeHook({ ...initialProps });
      // available collateral / marginFactor / price = 100 / 0.1 / 8 = 125
      expect(result.current).toEqual(125);
    });

    it('use only general account balance', () => {
      const { result } = renderUseMaxSizeHook({
        ...initialProps,
        openVolume: removeDecimal('25', positionDecimalPlaces),
        marginAccountBalance: removeDecimal('25', accountDecimals),
        generalAccountBalance: removeDecimal('75', accountDecimals),
      });

      // 75 / 0.1 / 8 = 125
      expect(result.current).toEqual(93.7);
    });

    it('if reduce market order use general and margin account balance', () => {
      const { result } = renderUseMaxSizeHook({
        ...initialProps,
        openVolume: `-${removeDecimal('25', positionDecimalPlaces)}`,
        marginAccountBalance: removeDecimal('25', accountDecimals),
        generalAccountBalance: removeDecimal('75', accountDecimals),
      });
      // ((75 + 25) / 0.1 / 8) + 25 (reduced volume) = 125
      expect(result.current).toEqual(150);
    });

    it('if reduce limit order use only general account balance', () => {
      const { result } = renderUseMaxSizeHook({
        ...initialProps,
        type: OrderType.TYPE_LIMIT,
        openVolume: `-${removeDecimal('25', positionDecimalPlaces)}`,
        marginAccountBalance: removeDecimal('25', accountDecimals),
        generalAccountBalance: removeDecimal('75', accountDecimals),
      });
      // 75 / 0.1 / 8 = 125
      expect(result.current).toEqual(93.7);
    });
  });

  describe('in MARGIN_MODE_CROSS_MARGIN', () => {
    it('calculates maxSize = availableMargin / riskFactor / initialMargin / marketPrice', () => {
      const { result, rerender } = renderUseMaxSizeHook({
        ...initialProps,
        marginMode: MarginMode.MARGIN_MODE_CROSS_MARGIN,
      });
      // available collateral / marginFactor / price = 100 / 0.9 / 1.5 / 10 = 7.4
      expect(result.current).toEqual(7.4);
      rerender({
        ...initialProps,
        marginMode: MarginMode.MARGIN_MODE_CROSS_MARGIN,
        side: Side.SIDE_SELL,
      });
      // available collateral / marginFactor / price = 100 / 0.8 / 1.5 / 10 = 8.3
      expect(result.current).toEqual(8.3);
    });

    it('if increasing position subtract open volume', () => {
      const { result } = renderUseMaxSizeHook({
        ...initialProps,
        marginMode: MarginMode.MARGIN_MODE_CROSS_MARGIN,
        openVolume: removeDecimal('1.8', positionDecimalPlaces),
        marginAccountBalance: removeDecimal('25', accountDecimals),
        generalAccountBalance: removeDecimal('75', accountDecimals),
      });

      // 75 / 0.9 / 1.5 / 10 = 5.6
      expect(result.current).toEqual(5.6);
    });

    it('if reduce market order use add reduced volume', () => {
      const { result } = renderUseMaxSizeHook({
        ...initialProps,
        marginMode: MarginMode.MARGIN_MODE_CROSS_MARGIN,
        openVolume: `-${removeDecimal('1.8', positionDecimalPlaces)}`,
        marginAccountBalance: removeDecimal('25', accountDecimals),
        generalAccountBalance: removeDecimal('75', accountDecimals),
      });
      // ((75 + 25) * 0.9 / 1.5 / 10) + 1.8 (reduced volume) = 9.2
      expect(result.current).toEqual(9.2);
    });

    it("if reduce limit order subtract don't include existing volume", () => {
      const { result } = renderUseMaxSizeHook({
        ...initialProps,
        marginMode: MarginMode.MARGIN_MODE_CROSS_MARGIN,
        type: OrderType.TYPE_LIMIT,
        openVolume: `-${removeDecimal('1.8', positionDecimalPlaces)}`,
        marginAccountBalance: removeDecimal('25', accountDecimals),
        generalAccountBalance: removeDecimal('75', accountDecimals),
      });
      // (75 + 25) / 0.9 / 1.5 / 10 = 5.6
      expect(result.current).toEqual(7.4);
    });

    it('subtracts remaining orders', () => {
      const { result } = renderUseMaxSizeHook({
        ...initialProps,
        marginMode: MarginMode.MARGIN_MODE_CROSS_MARGIN,
        activeOrders: [
          {
            remaining: removeDecimal('0.5', positionDecimalPlaces),
            side: Side.SIDE_SELL,
          },
          {
            remaining: removeDecimal('0.9', positionDecimalPlaces),
            side: Side.SIDE_BUY,
          },
          {
            remaining: removeDecimal('0.9', positionDecimalPlaces),
            side: Side.SIDE_BUY,
          },
        ],
        marginAccountBalance: removeDecimal('25', accountDecimals),
        generalAccountBalance: removeDecimal('75', accountDecimals),
      });
      // ((50 + 50) / 0.9 / 1.5/ 10) - 1.8 = 5.6
      expect(result.current).toEqual(5.6);
    });
  });
});
