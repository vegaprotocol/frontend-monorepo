import {
  getDateTimeFormat,
  addDecimalsFormatNumber,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { Size } from '@vegaprotocol/datagrid';
import * as Schema from '@vegaprotocol/types';
import {
  Dialog,
  KeyValueTable,
  KeyValueTableRow,
} from '@vegaprotocol/ui-toolkit';
import type { Order } from '../order-data-provider';
import startCase from 'lodash/startCase';

interface OrderViewDialogProps {
  isOpen: boolean;
  order: Order;
  onChange: (open: boolean) => void;
}

export const OrderViewDialog = ({
  isOpen,
  order,
  onChange,
}: OrderViewDialogProps) => {
  const headerClassName = 'text-lg font-bold text-black dark:text-white';

  console.log({ order });

  return (
    <Dialog open={isOpen} title={t('View order')} onChange={onChange}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {order.market && (
          <div className="md:col-span-2">
            <p className={headerClassName}>{t(`Market`)}</p>
            <p>{t(`${order.market.tradableInstrument.instrument.name}`)}</p>
          </div>
        )}
        {order.type === Schema.OrderType.TYPE_LIMIT && order.market && (
          <div className="md:col-span-1">
            <p className={headerClassName}>{t(`Price`)}</p>
            <p>
              {addDecimalsFormatNumber(order.price, order.market.decimalPlaces)}
            </p>
          </div>
        )}
        <div className="md:col-span-1">
          <p className={headerClassName}>{t(`Size`)}</p>
          <p>
            {order.market && (
              <Size
                value={order.size}
                side={order.side}
                positionDecimalPlaces={order.market.positionDecimalPlaces}
              />
            )}
          </p>
        </div>
      </div>
      {order.timeInForce === Schema.OrderTimeInForce.TIME_IN_FORCE_GTT &&
        order.expiresAt && (
          <div>
            <p className={headerClassName}>{t(`Expires at`)}</p>
            <p>{getDateTimeFormat().format(new Date(order.expiresAt))}</p>
          </div>
        )}
      <KeyValueTable>
        {Object.entries(order).map(([key, value], i) => (
          <KeyValueTableRow key={key}>
            <div data-testid={key}>{startCase(key)}</div>
            <div data-testid={`${key}-${i}`}>
              {typeof value === 'string'
                ? value
                : typeof value === 'boolean'
                ? value === true
                  ? 'Yes'
                  : 'No'
                : '-'}
            </div>
          </KeyValueTableRow>
        ))}
      </KeyValueTable>
    </Dialog>
  );
};
