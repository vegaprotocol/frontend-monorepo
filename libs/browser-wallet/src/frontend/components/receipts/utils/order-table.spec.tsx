import { render, screen } from '@testing-library/react';
import { OrderStatus as vegaOrderStatus } from '@vegaprotocol/enums';
import {
  OrderType as vegaOrderType,
  PeggedReference as vegaPeggedReference,
  Side as vegaSide,
} from '@vegaprotocol/enums';
import { truncateMiddle } from '@vegaprotocol/ui-toolkit';

import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';
import { useAssetsStore } from '@/stores/assets-store';
import { useMarketsStore } from '@/stores/markets-store';
import { generateAsset } from '@/test-helpers/generate-asset';
import { generateMarket } from '@/test-helpers/generate-market';
import { mockStore } from '@/test-helpers/mock-store';

import { locators as dataTableLocators } from '../../data-table';
import { OrderTable, OrderTableProperties } from './order-table';

jest.mock('@/stores/markets-store', () => ({
  ...jest.requireActual('@/stores/markets-store'),
  useMarketsStore: jest.fn(() => {
    return {
      loading: false,
      markets: [],
      getMarketById: jest.fn(),
    };
  }),
}));
jest.mock('@/stores/assets-store');

const renderComponent = (properties: OrderTableProperties) =>
  render(
    <MockNetworkProvider>
      <OrderTable {...properties} />
    </MockNetworkProvider>
  );

// refactor store mocks to use new mocking component when available
describe('OrderTable', () => {
  const mockMarket = generateMarket();
  const mockAsset = generateAsset();

  beforeEach(() => {
    mockStore(useMarketsStore, {
      loading: true,
      markets: [],
      getMarketById: jest.fn().mockReturnValue(mockMarket),
    });
    mockStore(useAssetsStore, {
      loading: true,
      assets: [],
      getAssetById: jest.fn().mockReturnValue(mockAsset),
    });
  });

  it('renders a row for each property', () => {
    // 1130-ODTB-001 I can see the market id of the order I am submitting
    // 1130-ODTB-002 I can see the direction of order I am submitting
    // 1130-ODTB-003 I can see the type of the order I am submitting
    // 1130-ODTB-004 I can see the reference of the order I am submitting
    // 1130-ODTB-005 I can see any relevant [order badges](./1119-ORBD-order_badges.md)
    // 1130-ODTB-006 I can see the [price of the order with tooltip](./1127-DECM-decimal_numbers.md)
    // 1130-ODTB-007 I can see the [size of the order with tooltip](./1127-DECM-decimal_numbers.md)
    // 1130-ODTB-008 I can see the raw offset price of the order
    // 1130-ODTB-009 I can see the reference price of the order

    // 1117-ORDC-001 If present I can see the market id relating to the order
    // 1117-ORDC-002 If present I can see the order id relating to the order

    // 1116-ORDA-001 I can see the order id of the order I am amending
    // 1116-ORDA-002 I can see the market id relating to the order I am amending
    renderComponent({
      side: vegaSide.SIDE_BUY,
      marketId: '1'.repeat(64),
      orderId: '2'.repeat(64),
      size: '12',
      price: '123',
      reference: 'ref',
      type: vegaOrderType.TYPE_LIMIT,
      peggedOrder: {
        reference: vegaPeggedReference.PEGGED_REFERENCE_BEST_BID,
        offset: '6',
      },
      icebergOpts: {
        minimumVisibleSize: '1',
        peakSize: '2',
      },
    });

    const [
      priceRow,
      peggedInfoRow,
      sizeRow,
      marketRow,
      marketIdRow,
      orderRow,
      directionRow,
      typeRow,
      referenceRow,
      icebergPeakRow,
      icebergMinRow,
    ] = screen.getAllByTestId(dataTableLocators.dataRow);
    expect(priceRow).toHaveTextContent('Price');
    expect(priceRow).toHaveTextContent('123');

    expect(peggedInfoRow).toHaveTextContent('6');
    expect(peggedInfoRow).toHaveTextContent('from best bid');

    expect(sizeRow).toHaveTextContent('Size');
    expect(sizeRow).toHaveTextContent('12');

    expect(marketRow).toHaveTextContent('Market');
    expect(marketRow).toHaveTextContent(truncateMiddle('1'.repeat(64)));

    expect(marketIdRow).toHaveTextContent('Market Id');
    expect(marketIdRow).toHaveTextContent(truncateMiddle('1'.repeat(64)));

    expect(orderRow).toHaveTextContent('Order');
    expect(orderRow).toHaveTextContent(truncateMiddle('2'.repeat(64)));

    expect(directionRow).toHaveTextContent('Side');
    expect(directionRow).toHaveTextContent('Long');

    expect(typeRow).toHaveTextContent('Type');
    expect(typeRow).toHaveTextContent('Limit');

    expect(referenceRow).toHaveTextContent('Reference');
    expect(referenceRow).toHaveTextContent('ref');

    expect(icebergPeakRow).toHaveTextContent('Peak size');
    expect(icebergPeakRow).toHaveTextContent('2');

    expect(icebergMinRow).toHaveTextContent('Minimum visible size');
    expect(icebergMinRow).toHaveTextContent('1');
    expect(screen.getAllByTestId(dataTableLocators.dataRow)).toHaveLength(11);
  });

  it('renders fields that are provided from the API', () => {
    // 1130-ODTB-014 If applicable I can see the time the order was created at
    // 1130-ODTB-015 If applicable I can see the time the order was updated at
    // 1130-ODTB-016 If applicable I can see the size of the order remaining
    // 1130-ODTB-017 If applicable I can see the version of the order
    // 1130-ODTB-018 If applicable I can see the status of the order
    renderComponent({
      marketId: '123',
      createdAt: '1000000000000',
      updatedAt: '1000000000000',
      remaining: '100',
      version: '1',
      status: vegaOrderStatus.STATUS_ACTIVE,
    });

    // Skip market row, as asserted above
    // eslint-disable-next-line unicorn/no-unreadable-array-destructuring
    const [
      ,
      ,
      createdAtRow,
      updatedAtRow,
      remainingRow,
      statusRow,
      versionRow,
    ] = screen.getAllByTestId(dataTableLocators.dataRow);

    expect(createdAtRow).toHaveTextContent('Created at');
    expect(createdAtRow).toHaveTextContent('01 January 1970 00:16 (UTC)');

    expect(updatedAtRow).toHaveTextContent('Updated at');
    expect(updatedAtRow).toHaveTextContent('01 January 1970 00:16 (UTC)');

    expect(remainingRow).toHaveTextContent('Remaining');
    expect(remainingRow).toHaveTextContent('100');

    expect(statusRow).toHaveTextContent('Status');
    expect(statusRow).toHaveTextContent('Active');

    expect(versionRow).toHaveTextContent('Version');
    expect(versionRow).toHaveTextContent('1');
  });
});
