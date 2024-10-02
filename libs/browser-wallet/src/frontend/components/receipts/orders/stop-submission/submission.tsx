import type { RowConfig } from '@/components/data-table/conditional-data-table';
import { ConditionalDataTable } from '@/components/data-table/conditional-data-table';
import { EXPIRY_STRATEGY_MAP, processExpiryStrategy } from '@/lib/enums';
import { formatNanoDate } from '@/lib/utils';

import type { ReceiptComponentProperties } from '../../receipts';
import { OrderBadges } from '../../utils/order/badges';
import { OrderTable } from '../../utils/order-table';
import { ReceiptWrapper } from '../../utils/receipt-wrapper';
import { OrderPrice } from '../../utils/order/order-price';

export const locators = {
  sectionHeader: 'section-header',
  orderDetails: 'order-details',
};

const SubmissionDetails = ({
  title,
  stopOrderDetails,
}: {
  title: string;
  stopOrderDetails: any;
}) => {
  const { orderSubmission } = stopOrderDetails;

  const items: RowConfig<typeof stopOrderDetails>[] = [
    {
      prop: 'price',
      props: ['orderSubmission.marketId', 'price'],
      render: (price, props) => [
        'Trigger price',
        <OrderPrice
          key={`${title}-trigger-price`}
          price={price}
          marketId={props['orderSubmission.marketId']}
        />,
      ],
    },
    {
      prop: 'trailingPercentOffset',
      render: (trailingPercentOffset) => [
        'Trailing offset',
        `${trailingPercentOffset}%`,
      ],
    },
    {
      prop: 'expiryStrategy',
      render: (expiryStrategy) => [
        'Expiry strategy',
        EXPIRY_STRATEGY_MAP[processExpiryStrategy(expiryStrategy)],
      ],
    },
    {
      prop: 'expiresAt',
      render: (expiresAt) => [
        'Expires at',
        Number(expiresAt) === 0 ? 'Never' : formatNanoDate(expiresAt),
      ],
    },
  ];

  return (
    <div className="mb-2">
      <h1
        data-testid={locators.sectionHeader}
        className="text-surface-0-fg-muted"
      >
        {title}
      </h1>
      <ConditionalDataTable items={items} data={stopOrderDetails} />
      <h2
        data-testid={locators.orderDetails}
        className="text-surface-0-fg-muted"
      >
        Order details
      </h2>
      <OrderTable {...orderSubmission} />
      <OrderBadges {...orderSubmission} />
    </div>
  );
};

export const StopOrdersSubmissionView = ({
  stopOrdersSubmission,
}: {
  stopOrdersSubmission: any;
}) => {
  return (
    <>
      {stopOrdersSubmission.risesAbove ? (
        <SubmissionDetails
          title="Rises Above ↗"
          stopOrderDetails={stopOrdersSubmission.risesAbove}
        />
      ) : null}
      {stopOrdersSubmission.fallsBelow ? (
        <SubmissionDetails
          title="Falls Below ↘"
          stopOrderDetails={stopOrdersSubmission.fallsBelow}
        />
      ) : null}
    </>
  );
};

export const StopOrderSubmission = ({
  transaction,
}: ReceiptComponentProperties) => {
  const order = transaction.stopOrdersSubmission;
  return (
    <ReceiptWrapper>
      <StopOrdersSubmissionView stopOrdersSubmission={order} />
    </ReceiptWrapper>
  );
};
