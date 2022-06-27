import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type { Orders, Orders_party_orders } from '@vegaprotocol/order-list';
import { generateOrdersArray } from '@vegaprotocol/order-list';

export const generateOrders = (override?: PartialDeep<Orders>): Orders => {
  const orders: Orders_party_orders[] = generateOrdersArray();

  const defaultResult = {
    party: {
      id: Cypress.env('VEGA_PUBLIC_KEY'),
      orders,
      __typename: 'Party',
    },
  };
  return merge(defaultResult, override);
};
