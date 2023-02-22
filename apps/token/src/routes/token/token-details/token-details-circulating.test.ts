import { BigNumber } from '../../../lib/bignumber';
import { sumCirculatingTokens } from './token-details-circulating';

it('It sums some easy tranches correctly', () => {
  const tranches = [
    { total_added: new BigNumber(100), locked_amount: new BigNumber(0) },
    { total_added: new BigNumber(100), locked_amount: new BigNumber(0) },
    { total_added: new BigNumber(100), locked_amount: new BigNumber(0) },
  ];

  const result = sumCirculatingTokens(tranches);
  expect(result.toString()).toEqual('300');
});

it('It sums some longer tranches correctly', () => {
  const tranches = [
    {
      total_added: new BigNumber(10000000000),
      locked_amount: new BigNumber(0),
    },
    { total_added: new BigNumber(20), locked_amount: new BigNumber(0) },
    { total_added: new BigNumber(3000), locked_amount: new BigNumber(3020) },
  ];

  const result = sumCirculatingTokens(tranches);
  expect(result.toString()).toEqual('10000000000');
});

it('Handles null tranche array', () => {
  const tranches = null;

  const result = sumCirculatingTokens(tranches);
  expect(result.toString()).toEqual('0');
});
