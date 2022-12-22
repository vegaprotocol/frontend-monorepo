import { determineId, normalizeOrderSubmission } from './utils';
import type { OrderSubmissionBody } from './connectors/vega-connector';
import * as Schema from '@vegaprotocol/types';
describe('determineId', () => {
  it('produces a known result for an ID', () => {
    const res = determineId(
      'cfe592d169f87d0671dd447751036d0dddc165b9c4b65e5a5060e2bbadd1aa726d4cbe9d3c3b327bcb0bff4f83999592619a2493f9bbd251fae99ce7ce766909'
    );
    expect(res).toStrictEqual(
      '2fca514cebf9f465ae31ecb4c5721e3a6f5f260425ded887ca50ba15b81a5d50'
    );
  });
});

describe('normalizeOrderSubmission', () => {
  it('sets and formats price only for limit orders', () => {
    expect(
      normalizeOrderSubmission(
        { price: '100' } as unknown as OrderSubmissionBody['orderSubmission'],
        2,
        1
      ).price
    ).toBeUndefined();
    expect(
      normalizeOrderSubmission(
        {
          price: '100',
          type: Schema.OrderType.TYPE_LIMIT,
        } as unknown as OrderSubmissionBody['orderSubmission'],
        2,
        1
      ).price
    ).toEqual('10000');
  });

  it('sets and formats expiresAt only for time in force orders', () => {
    expect(
      normalizeOrderSubmission(
        {
          expiresAt: '2022-01-01T00:00:00.000Z',
        } as OrderSubmissionBody['orderSubmission'],
        2,
        1
      ).expiresAt
    ).toBeUndefined();
    expect(
      normalizeOrderSubmission(
        {
          expiresAt: '2022-01-01T00:00:00.000Z',
          timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTT,
        } as OrderSubmissionBody['orderSubmission'],
        2,
        1
      ).expiresAt
    ).toEqual('1640995200000000000');
  });

  it('formats size', () => {
    expect(
      normalizeOrderSubmission(
        {
          size: '100',
        } as OrderSubmissionBody['orderSubmission'],
        2,
        1
      ).size
    ).toEqual('1000');
  });
});
