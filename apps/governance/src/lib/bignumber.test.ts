import { BigNumber } from './bignumber';

it('BigNumber wrapper lib sets a known configuration', () => {
  const res = BigNumber.config({});
  // The one value configured by this export
  expect(res.EXPONENTIAL_AT).toStrictEqual([-20000, 20000]);
  // A default value
  expect(res.DECIMAL_PLACES).toStrictEqual(20);
  // A default value: ROUND_HALF_UP
  expect(res.ROUNDING_MODE).toStrictEqual(4);
});
