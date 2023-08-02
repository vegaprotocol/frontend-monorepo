import { Intent } from '@vegaprotocol/ui-toolkit';
import {
  getOrderToastIntent,
  getOrderToastTitle,
  getRejectionReason,
  timeInForceLabel,
} from './utils';
import * as Types from '@vegaprotocol/types';

describe('WithdrawalsTable', () => {
  describe('getOrderToastTitle', () => {
    it('should return the correct title', () => {
      expect(getOrderToastTitle(Types.OrderStatus.STATUS_ACTIVE)).toBe(
        'Order submitted'
      );
      expect(getOrderToastTitle(Types.OrderStatus.STATUS_FILLED)).toBe(
        'Order filled'
      );
      expect(
        getOrderToastTitle(Types.OrderStatus.STATUS_PARTIALLY_FILLED)
      ).toBe('Order partially filled');
      expect(getOrderToastTitle(Types.OrderStatus.STATUS_PARKED)).toBe(
        'Order parked'
      );
      expect(getOrderToastTitle(Types.OrderStatus.STATUS_STOPPED)).toBe(
        'Order stopped'
      );
      expect(getOrderToastTitle(Types.OrderStatus.STATUS_CANCELLED)).toBe(
        'Order cancelled'
      );
      expect(getOrderToastTitle(Types.OrderStatus.STATUS_EXPIRED)).toBe(
        'Order expired'
      );
      expect(getOrderToastTitle(Types.OrderStatus.STATUS_REJECTED)).toBe(
        'Order rejected'
      );
      expect(getOrderToastTitle(undefined)).toBe(undefined);
    });
  });

  describe('getOrderToastIntent', () => {
    it('should return the correct intent', () => {
      expect(getOrderToastIntent(Types.OrderStatus.STATUS_PARKED)).toBe(
        Intent.Warning
      );
      expect(getOrderToastIntent(Types.OrderStatus.STATUS_EXPIRED)).toBe(
        Intent.Warning
      );
      expect(
        getOrderToastIntent(Types.OrderStatus.STATUS_PARTIALLY_FILLED)
      ).toBe(Intent.Warning);
      expect(getOrderToastIntent(Types.OrderStatus.STATUS_REJECTED)).toBe(
        Intent.Danger
      );
      expect(getOrderToastIntent(Types.OrderStatus.STATUS_STOPPED)).toBe(
        Intent.Warning
      );
      expect(getOrderToastIntent(Types.OrderStatus.STATUS_FILLED)).toBe(
        Intent.Success
      );
      expect(getOrderToastIntent(Types.OrderStatus.STATUS_ACTIVE)).toBe(
        Intent.Success
      );
      expect(getOrderToastIntent(Types.OrderStatus.STATUS_CANCELLED)).toBe(
        Intent.Success
      );
      expect(getOrderToastIntent(undefined)).toBe(undefined);
    });
  });

  describe('getRejectionReason', () => {
    it('should return the correct rejection reason for insufficient asset balance', () => {
      expect(
        getRejectionReason({
          rejectionReason:
            Types.OrderRejectionReason.ORDER_ERROR_INSUFFICIENT_ASSET_BALANCE,
          status: Types.OrderStatus.STATUS_REJECTED,
          id: '',
          createdAt: undefined,
          size: '',
          price: '',
          timeInForce: Types.OrderTimeInForce.TIME_IN_FORCE_FOK,
          side: Types.Side.SIDE_BUY,
          marketId: '',
        })
      ).toBe('Insufficient asset balance');
    });

    it('should return the correct rejection reason when order is stopped', () => {
      expect(
        getRejectionReason({
          rejectionReason: null,
          status: Types.OrderStatus.STATUS_STOPPED,
          id: '',
          createdAt: undefined,
          size: '',
          price: '',
          timeInForce: Types.OrderTimeInForce.TIME_IN_FORCE_FOK,
          side: Types.Side.SIDE_BUY,
          marketId: '',
        })
      ).toBe(
        'Your Fill or Kill (FOK) order was not filled and it has been stopped'
      );
    });
  });

  describe('timeInForceLabel', () => {
    it('should return the correct label for time in force', () => {
      expect(timeInForceLabel(Types.OrderTimeInForce.TIME_IN_FORCE_FOK)).toBe(
        `Fill or Kill (FOK)`
      );
      expect(timeInForceLabel(Types.OrderTimeInForce.TIME_IN_FORCE_GTC)).toBe(
        `Good 'til Cancelled (GTC)`
      );
      expect(timeInForceLabel(Types.OrderTimeInForce.TIME_IN_FORCE_IOC)).toBe(
        `Immediate or Cancel (IOC)`
      );
      expect(timeInForceLabel(Types.OrderTimeInForce.TIME_IN_FORCE_GTT)).toBe(
        `Good 'til Time (GTT)`
      );
      expect(timeInForceLabel(Types.OrderTimeInForce.TIME_IN_FORCE_GFA)).toBe(
        `Good for Auction (GFA)`
      );
      expect(timeInForceLabel(Types.OrderTimeInForce.TIME_IN_FORCE_GFN)).toBe(
        `Good for Normal (GFN)`
      );
      expect(timeInForceLabel('')).toBe('');
    });
  });
});
