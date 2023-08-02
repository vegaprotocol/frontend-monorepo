import {
  addDecimalsFormatNumber,
  getDateTimeFormat,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { Size } from '@vegaprotocol/datagrid';
import * as Schema from '@vegaprotocol/types';
import {
  Dialog,
  KeyValueTable,
  KeyValueTableRow,
  Tooltip,
  VegaIcon,
  VegaIconNames,
  truncateMiddle,
} from '@vegaprotocol/ui-toolkit';
import type { Order } from '../order-data-provider';
import { Link } from 'react-router-dom';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useCopyTimeout } from '@vegaprotocol/react-helpers';

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
  const [, setCopied] = useCopyTimeout();
  return (
    <Dialog open={isOpen} title={t('Order details')} onChange={onChange}>
      <KeyValueTable>
        <KeyValueTableRow key={'order-market'}>
          <div data-testid={'order-market-label'}>{t('Market')}</div>
          <div data-testid={`order-market-value`}>
            <Link to={`/markets/${order.market?.id}`}>
              {order.market?.tradableInstrument.instrument.name}
            </Link>
          </div>
        </KeyValueTableRow>
        <KeyValueTableRow key={'order-type'}>
          <div data-testid={'order-type-label'}>{t('Type')}</div>
          <div data-testid={`order-type-value`}>
            {Schema.OrderTypeMapping[order.type as Schema.OrderType]}
          </div>
        </KeyValueTableRow>
        {order.market && (
          <KeyValueTableRow key={'order-price'}>
            <div data-testid={'order-price-label'}>{t('Price')}</div>
            <div data-testid={`order-price-value`}>
              {addDecimalsFormatNumber(
                order.price,
                order.market.decimalPlaces as number
              )}
            </div>
          </KeyValueTableRow>
        )}
        {order.market && (
          <KeyValueTableRow key={'order-size'}>
            <div data-testid={'order-size-label'}>{t('Size')}</div>
            <div data-testid={`order-size-value`}>
              <Size
                value={order.size}
                side={order.side}
                positionDecimalPlaces={
                  order.market.positionDecimalPlaces as number
                }
              />
            </div>
          </KeyValueTableRow>
        )}
        {order.market && (
          <KeyValueTableRow key={'order-remaining'} className="mb-4">
            <div data-testid={'order-remaining-label'}>{t('Remaining')}</div>
            <div data-testid={`order-remaining-value`}>
              <Size
                value={order.remaining}
                side={order.side}
                positionDecimalPlaces={
                  order.market.positionDecimalPlaces as number
                }
              />
            </div>
          </KeyValueTableRow>
        )}
        <KeyValueTableRow key={'order-status'}>
          <div data-testid={'order-status-label'}>{t('Status')}</div>
          <div data-testid={`order-status-value`}>
            {Schema.OrderStatusMapping[order.status as Schema.OrderStatus]}
          </div>
        </KeyValueTableRow>
        {order.rejectionReason && (
          <KeyValueTableRow key={'order-rejection-reason'}>
            <div data-testid={'order-rejection-reason-label'}>
              {t('rejection reason')}
            </div>
            <div data-testid={`order-rejection-reason-value`}>
              {
                Schema.OrderRejectionReasonMapping[
                  order.rejectionReason as Schema.OrderRejectionReason
                ]
              }
            </div>
          </KeyValueTableRow>
        )}
        <KeyValueTableRow key={'order-id'}>
          <div data-testid={'order-id-label'}>{t('Order ID')}</div>
          <div data-testid={`order-id-value`}>
            {truncateMiddle(order.id, 10)}
            <CopyToClipboard text={order.id} onCopy={() => setCopied(true)}>
              <button
                type="button"
                data-testid="copy-order-id"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="sr-only">{t('Copy')}</span>
                <VegaIcon name={VegaIconNames.COPY} />
              </button>
            </CopyToClipboard>
          </div>
        </KeyValueTableRow>
        <KeyValueTableRow key={'order-created'}>
          <div data-testid={'order-created-label'}>{t('Created')}</div>
          <div data-testid={`order-created-value`}>
            {getDateTimeFormat().format(new Date(order.createdAt))}
          </div>
        </KeyValueTableRow>
        {order.updatedAt && (
          <KeyValueTableRow key={'order-updated'}>
            <div data-testid={'order-updated-label'}>{t('Updated')}</div>
            <div data-testid={`order-updated-value`}>
              {getDateTimeFormat().format(new Date(order.updatedAt))}
            </div>
          </KeyValueTableRow>
        )}
        {order.expiresAt && (
          <KeyValueTableRow key={'order-expires'}>
            <div data-testid={'order-expires-label'}>{t('Expires')}</div>
            <div data-testid={`order-expires-value`}>
              {getDateTimeFormat().format(new Date(order.expiresAt))}
            </div>
          </KeyValueTableRow>
        )}

        <KeyValueTableRow key={'order-time-in-force'} className="mt-4">
          <div data-testid={'order-time-in-force-label'}>
            {t('Time in force')}
          </div>
          <div data-testid={`order-time-in-force-value`}>
            {
              Schema.OrderTimeInForceMapping[
                order.timeInForce as Schema.OrderTimeInForce
              ]
            }
          </div>
        </KeyValueTableRow>

        <KeyValueTableRow key={'order-post-only'}>
          <div data-testid={'order-post-only-label'}>{t('Post only')}</div>
          <div data-testid={`order-post-only-value`}>
            {order.postOnly ? t('Yes') : t('-')}
          </div>
        </KeyValueTableRow>

        <KeyValueTableRow key={'order-reduce-only'}>
          <div data-testid={'order-reduce-only-label'}>{t('Reduce only')}</div>
          <div data-testid={`order-reduce-only-value`}>
            {order.reduceOnly ? t('Yes') : t('-')}
          </div>
        </KeyValueTableRow>

        <KeyValueTableRow key={'order-pegged'}>
          <div data-testid={'order-pegged-label'}>{t('Pegged')}</div>
          <div data-testid={`order-pegged-value`}>
            {order.peggedOrder ? t('Yes') : t('-')}
          </div>
        </KeyValueTableRow>

        <KeyValueTableRow key={'order-liquidity-provision'}>
          <div data-testid={'order-liquidity-provision-label'}>
            {t('Liquidity provision')}
          </div>
          <div data-testid={`order-liquidity-provision-value`}>
            {order.liquidityProvision ? t('Yes') : t('-')}
          </div>
        </KeyValueTableRow>
      </KeyValueTable>

      <KeyValueTableRow key={'order-iceberg-order'}>
        <div data-testid={'order-iceberg-order-label'}>
          {t('Iceberg order')}
        </div>
        <div data-testid={`order-iceberg-order-value`}>
          {order.icebergOrder ? t('Yes') : t('-')}
        </div>
      </KeyValueTableRow>
      {order.icebergOrder && (
        <KeyValueTableRow
          key={'order-iceberg-order-peak-size'}
          className="ml-4"
        >
          <div data-testid={'order-iceberg-order-peak-size-label'}>
            <Tooltip
              description={t(
                'The maximum volume that can be traded at once. Must be less than the total size of the order.'
              )}
            >
              <span>{t('Peak size')}</span>
            </Tooltip>
          </div>
          <div data-testid={`order-iceberg-order-peak-size-value`}>
            <Size
              value={order.icebergOrder.peakSize}
              side={order.side}
              positionDecimalPlaces={
                order.market?.positionDecimalPlaces as number
              }
            />
          </div>
        </KeyValueTableRow>
      )}
      {order.icebergOrder && (
        <KeyValueTableRow
          key={'order-iceberg-order-minimum-visible-size'}
          className="ml-4"
        >
          <div data-testid={'order-iceberg-order-minimum-visible-size-label'}>
            <Tooltip
              description={t(
                'When the order trades and its size falls below this threshold, it will be reset to the peak size and moved to the back of the priority order. Must be less than or equal to peak size, and greater than 0.'
              )}
            >
              <span>{t('Minimum size')}</span>
            </Tooltip>
          </div>
          <div data-testid={`order-iceberg-order-minimum-visible-size-value`}>
            <Size
              value={order.icebergOrder.minimumVisibleSize}
              side={order.side}
              positionDecimalPlaces={
                order.market?.positionDecimalPlaces as number
              }
            />
          </div>
        </KeyValueTableRow>
      )}
      {order.icebergOrder && (
        <KeyValueTableRow
          key={'order-iceberg-order-reserved-remaining'}
          className="ml-4"
        >
          <div data-testid={'order-iceberg-order-reserved-remaining-label'}>
            {t('Reserved remaining')}
          </div>
          <div data-testid={`order-iceberg-order-reserved-remaining-value`}>
            <Size
              value={order.icebergOrder.reservedRemaining}
              side={order.side}
              positionDecimalPlaces={
                order.market?.positionDecimalPlaces as number
              }
            />
          </div>
        </KeyValueTableRow>
      )}
    </Dialog>
  );
};
