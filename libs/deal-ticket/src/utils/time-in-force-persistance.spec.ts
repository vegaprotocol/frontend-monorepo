import { OrderTimeInForce } from '@vegaprotocol/types';
import {
  isNonPersistentOrder,
  isPersistentOrder,
} from './time-in-force-persistance';

it('isNonPeristentOrder', () => {
  expect(isNonPersistentOrder(OrderTimeInForce.TIME_IN_FORCE_FOK)).toBe(true);
  expect(isNonPersistentOrder(OrderTimeInForce.TIME_IN_FORCE_IOC)).toBe(true);
  expect(isNonPersistentOrder(OrderTimeInForce.TIME_IN_FORCE_GTC)).toBe(false);
  expect(isNonPersistentOrder(OrderTimeInForce.TIME_IN_FORCE_GTT)).toBe(false);
  expect(isNonPersistentOrder(OrderTimeInForce.TIME_IN_FORCE_GFA)).toBe(false);
  expect(isNonPersistentOrder(OrderTimeInForce.TIME_IN_FORCE_GFN)).toBe(false);
});

it('isPeristentOrder', () => {
  expect(isPersistentOrder(OrderTimeInForce.TIME_IN_FORCE_FOK)).toBe(false);
  expect(isPersistentOrder(OrderTimeInForce.TIME_IN_FORCE_IOC)).toBe(false);
  expect(isPersistentOrder(OrderTimeInForce.TIME_IN_FORCE_GTC)).toBe(true);
  expect(isPersistentOrder(OrderTimeInForce.TIME_IN_FORCE_GTT)).toBe(true);
  expect(isPersistentOrder(OrderTimeInForce.TIME_IN_FORCE_GFA)).toBe(true);
  expect(isPersistentOrder(OrderTimeInForce.TIME_IN_FORCE_GFN)).toBe(true);
});
