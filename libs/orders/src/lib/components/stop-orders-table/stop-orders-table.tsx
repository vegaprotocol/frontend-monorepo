import {
  addDecimalsFormatNumber,
  getDateTimeFormat,
  isNumeric,
  toBigNum,
  useFormatTrigger,
} from '@vegaprotocol/utils';
import * as Schema from '@vegaprotocol/types';
import {
  ActionsDropdown,
  ButtonLink,
  VegaIcon,
  VegaIconNames,
  TradingDropdownItem,
  TradingDropdownCopyItem,
  Pill,
} from '@vegaprotocol/ui-toolkit';
import { memo, useMemo } from 'react';
import {
  AgGrid,
  SetFilter,
  DateRangeFilter,
  negativeClassNames,
  positiveClassNames,
  MarketNameCell,
  COL_DEFS,
} from '@vegaprotocol/datagrid';
import type {
  TypedDataAgGrid,
  VegaICellRendererParams,
  VegaValueFormatterParams,
  VegaValueGetterParams,
} from '@vegaprotocol/datagrid';
import type { StopOrder } from '../order-data-provider/stop-orders-data-provider';
import type { ColDef } from 'ag-grid-community';
import type { Order } from '../order-data-provider';
import { useT } from '../../use-t';

const defaultColDef = {
  resizable: true,
  sortable: true,
  filterParams: { buttons: ['reset'] },
  minWidth: 100,
};

export type StopOrdersTableProps = TypedDataAgGrid<StopOrder> & {
  onCancel: (order: StopOrder) => void;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  onView: (order: Order) => void;
  isReadOnly: boolean;
};

export const StopOrdersTable = memo(
  ({ onCancel, onMarketClick, onView, ...props }: StopOrdersTableProps) => {
    const t = useT();
    const formatTrigger = useFormatTrigger();
    const showAllActions = !props.isReadOnly;
    const columnDefs: ColDef[] = useMemo(
      () => [
        {
          headerName: t('Market'),
          field: 'market.tradableInstrument.instrument.code',
          cellRenderer: 'MarketNameCell',
          cellRendererParams: { idPath: 'market.id', onMarketClick },
          pinned: true,
        },
        {
          headerName: t('Trigger'),
          field: 'trigger',
          cellClass: 'font-mono text-right',
          type: 'rightAligned',
          sortable: false,
          valueFormatter: ({
            data,
          }: VegaValueFormatterParams<StopOrder, 'trigger'>): string =>
            data ? formatTrigger(data, data.market.decimalPlaces) : '',
        },
        {
          field: 'expiresAt',
          valueFormatter: ({
            value,
            data,
          }: VegaValueFormatterParams<StopOrder, 'expiresAt'>) => {
            if (
              data &&
              value &&
              data?.expiryStrategy !==
                Schema.StopOrderExpiryStrategy.EXPIRY_STRATEGY_UNSPECIFIED
            ) {
              const expiresAt = getDateTimeFormat().format(new Date(value));
              const expiryStrategy =
                data.expiryStrategy ===
                Schema.StopOrderExpiryStrategy.EXPIRY_STRATEGY_SUBMIT
                  ? t('Submit')
                  : t('Cancels');
              return `${expiryStrategy} ${expiresAt}`;
            }
            return '';
          },
        },
        {
          headerName: t('Size'),
          field: 'submission.size',
          cellClass: 'font-mono text-right',
          type: 'rightAligned',
          cellClassRules: {
            [positiveClassNames]: ({ data }: { data: StopOrder }) =>
              data?.submission.size === Schema.Side.SIDE_BUY,
            [negativeClassNames]: ({ data }: { data: StopOrder }) =>
              data?.submission.size === Schema.Side.SIDE_SELL,
          },
          valueGetter: ({ data }: VegaValueGetterParams<StopOrder>) => {
            return data?.submission.size && data.market
              ? toBigNum(
                  data.submission.size,
                  data.market.positionDecimalPlaces ?? 0
                )
                  .multipliedBy(
                    data.submission.side === Schema.Side.SIDE_SELL ? -1 : 1
                  )
                  .toNumber()
              : undefined;
          },
          valueFormatter: ({
            data,
          }: VegaValueFormatterParams<StopOrder, 'size'>) => {
            if (!data) {
              return '';
            }
            if (!data?.market || !isNumeric(data.submission.size)) {
              return '-';
            }
            const prefix = data
              ? data.submission.side === Schema.Side.SIDE_BUY
                ? '+'
                : '-'
              : '';
            return (
              prefix +
              addDecimalsFormatNumber(
                data.submission.size,
                data.market.positionDecimalPlaces
              )
            );
          },
        },
        {
          field: 'submission.type',
          filter: SetFilter,
          filterParams: {
            set: Schema.OrderTypeMapping,
          },
          cellRenderer: ({
            value,
          }: VegaICellRendererParams<StopOrder, 'submission.type'>) =>
            value ? Schema.OrderTypeMapping[value] : '',
        },
        {
          field: 'status',
          filter: SetFilter,
          filterParams: {
            set: Schema.StopOrderStatusMapping,
          },
          valueFormatter: ({
            value,
          }: VegaValueFormatterParams<StopOrder, 'status'>) => {
            return value ? Schema.StopOrderStatusMapping[value] : '';
          },
          cellRenderer: ({
            valueFormatted,
            data,
          }: {
            valueFormatted: string;
            data: StopOrder;
          }) => (
            <>
              <span data-testid={`order-status-${data?.id}`}>
                {valueFormatted}
              </span>
              {data.ocoLinkId && (
                <Pill
                  size="xxs"
                  className="ml-0.5 uppercase"
                  title={t('One Cancels the Other')}
                >
                  OCO
                </Pill>
              )}
            </>
          ),
        },
        {
          field: 'submission.price',
          type: 'rightAligned',
          cellClass: 'font-mono text-right',
          valueFormatter: ({
            value,
            data,
          }: VegaValueFormatterParams<StopOrder, 'submission.price'>) => {
            if (!data) {
              return '';
            }
            if (
              !data?.market ||
              data.submission.type === Schema.OrderType.TYPE_MARKET ||
              !isNumeric(value)
            ) {
              return '-';
            }
            return addDecimalsFormatNumber(value, data.market.decimalPlaces);
          },
        },
        {
          field: 'submission.timeInForce',
          filter: SetFilter,
          filterParams: {
            set: Schema.OrderTimeInForceMapping,
          },
          valueFormatter: ({
            value,
          }: VegaValueFormatterParams<StopOrder, 'submission.timeInForce'>) => {
            return value ? Schema.OrderTimeInForceCode[value] : '';
          },
        },
        {
          field: 'updatedAt',
          filter: DateRangeFilter,
          valueGetter: ({ data }: VegaValueGetterParams<StopOrder>) =>
            data?.updatedAt || data?.createdAt,
          cellRenderer: ({
            data,
          }: VegaICellRendererParams<StopOrder, 'createdAt'>) => {
            if (!data) {
              return undefined;
            }
            const value = data.updatedAt || data.createdAt;
            return (
              <span data-value={value}>
                {value ? getDateTimeFormat().format(new Date(value)) : '-'}
              </span>
            );
          },
        },
        {
          colId: 'actions',
          ...COL_DEFS.actions,
          minWidth: showAllActions ? 120 : COL_DEFS.actions.minWidth,
          maxWidth: showAllActions ? 120 : COL_DEFS.actions.minWidth,
          cellRenderer: ({ data }: { data?: StopOrder }) => {
            if (!data) return null;

            return (
              <div className="flex items-center justify-end gap-2">
                {data.status === Schema.StopOrderStatus.STATUS_PENDING &&
                  !props.isReadOnly && (
                    <ButtonLink
                      data-testid="cancel"
                      onClick={() => onCancel(data)}
                    >
                      {t('Cancel')}
                    </ButtonLink>
                  )}
                {data.status === Schema.StopOrderStatus.STATUS_TRIGGERED &&
                  data.order && (
                    <ActionsDropdown data-testid="stop-order-actions-content">
                      <TradingDropdownCopyItem
                        value={data.order.id}
                        text={t('Copy order ID')}
                      />
                      <TradingDropdownItem
                        key={'view-order'}
                        data-testid="view-order"
                        onClick={() =>
                          data.order &&
                          onView({ ...data.order, market: data.market })
                        }
                      >
                        <VegaIcon name={VegaIconNames.INFO} size={16} />
                        {t('View order details')}
                      </TradingDropdownItem>
                    </ActionsDropdown>
                  )}
              </div>
            );
          },
        },
      ],
      [
        onCancel,
        onMarketClick,
        onView,
        props.isReadOnly,
        showAllActions,
        t,
        formatTrigger,
      ]
    );

    return (
      <AgGrid
        defaultColDef={defaultColDef}
        columnDefs={columnDefs}
        getRowId={({ data }) => data.id}
        components={{ MarketNameCell }}
        {...props}
      />
    );
  }
);
