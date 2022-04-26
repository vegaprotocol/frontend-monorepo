import { BigNumber } from '../../../lib/bignumber';
import { sumCirculatingTokens } from './token-details-circulating';
import type { Tranche } from '@vegaprotocol/smart-contracts-sdk';

test('It sums some easy tranches correctly', () => {
  const tranches: Partial<Tranche>[] = [
    { total_added: new BigNumber('100'), locked_amount: new BigNumber(0) },
    { total_added: new BigNumber('100'), locked_amount: new BigNumber(0) },
    { total_added: new BigNumber('100'), locked_amount: new BigNumber(0) },
  ];

  const result = sumCirculatingTokens(tranches as Tranche[]);
  expect(result.toString()).toEqual('300');
});

test('It sums some longer tranches correctly', () => {
  const tranches: Partial<Tranche>[] = [
    {
      total_added: new BigNumber('10000000000'),
      locked_amount: new BigNumber(0),
    },
    { total_added: new BigNumber('20'), locked_amount: new BigNumber(0) },
    { total_added: new BigNumber('3000'), locked_amount: new BigNumber(3020) },
  ];

  const result = sumCirculatingTokens(tranches as Tranche[]);
  expect(result.toString()).toEqual('10000000000');
});

test('Handles null tranche array', () => {
  const tranches = null;

  const result = sumCirculatingTokens(tranches as unknown as Tranche[]);
  expect(result.toString()).toEqual('0');
});
