import { update } from './order-data-provider';
import type { OrderUpdateFieldsFragment, OrderFieldsFragment } from '../';
import type { Edge } from '@vegaprotocol/utils';

describe('order data provider', () => {
  it('puts incoming data in proper place', () => {
    const data = [
      {
        node: {
          id: '2',
          createdAt: new Date('2022-01-29').toISOString(),
        },
      },
      {
        node: {
          id: '1',
          createdAt: new Date('2022-01-28').toISOString(),
        },
      },
    ] as Edge<OrderFieldsFragment>[];

    const delta = [
      // this one should be dropped because id don't exits and it's older than newest
      {
        id: '0',
        createdAt: new Date('2022-01-27').toISOString(),
      },
      // this one should be dropped because newer below
      {
        id: '1',
        updatedAt: new Date('2022-02-01').toISOString(),
        createdAt: new Date('2022-01-28').toISOString(),
      },
      {
        id: '1',
        updatedAt: new Date('2022-02-04').toISOString(),
        createdAt: new Date('2022-01-28').toISOString(),
      },
      // this should be added
      {
        id: '4',
        createdAt: new Date('2022-02-04').toISOString(),
      },
      {
        id: '2',
        updatedAt: new Date('2022-02-04').toISOString(),
        createdAt: new Date('2022-01-30').toISOString(),
      },
      // this should be added
      {
        id: '5',
        createdAt: new Date('2022-02-05').toISOString(),
      },
    ] as OrderUpdateFieldsFragment[];
    const updatedData = update(data, delta, () => null, { partyId: '0x123' });
    expect(
      updatedData?.findIndex((edge) => edge.node.id === delta[0].id)
    ).toEqual(-1);
    expect(updatedData && updatedData[3].node.id).toEqual(delta[2].id);
    expect(updatedData && updatedData[3].node.updatedAt).toEqual(
      delta[2].updatedAt
    );
    expect(updatedData && updatedData[0].node.id).toEqual(delta[5].id);
    expect(updatedData && updatedData[1].node.id).toEqual(delta[3].id);
    expect(updatedData && updatedData[2].node.id).toEqual(delta[4].id);
    expect(updatedData && updatedData[2].node.updatedAt).toEqual(
      delta[4].updatedAt
    );
    expect(update([], delta, () => null, { partyId: '0x123' })?.length).toEqual(
      5
    );
  });
  it('add only data matching date range filter', () => {
    const data = [
      {
        node: {
          id: '1',
          createdAt: new Date('2022-01-29').toISOString(),
        },
      },
      {
        node: {
          id: '2',
          createdAt: new Date('2022-01-30').toISOString(),
        },
      },
    ] as Edge<OrderFieldsFragment>[];

    const delta = [
      // this one should be ignored because it does not match date range
      {
        id: '0',
        createdAt: new Date('2022-02-02').toISOString(),
      },
      // this one should be updated
      {
        id: '2',
        updatedAt: new Date('2022-01-31').toISOString(),
        createdAt: new Date('2022-01-30').toISOString(),
      },
      // this should be added
      {
        id: '4',
        createdAt: new Date('2022-01-31').toISOString(),
      },
    ] as OrderUpdateFieldsFragment[];

    const updatedData = update(data, delta, () => null, {
      partyId: '0x123',
      filter: {
        dateRange: { end: new Date('2022-02-01').toISOString() },
      },
    });
    expect(
      updatedData?.findIndex((edge) => edge.node.id === delta[0].id)
    ).toEqual(-1);
    expect(updatedData && updatedData[0].node.id).toEqual(delta[2].id);
    expect(updatedData && updatedData[0].node.updatedAt).toEqual(
      delta[2].updatedAt
    );
    expect(updatedData && updatedData[2].node.id).toEqual(delta[1].id);
    expect(updatedData && updatedData[2].node.updatedAt).toEqual(
      delta[1].updatedAt
    );
  });
});
