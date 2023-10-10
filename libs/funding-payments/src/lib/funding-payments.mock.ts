import type {
  FundingPaymentsQuery,
  FundingPaymentFieldsFragment,
} from './__generated__/FundingPayments';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

export const fundingPaymentsQuery = (
  override?: PartialDeep<FundingPaymentsQuery>,
  vegaPublicKey?: string
): FundingPaymentsQuery => {
  const defaultResult: FundingPaymentsQuery = {
    fundingPayments: {
      __typename: 'FundingPaymentConnection',
      edges: fundingPayments(vegaPublicKey).map((node) => ({
        __typename: 'FundingPaymentEdge',
        cursor: '3',
        node,
      })),
      pageInfo: {
        __typename: 'PageInfo',
        startCursor: '1',
        endCursor: '2',
        hasNextPage: false,
        hasPreviousPage: false,
      },
    },
  };

  return merge(defaultResult, override);
};

export const generateFundingPayment = (
  override?: PartialDeep<FundingPaymentFieldsFragment>
) => {
  const defaultFundingPayment: FundingPaymentFieldsFragment = {
    marketId: 'market-0',
    partyId: 'partyId',
    fundingPeriodSeq: 84,
    amount: '126973',
    timestamp: '2023-10-06T07:06:43.020994Z',
  };

  return merge(defaultFundingPayment, override);
};

const fundingPayments = (
  partyId = 'partyId'
): FundingPaymentFieldsFragment[] => [
  generateFundingPayment({
    partyId,
    fundingPeriodSeq: 78,
    amount: '92503',
    timestamp: '2023-10-06T04:06:43.652759Z',
  }),
  generateFundingPayment({
    partyId,
    fundingPeriodSeq: 77,
    amount: '-37841',
    timestamp: '2023-10-06T03:36:43.437139Z',
  }),
  generateFundingPayment({
    partyId,
    fundingPeriodSeq: 76,
    amount: '32838',
    timestamp: '2023-10-06T03:06:43.430384Z',
  }),
  generateFundingPayment({
    partyId,
    fundingPeriodSeq: 75,
    amount: '-298259',
    timestamp: '2023-10-06T02:36:43.51153Z',
  }),
];
