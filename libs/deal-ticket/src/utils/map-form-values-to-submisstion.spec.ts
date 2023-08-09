import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { mapFormValuesToOrderSubmission } from './map-form-values-to-submission';
import * as Schema from '@vegaprotocol/types';

describe('mapFormValuesToOrderSubmission', () => {
  it('sets and formats price only for limit orders', () => {
    expect(
      mapFormValuesToOrderSubmission(
        { price: '100' } as unknown as OrderSubmissionBody['orderSubmission'],
        'marketId',
        2,
        1
      ).price
    ).toBeUndefined();
    expect(
      mapFormValuesToOrderSubmission(
        {
          price: '100',
          type: Schema.OrderType.TYPE_LIMIT,
        } as unknown as OrderSubmissionBody['orderSubmission'],
        'marketId',
        2,
        1
      ).price
    ).toEqual('10000');
  });

  it('sets and formats expiresAt only for time in force orders', () => {
    expect(
      mapFormValuesToOrderSubmission(
        {
          expiresAt: '2022-01-01T00:00:00.000Z',
        } as OrderSubmissionBody['orderSubmission'],
        'marketId',
        2,
        1
      ).expiresAt
    ).toBeUndefined();
    expect(
      mapFormValuesToOrderSubmission(
        {
          expiresAt: '2022-01-01T00:00:00.000Z',
          timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTT,
        } as OrderSubmissionBody['orderSubmission'],
        'marketId',
        2,
        1
      ).expiresAt
    ).toEqual('1640995200000000000');
  });

  it('formats size', () => {
    expect(
      mapFormValuesToOrderSubmission(
        {
          size: '100',
        } as OrderSubmissionBody['orderSubmission'],
        'marketId',
        2,
        1
      ).size
    ).toEqual('1000');
  });
});
