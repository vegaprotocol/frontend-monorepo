import type {
  OrderStatus,
  OrderType as vegaOrderType,
  Side as vegaSide,
} from '@vegaprotocol/enums';
import { truncateMiddle } from '@vegaprotocol/ui-toolkit';
import { formatDateWithLocalTimezone } from '@vegaprotocol/utils';

import type { RowConfig } from '@/components/data-table/conditional-data-table';
import { ConditionalDataTable } from '@/components/data-table/conditional-data-table';
import { MarketLink } from '@/components/vega-entities/market-link';
import { ORDER_STATUS_MAP, processOrderStatus } from '@/lib/enums';
import type { IcebergOptions } from '@/lib/transactions';
import { nanoSecondsToMilliseconds } from '@/lib/utils';
import type { PeggedOrderOptions } from '@/types/transactions';

import { CopyWithCheckmark } from '../../copy-with-check';
import { VegaMarket } from '../../vega-entities/vega-market';
import { OrderPrice } from './order/order-price';
import { OrderSize } from './order/order-size';
import { OrderType } from './order/order-type';
import { PeggedOrderInfo } from './order/pegged-order-info';
import { OrderSide } from './order/side';

export type OrderTableProperties = Partial<{
  marketId?: string;
  orderId?: string;
  side?: vegaSide;
  size?: string;
  price?: string;
  reference?: string;
  type?: vegaOrderType;
  peggedOrder?: PeggedOrderOptions;
  createdAt?: string;
  updatedAt?: string;
  remaining?: string;
  status?: OrderStatus;
  version?: string;
  icebergOpts?: IcebergOptions;
}>;

export const OrderTable = (properties: OrderTableProperties) => {
  const items: RowConfig<OrderTableProperties>[] = [
    {
      prop: 'price',
      props: ['price', 'marketId', 'type'],
      render: (price, { marketId, type }) => [
        'Price',
        <OrderPrice
          key="order-details-price"
          price={price}
          marketId={marketId}
          type={type}
        />,
      ],
    },
    {
      prop: 'peggedOrder',
      props: ['marketId', 'peggedOrder'],
      render: (peggedOrder, { marketId }) => [
        'Pegged price',
        <PeggedOrderInfo
          key="order-details-pegged"
          peggedOrder={peggedOrder}
          marketId={marketId}
        />,
      ],
    },
    {
      prop: 'size',
      props: ['marketId', 'size'],
      render: (size, { marketId }) => [
        'Size',
        <OrderSize key="order-details-size" size={size} marketId={marketId} />,
      ],
    },
    {
      prop: 'marketId',
      render: (marketId) => [
        'Market',
        <VegaMarket key="order-details-market" marketId={marketId} />,
      ],
    },
    {
      prop: 'marketId',
      render: (marketId) => [
        'Market Id',
        <MarketLink key="order-details-market-id" marketId={marketId} />,
      ],
    },
    {
      prop: 'orderId',
      render: (orderId) => [
        'Order',
        <CopyWithCheckmark text={orderId} key="order-value">
          {truncateMiddle(orderId)}
        </CopyWithCheckmark>,
      ],
    },
    {
      prop: 'side',
      props: ['side', 'marketId'],
      render: (side, { marketId }) => [
        'Side',
        <OrderSide
          key="order-details-direction"
          side={side}
          marketId={marketId}
        />,
      ],
    },
    {
      prop: 'type',
      render: (type) => [
        'Type',
        <OrderType key="order-details-type" type={type} />,
      ],
    },
    {
      prop: 'reference',
      render: (reference) => [
        'Reference',
        <CopyWithCheckmark text={reference} key="order-reference">
          {truncateMiddle(reference)}
        </CopyWithCheckmark>,
      ],
    },
    {
      prop: 'createdAt',
      render: (createdAt) => [
        'Created at',
        formatDateWithLocalTimezone(
          new Date(nanoSecondsToMilliseconds(createdAt))
        ),
      ],
    },
    {
      prop: 'updatedAt',
      render: (updatedAt) => [
        'Updated at',
        formatDateWithLocalTimezone(
          new Date(nanoSecondsToMilliseconds(updatedAt))
        ),
      ],
    },
    {
      prop: 'remaining',
      props: ['remaining', 'marketId'],
      render: (remaining, { marketId }) => [
        'Remaining',
        <OrderSize
          key="order-details-remaining"
          size={remaining}
          marketId={marketId}
        />,
      ],
    },
    {
      prop: 'status',
      render: (status) => [
        'Status',
        ORDER_STATUS_MAP[processOrderStatus(status)],
      ],
    },
    { prop: 'version', render: (version) => ['Version', version] },
    {
      prop: 'icebergOpts',
      props: ['marketId'],
      render: (icebergOptions, { marketId }) => [
        'Peak size',
        <OrderSize
          key="order-details-iceberg-peak"
          size={icebergOptions.peakSize}
          marketId={marketId}
        />,
      ],
    },
    {
      prop: 'icebergOpts',
      props: ['marketId'],
      render: (icebergOptions, { marketId }) => [
        'Minimum visible size',
        <OrderSize
          key="order-details-iceberg-minimum"
          size={icebergOptions.minimumVisibleSize}
          marketId={marketId}
        />,
      ],
    },
  ];

  return <ConditionalDataTable items={items} data={properties} />;
};
