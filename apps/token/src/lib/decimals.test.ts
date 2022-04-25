import { BigNumber } from "./bignumber";
import {addDecimal, removeDecimal} from "./decimals";

test('Do not pad numbers with 0s when the number length is less than the specified DPs', () => {
  expect(addDecimal(new BigNumber(10000), 10)).toEqual("0.000001");
})

test('Handles large numbers correctly', () => {
  const claimCode = new BigNumber("20000000000000000000000000")
  const decimals = 18

  const decimalised = addDecimal(claimCode, decimals)
  expect(decimalised.toString()).toEqual("20000000");

  const undecimalised = removeDecimal(claimCode, decimals)
  expect(undecimalised.toString()).toEqual("20000000000000000000000000000000000000000000");

  const mangled = removeDecimal(new BigNumber(addDecimal(claimCode, decimals)), decimals)
  expect(mangled.toString()).toEqual("20000000000000000000000000")
})
