import classNames from 'classnames';
import { forwardRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { CellRendererSelectorResult } from 'ag-grid-community';
import type {
  VegaValueFormatterParams,
  VegaValueGetterParams,
  TypedDataAgGrid,
  VegaICellRendererParams,
} from '@vegaprotocol/datagrid';
import { COL_DEFS } from '@vegaprotocol/datagrid';
import { ProgressBarCell } from '@vegaprotocol/datagrid';
import {
  AgGridLazy as AgGrid,
  DateRangeFilter,
  PriceFlashCell,
  signedNumberCssClass,
  signedNumberCssClassRules,
  MarketNameCell,
} from '@vegaprotocol/datagrid';
import {
  ButtonLink,
  Tooltip,
  TooltipCellComponent,
  ExternalLink,
  Icon,
} from '@vegaprotocol/ui-toolkit';
import {
  volumePrefix,
  toBigNum,
  formatNumber,
  getDateTimeFormat,
  addDecimalsFormatNumber,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { AgGridColumn } from 'ag-grid-react';
import type { AgGridReact } from 'ag-grid-react';
import type { Position } from './positions-data-providers';
import * as Schema from '@vegaprotocol/types';
import { getRowId } from './use-positions-data';
import { PositionStatus, PositionStatusMapping } from '@vegaprotocol/types';
import { DocsLinks } from '@vegaprotocol/environment';
import { PositionTableActions } from './position-actions-dropdown';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';

interface Props extends TypedDataAgGrid<Position> {
  onClose?: (data: Position) => void;
  onMarketClick?: (id: string, metaKey?: boolean) => void;
  style?: CSSProperties;
  isReadOnly: boolean;
  storeKey?: string;
}

export interface AmountCellProps {
  valueFormatted?: Pick<
    Position,
    'openVolume' | 'marketDecimalPlaces' | 'positionDecimalPlaces' | 'notional'
  >;
}

export const AmountCell = ({ valueFormatted }: AmountCellProps) => {
  if (!valueFormatted) {
    return null;
  }
  const { openVolume, positionDecimalPlaces, marketDecimalPlaces, notional } =
    valueFormatted;
  return valueFormatted && notional ? (
    <div className="leading-tight font-mono">
      <div
        className={classNames('text-right', signedNumberCssClass(openVolume))}
      >
        {volumePrefix(
          addDecimalsFormatNumber(openVolume, positionDecimalPlaces)
        )}
      </div>
      <div className="text-right">
        {addDecimalsFormatNumber(notional, marketDecimalPlaces)}
      </div>
    </div>
  ) : null;
};

AmountCell.displayName = 'AmountCell';

export const PositionsTable = forwardRef<AgGridReact, Props>(
  ({ onClose, onMarketClick, ...props }, ref) => {
    const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();
    return (
      <AgGrid
        style={{ width: '100%', height: '100%' }}
        overlayNoRowsTemplate={t('No positions')}
        getRowId={getRowId}
        ref={ref}
        tooltipShowDelay={500}
        defaultColDef={{
          resizable: true,
          sortable: true,
          filter: true,
          filterParams: { buttons: ['reset'] },
          tooltipComponent: TooltipCellComponent,
        }}
        components={{
          AmountCell,
          PriceFlashCell,
          ProgressBarCell,
          MarketNameCell,
        }}
        {...props}
      >
        <AgGridColumn
          headerName={t('Market')}
          field="marketName"
          cellRenderer="MarketNameCell"
          cellRendererParams={{ idPath: 'marketId', onMarketClick }}
          minWidth={190}
        />
        <AgGridColumn
          headerName={t('Notional')}
          headerTooltip={t('Mark price x open volume.')}
          field="notional"
          type="rightAligned"
          cellClass="font-mono text-right"
          filter="agNumberColumnFilter"
          valueGetter={({
            data,
          }: VegaValueGetterParams<Position, 'notional'>) => {
            return !data?.notional
              ? undefined
              : toBigNum(data.notional, data.marketDecimalPlaces).toNumber();
          }}
          valueFormatter={({
            data,
          }: VegaValueFormatterParams<Position, 'notional'>) => {
            return !data || !data.notional
              ? '-'
              : addDecimalsFormatNumber(
                  data.notional,
                  data.marketDecimalPlaces
                );
          }}
          minWidth={80}
        />
        <AgGridColumn
          headerName={t('Open volume')}
          field="openVolume"
          type="rightAligned"
          cellClass="font-mono text-right"
          cellClassRules={signedNumberCssClassRules}
          filter="agNumberColumnFilter"
          valueGetter={({
            data,
          }: VegaValueGetterParams<Position, 'openVolume'>) => {
            return data?.openVolume === undefined
              ? undefined
              : toBigNum(
                  data?.openVolume,
                  data.positionDecimalPlaces
                ).toNumber();
          }}
          valueFormatter={({
            data,
          }: VegaValueFormatterParams<Position, 'openVolume'>):
            | string
            | undefined => {
            return data?.openVolume === undefined
              ? undefined
              : volumePrefix(
                  addDecimalsFormatNumber(
                    data.openVolume,
                    data.positionDecimalPlaces
                  )
                );
          }}
          cellRenderer={OpenVolumeCell}
          minWidth={100}
        />
        <AgGridColumn
          headerName={t('Mark price')}
          field="markPrice"
          type="rightAligned"
          cellRendererSelector={(): CellRendererSelectorResult => {
            return {
              component: PriceFlashCell,
            };
          }}
          filter="agNumberColumnFilter"
          valueGetter={({
            data,
          }: VegaValueGetterParams<Position, 'markPrice'>) => {
            return !data ||
              !data.markPrice ||
              data.marketTradingMode ===
                Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION
              ? undefined
              : toBigNum(data.markPrice, data.marketDecimalPlaces).toNumber();
          }}
          valueFormatter={({
            data,
          }: VegaValueFormatterParams<Position, 'markPrice'>) => {
            if (!data) {
              return undefined;
            }
            if (
              !data.markPrice ||
              data.marketTradingMode ===
                Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION
            ) {
              return '-';
            }
            return addDecimalsFormatNumber(
              data.markPrice,
              data.marketDecimalPlaces
            );
          }}
          minWidth={100}
        />
        <AgGridColumn
          headerName={t('Settlement asset')}
          field="assetSymbol"
          colId="asset"
          minWidth={100}
          cellRenderer={({ data }: VegaICellRendererParams<Position>) => {
            if (!data) return null;
            return (
              <ButtonLink
                onClick={(e) => {
                  openAssetDetailsDialog(data.assetId, e.target as HTMLElement);
                }}
              >
                {data?.assetSymbol}
              </ButtonLink>
            );
          }}
        />
        <AgGridColumn
          headerName={t('Entry price')}
          field="averageEntryPrice"
          type="rightAligned"
          cellRendererSelector={(): CellRendererSelectorResult => {
            return {
              component: PriceFlashCell,
            };
          }}
          filter="agNumberColumnFilter"
          valueGetter={({
            data,
          }: VegaValueGetterParams<Position, 'averageEntryPrice'>) => {
            return data?.markPrice === undefined || !data
              ? undefined
              : toBigNum(
                  data.averageEntryPrice,
                  data.marketDecimalPlaces
                ).toNumber();
          }}
          valueFormatter={({
            data,
          }: VegaValueFormatterParams<Position, 'averageEntryPrice'>):
            | string
            | undefined => {
            if (!data) {
              return undefined;
            }
            return addDecimalsFormatNumber(
              data.averageEntryPrice,
              data.marketDecimalPlaces
            );
          }}
          minWidth={100}
        />
        <AgGridColumn
          headerName={t('Leverage')}
          field="currentLeverage"
          type="rightAligned"
          filter="agNumberColumnFilter"
          cellRendererSelector={(): CellRendererSelectorResult => {
            return {
              component: PriceFlashCell,
            };
          }}
          valueFormatter={({
            value,
          }: VegaValueFormatterParams<Position, 'currentLeverage'>) =>
            value === undefined ? undefined : formatNumber(value.toString(), 1)
          }
          minWidth={100}
        />
        <AgGridColumn
          headerName={t('Margin allocated')}
          field="marginAccountBalance"
          type="rightAligned"
          filter="agNumberColumnFilter"
          cellRendererSelector={(): CellRendererSelectorResult => {
            return {
              component: PriceFlashCell,
            };
          }}
          valueGetter={({
            data,
          }: VegaValueGetterParams<Position, 'marginAccountBalance'>) => {
            return !data
              ? undefined
              : toBigNum(data.marginAccountBalance, data.decimals).toNumber();
          }}
          valueFormatter={({
            data,
          }: VegaValueFormatterParams<Position, 'marginAccountBalance'>):
            | string
            | undefined => {
            if (!data) {
              return undefined;
            }
            return addDecimalsFormatNumber(
              data.marginAccountBalance,
              data.decimals
            );
          }}
          minWidth={100}
        />
        <AgGridColumn
          headerName={t('Realised PNL')}
          field="realisedPNL"
          type="rightAligned"
          cellClassRules={signedNumberCssClassRules}
          cellClass="font-mono text-right"
          filter="agNumberColumnFilter"
          valueGetter={({
            data,
          }: VegaValueGetterParams<Position, 'realisedPNL'>) => {
            return !data
              ? undefined
              : toBigNum(data.realisedPNL, data.decimals).toNumber();
          }}
          valueFormatter={({
            data,
          }: VegaValueFormatterParams<Position, 'realisedPNL'>) => {
            return !data
              ? undefined
              : addDecimalsFormatNumber(data.realisedPNL, data.decimals);
          }}
          headerTooltip={t(
            'Profit or loss is realised whenever your position is reduced to zero and the margin is released back to your collateral balance. P&L excludes any fees paid.'
          )}
          cellRenderer={PNLCell}
          minWidth={100}
        />
        <AgGridColumn
          headerName={t('Unrealised PNL')}
          field="unrealisedPNL"
          type="rightAligned"
          cellClassRules={signedNumberCssClassRules}
          cellClass="font-mono text-right"
          filter="agNumberColumnFilter"
          valueGetter={({
            data,
          }: VegaValueGetterParams<Position, 'unrealisedPNL'>) => {
            return !data
              ? undefined
              : toBigNum(data.unrealisedPNL, data.decimals).toNumber();
          }}
          valueFormatter={({
            data,
          }: VegaValueFormatterParams<Position, 'unrealisedPNL'>) =>
            !data
              ? undefined
              : addDecimalsFormatNumber(data.unrealisedPNL, data.decimals)
          }
          headerTooltip={t(
            'Unrealised profit is the current profit on your open position. Margin is still allocated to your position.'
          )}
          cellRenderer={PNLCell}
          minWidth={100}
        />
        <AgGridColumn
          headerName={t('Updated')}
          field="updatedAt"
          type="rightAligned"
          filter={DateRangeFilter}
          valueFormatter={({
            value,
          }: VegaValueFormatterParams<Position, 'updatedAt'>) => {
            if (!value) {
              return value;
            }
            return getDateTimeFormat().format(new Date(value));
          }}
          minWidth={150}
        />
        {onClose && !props.isReadOnly ? (
          <AgGridColumn
            {...COL_DEFS.actions}
            cellRenderer={({ data }: VegaICellRendererParams<Position>) => {
              return (
                <div className="flex gap-2 items-center justify-end">
                  {data?.openVolume && data?.openVolume !== '0' ? (
                    <ButtonLink
                      data-testid="close-position"
                      onClick={() => data && onClose(data)}
                    >
                      {t('Close')}
                    </ButtonLink>
                  ) : null}
                  {data?.assetId && (
                    <PositionTableActions assetId={data?.assetId} />
                  )}
                </div>
              );
            }}
            minWidth={90}
            maxWidth={90}
          />
        ) : null}
      </AgGrid>
    );
  }
);

export default PositionsTable;

export const PNLCell = ({
  valueFormatted,
  data,
}: VegaICellRendererParams<Position, 'realisedPNL'>) => {
  const LOSS_SOCIALIZATION_LINK = DocsLinks?.LOSS_SOCIALIZATION ?? '';

  if (!data) {
    return <>-</>;
  }

  const losses = parseInt(data?.lossSocializationAmount ?? '0');
  if (losses <= 0) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{valueFormatted}</>;
  }

  const lossesFormatted = addDecimalsFormatNumber(
    data.lossSocializationAmount,
    data.decimals
  );

  return (
    <WarningCell
      tooltipContent={
        <>
          <p className="mb-2">
            {t('Lifetime loss socialisation deductions: %s', lossesFormatted)}
          </p>
          {LOSS_SOCIALIZATION_LINK && (
            <ExternalLink href={LOSS_SOCIALIZATION_LINK}>
              {t('Read more about loss socialisation')}
            </ExternalLink>
          )}
        </>
      }
    >
      {valueFormatted}
    </WarningCell>
  );
};

export const OpenVolumeCell = ({
  valueFormatted,
  data,
}: VegaICellRendererParams<Position, 'openVolume'>) => {
  if (!data) {
    return <>-</>;
  }

  if (data.status === PositionStatus.POSITION_STATUS_UNSPECIFIED) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{valueFormatted}</>;
  }

  const POSITION_RESOLUTION_LINK = DocsLinks?.POSITION_RESOLUTION ?? '';

  return (
    <WarningCell
      tooltipContent={
        <>
          <p className="mb-2">
            {t('Your position was affected by market conditions')}
          </p>
          <p className="mb-2">
            {t(
              'Status: %s',
              PositionStatusMapping[
                PositionStatus.POSITION_STATUS_ORDERS_CLOSED
              ]
            )}
          </p>
          {POSITION_RESOLUTION_LINK && (
            <ExternalLink href={POSITION_RESOLUTION_LINK}>
              {t('Read more about position resolution')}
            </ExternalLink>
          )}
        </>
      }
    >
      {valueFormatted}
    </WarningCell>
  );
};

const WarningCell = ({
  children,
  tooltipContent,
}: {
  children: ReactNode;
  tooltipContent: ReactNode;
}) => {
  return (
    <Tooltip description={tooltipContent}>
      <div className="w-full flex items-center justify-between underline decoration-dashed underline-offest-2">
        <span className="text-black dark:text-white mr-1">
          <Icon name="warning-sign" size={3} />
        </span>
        <span className="text-ellipsis overflow-hidden">{children}</span>
      </div>
    </Tooltip>
  );
};
