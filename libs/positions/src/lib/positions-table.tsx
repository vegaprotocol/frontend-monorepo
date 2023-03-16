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
  createDocsLinks,
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
          minWidth={100}
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
            minWidth={80}
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
  const { VEGA_DOCS_URL } = useEnvironment();
  const LOSS_SOCIALIZATION_LINK =
    VEGA_DOCS_URL && createDocsLinks(VEGA_DOCS_URL).LOSS_SOCIALIZATION;

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
          {VEGA_DOCS_URL && (
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
  const { VEGA_DOCS_URL } = useEnvironment();

  if (!data) {
    return <>-</>;
  }

  if (data.status === PositionStatus.POSITION_STATUS_UNSPECIFIED) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{valueFormatted}</>;
  }

  const POSITION_RESOLUTION_LINK =
    VEGA_DOCS_URL && createDocsLinks(VEGA_DOCS_URL).POSITION_RESOLUTION;

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
          {VEGA_DOCS_URL && (
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
