import { t } from '@vegaprotocol/react-helpers';
import { useExplorerDeterministicOrderQuery } from './__generated___/Order';
import type { Schema } from '@vegaprotocol/types';

export interface DeterministicOrderDetailsProps {
  id: string;
}

const statusText: Record<Schema.OrderStatus, string>= {
  STATUS_ACTIVE: 'Active',
  STATUS_CANCELLED: 'Cancelled',
  STATUS_EXPIRED: 'Expired',
  STATUS_FILLED: 'Filled',
  STATUS_PARKED: 'Parked',
  // Intentionally vague - table shows partial fills
  STATUS_PARTIALLY_FILLED: 'Active',
  STATUS_REJECTED: 'Rejected',
  STATUS_STOPPED: 'Stopped',
}

const sideText: Record<Schema.Side, string>= {
  SIDE_BUY: 'buy',
  SIDE_SELL: 'sell' 
}

const DeterministicOrderDetails = ({ id }: DeterministicOrderDetailsProps) => {
  const { data, error } = useExplorerDeterministicOrderQuery({
    variables: { orderId: id },
  });

  if (error || data && !data.orderByID) {
    return (
    <div className="grid lg:grid-cols-1 flex items-center">
        <div className="mb-12 lg:mb-0">
          <div
            className="relative block rounded-lg shadow-lg px-3 py-6 md:px-6 lg:-mr-7"
          >
            <h2 className="text-3xl font-bold mb-4 display-5">{t('Order not found')}</h2>
            <p className="text-gray-500 mb-12">
              {t('No order created from this transaction')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!data || !data.orderByID) {
    return null;
  }

  const o = data.orderByID;

  const title = `${statusText[o.status]} ${sideText[o.side]}`

  return (
    <div className="grid lg:grid-cols-1 flex items-center">
        <div className="mb-12 lg:mb-0">
          <div
            className="relative block rounded-lg shadow-lg px-3 py-6 md:px-6 lg:-mr-7"
          >
            <h2 className="text-3xl font-bold mb-4 display-5">{title}</h2>
            <p className="text-gray-500 mb-12">
              Created in ${o.market.tradableInstrument.instrument.name} at {o.createdAt}
            </p>

            <div className="grid md:grid-cols-3 gap-x-6">
              <div className="mb-12 md:mb-0">
                <h2 className="text-2xl font-bold text-dark mb-4">{t('Status')}</h2>
                <h5 className="text-lg font-medium text-gray-500 mb-0 capitalize">{statusText[o.status]}</h5>
              </div>

              <div className="mb-12 md:mb-0">
                <h2 className="text-2xl font-bold text-dark mb-4">{t('Size')}</h2>
                <h5 className="text-lg font-medium text-gray-500 mb-0">{o.remaining}</h5>
              </div>

              <div className="">
                <h2 className="text-2xl font-bold text-dark mb-4">{t('Version')}</h2>
                <h5 className="text-lg font-medium text-gray-500 mb-0">{o.version}</h5>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default DeterministicOrderDetails;

