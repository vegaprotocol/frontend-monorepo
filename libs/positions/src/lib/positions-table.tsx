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
import {
  AgGridDynamic as AgGrid,
  DateRangeFilter,
  PriceFlashCell,
  signedNumberCssClass,
  signedNumberCssClassRules,
} from '@vegaprotocol/datagrid';
import {
  ButtonLink,
  Tooltip,
  TooltipCellComponent,
  Link,
  ExternalLink,
  Icon,
  ProgressBarCell,
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
import { useEnvironment } from '@vegaprotocol/environment';

interface Props extends TypedDataAgGrid<Position> {
  onClose?: (data: Position) => void;
  onMarketClick?: (id: string) => void;
  style?: CSSProperties;
  isReadOnly: boolean;
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
    return (
      <AgGrid
        style={{ width: '100%', height: '100%' }}
        overlayNoRowsTemplate={t('No positions')}
        getRowId={getRowId}
        ref={ref}
        tooltipShowDelay={500}
        defaultColDef={{
          flex: 1,
          resizable: true,
          sortable: true,
          filter: true,
          filterParams: { buttons: ['reset'] },
          tooltipComponent: TooltipCellComponent,
        }}
        components={{ AmountCell, PriceFlashCell, ProgressBarCell }}
        {...props}
      >
        <AgGridColumn
          headerName={t('Market')}
          field="marketName"
          cellRenderer={({
            value,
            data,
          }: VegaICellRendererParams<Position, 'marketName'>) =>
            onMarketClick ? (
              <Link
                onClick={() => data?.marketId && onMarketClick(data?.marketId)}
              >
                {value}
              </Link>
            ) : (
              value
            )
          }
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
        />
        <AgGridColumn headerName={t('Settlement asset')} field="assetSymbol" />
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
        />
        <AgGridColumn
          headerName={t('Liquidation price (est)')}
          field="liquidationPrice"
          type="rightAligned"
          cellRendererSelector={(): CellRendererSelectorResult => {
            return {
              component: PriceFlashCell,
            };
          }}
          filter="agNumberColumnFilter"
          valueGetter={({
            data,
          }: VegaValueGetterParams<Position, 'liquidationPrice'>) => {
            return data?.liquidationPrice === undefined || !data
              ? undefined
              : toBigNum(
                  data.liquidationPrice,
                  data.marketDecimalPlaces
                ).toNumber();
          }}
          valueFormatter={({
            data,
          }: VegaValueFormatterParams<Position, 'liquidationPrice'>):
            | string
            | undefined => {
            if (!data || data?.liquidationPrice === undefined) {
              return undefined;
            }
            return addDecimalsFormatNumber(
              data.liquidationPrice,
              data.marketDecimalPlaces
            );
          }}
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
        />
        {onClose && !props.isReadOnly ? (
          <AgGridColumn
            type="rightAligned"
            cellRenderer={({ data }: VegaICellRendererParams<Position>) =>
              data?.openVolume && data?.openVolume !== '0' ? (
                <ButtonLink
                  data-testid="close-position"
                  onClick={() => data && onClose(data)}
                >
                  {t('Close')}
                </ButtonLink>
              ) : null
            }
          />
        ) : null}
      </AgGrid>
    );
  }
);

export default PositionsTable;

const PNLCell = ({
  valueFormatted,
  data,
}: VegaICellRendererParams<Position, 'realisedPNL'>) => {
  const { VEGA_DOCS_URL } = useEnvironment();

  if (!data) {
    return '-';
  }

  const losses = parseInt(data?.lossSocializationAmount ?? '0');
  if (losses <= 0) {
    return valueFormatted;
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
          {VEGA_DOCS_URL && (
            <ExternalLink href={VEGA_DOCS_URL}>
              {t('Reade more about loss socialisation')}
            </ExternalLink>
          )}
        </>
      }
    >
      {valueFormatted}
    </WarningCell>
  );
};

const OpenVolumeCell = ({
  valueFormatted,
  data,
}: VegaICellRendererParams<Position, 'openVolume'>) => {
  const { VEGA_DOCS_URL } = useEnvironment();

  if (!data) {
    return '-';
  }

  if (data.status === PositionStatus.POSITION_STATUS_UNSPECIFIED) {
    return valueFormatted;
  }

  return (
    <WarningCell
      tooltipContent={
        <>
          <p className="mb-2">
            {t('Your positions was affected by market conditions')}
          </p>
          <p className="mb-2">
            {t('Status: %s', PositionStatusMapping[data.status])}
          </p>
          {VEGA_DOCS_URL && (
            <ExternalLink href={VEGA_DOCS_URL}>
              {t('Reade more about position resolution')}
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
