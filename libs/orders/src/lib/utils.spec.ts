import { timeInForceLabel } from './utils';
import * as Types from '@vegaprotocol/types';

describe('utils', () => {
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
