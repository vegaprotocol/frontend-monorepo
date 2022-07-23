import { update } from './order-data-provider';
import type { OrderSub_orders, Orders_party_ordersConnection_edges } from '../';
describe('order data provider', () => {
  it('puts incoming data in proper place', () => {
    const data = [
      {
        node: {
          id: '1',
          updatedAt: new Date('2022-01-31').toISOString(),
          createdAt: new Date('2022-01-29').toISOString(),
        },
      },
      {
        node: {
          id: '2',
          createdAt: new Date('2022-01-30').toISOString(),
        },
      },
    ] as Orders_party_ordersConnection_edges[];

    const delta = [
      // this one should be dropped because id don't exits and it's older than newest
      {
        id: '0',
        createdAt: new Date('2022-01-30').toISOString(),
      },
      // this one should be dropped because new newer below
      {
        id: '1',
        updatedAt: new Date('2022-02-01').toISOString(),
        createdAt: new Date('2022-01-29').toISOString(),
      },
      {
        id: '1',
        updatedAt: new Date('2022-02-02').toISOString(),
        createdAt: new Date('2022-01-29').toISOString(),
      },
      // this should be added
      {
        id: '4',
        createdAt: new Date('2022-02-04').toISOString(),
      },
      // this should be move to top
      {
        id: '2',
        updatedAt: new Date('2022-02-03').toISOString(),
        createdAt: new Date('2022-01-29').toISOString(),
      },
    ] as OrderSub_orders[];

    const updatedData = update(data, delta);
    expect(updatedData.findIndex((edge) => edge.node === delta[0])).toEqual(-1);
    expect(updatedData[2].node.id).toEqual(delta[2].id);
    expect(updatedData[2].node.updatedAt).toEqual(delta[2].updatedAt);
    expect(updatedData[0].node).toEqual(delta[3]);
    expect(updatedData[1].node.id).toEqual(delta[4].id);
    expect(updatedData[1].node.updatedAt).toEqual(delta[4].updatedAt);
  });
});
