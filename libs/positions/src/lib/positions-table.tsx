import classNames from 'classnames';
import { useMemo } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { ColDef } from 'ag-grid-community';
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
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import {
  volumePrefix,
  toBigNum,
  formatNumber,
  addDecimalsFormatNumber,
  addDecimalsFormatNumberQuantum,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import type { Position } from './positions-data-providers';
import * as Schema from '@vegaprotocol/types';
import { PositionStatus, PositionStatusMapping } from '@vegaprotocol/types';
import { DocsLinks } from '@vegaprotocol/environment';
import { PositionActionsDropdown } from './position-actions-dropdown';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { LiquidationPrice } from './liquidation-price';
import { StackedCell } from './stacked-cell';

interface Props extends TypedDataAgGrid<Position> {
  onClose?: (data: Position) => void;
  onMarketClick?: (id: string, metaKey?: boolean) => void;
  style?: CSSProperties;
  isReadOnly: boolean;
  multipleKeys?: boolean;
  pubKeys?: VegaWalletContextShape['pubKeys'];
  pubKey?: VegaWalletContextShape['pubKey'];
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

export const getRowId = ({ data }: { data: Position }) =>
  `${data.partyId}-${data.marketId}`;

const defaultColDef = {
  sortable: true,
  filter: true,
  filterParams: { buttons: ['reset'] },
  tooltipComponent: TooltipCellComponent,
  resizable: true,
};

export const PositionsTable = ({
  onClose,
  onMarketClick,
  multipleKeys,
  isReadOnly,
  pubKeys,
  pubKey,
  ...props
}: Props) => {
  return (
    <AgGrid
      overlayNoRowsTemplate={t('No positions')}
      getRowId={getRowId}
      tooltipShowDelay={500}
      defaultColDef={defaultColDef}
      components={{
        AmountCell,
        PriceFlashCell,
        ProgressBarCell,
        MarketNameCell,
      }}
      rowHeight={45}
      columnDefs={useMemo<ColDef[]>(() => {
        const columnDefs: (ColDef | null)[] = [
          multipleKeys
            ? {
                headerName: t('Vega key'),
                field: 'partyId',
                valueGetter: ({ data }: VegaValueGetterParams<Position>) =>
                  (data?.partyId &&
                    pubKeys &&
                    pubKeys.find((key) => key.publicKey === data.partyId)
                      ?.name) ||
                  data?.partyId,
              }
            : null,
          {
            headerName: t('Market'),
            field: 'marketCode',
            onCellClicked: ({ data }) => {
              if (!onMarketClick) return;
              onMarketClick(data.marketId);
            },
            cellRenderer: ({
              value,
              data,
            }: VegaICellRendererParams<Position, 'marketCode'>) => {
              if (!data || !value) return '-';
              return (
                <StackedCell primary={value} secondary={data?.assetSymbol} />
              );
            },
          },
          {
            headerName: t('Size / Notional'),
            field: 'openVolume',
            type: 'rightAligned',
            cellClass: 'font-mono text-right',
            cellClassRules: signedNumberCssClassRules,
            filter: 'agNumberColumnFilter',
            valueGetter: ({ data }: VegaValueGetterParams<Position>) => {
              return data?.openVolume === undefined
                ? undefined
                : toBigNum(
                    data?.openVolume,
                    data.positionDecimalPlaces
                  ).toNumber();
            },
            valueFormatter: ({
              data,
            }: VegaValueFormatterParams<Position, 'openVolume'>): string => {
              if (!data?.openVolume) return '-';

              const vol = volumePrefix(
                addDecimalsFormatNumber(
                  data.openVolume,
                  data.positionDecimalPlaces
                )
              );

              return vol;
            },
            cellRenderer: OpenVolumeCell,
          },
          {
            headerName: t('Entry / Mark'),
            field: 'markPrice',
            type: 'rightAligned',
            cellClass: 'font-mono text-right',
            cellRenderer: ({
              data,
            }: VegaICellRendererParams<Position, 'markPrice'>) => {
              if (
                !data?.averageEntryPrice ||
                !data?.markPrice ||
                !data?.marketDecimalPlaces
              ) {
                return <>-</>;
              }

              if (
                data.marketTradingMode ===
                Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION
              ) {
                return <>-</>;
              }

              const entry = addDecimalsFormatNumber(
                data.averageEntryPrice,
                data.marketDecimalPlaces
              );
              const mark = addDecimalsFormatNumber(
                data.markPrice,
                data.marketDecimalPlaces
              );
              return (
                <StackedCell
                  primary={entry}
                  secondary={
                    <PriceFlashCell
                      value={Number(data.markPrice)}
                      valueFormatted={mark}
                    />
                  }
                />
              );
            },
            filter: 'agNumberColumnFilter',
            valueGetter: ({ data }: VegaValueGetterParams<Position>) => {
              return !data ||
                !data.markPrice ||
                data.marketTradingMode ===
                  Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION
                ? undefined
                : toBigNum(data.markPrice, data.marketDecimalPlaces).toNumber();
            },
          },
          {
            headerName: t('Margin'),
            colId: 'margin',
            type: 'rightAligned',
            cellClass: 'font-mono text-right',
            filter: 'agNumberColumnFilter',
            valueGetter: ({ data }: VegaValueGetterParams<Position>) => {
              return !data
                ? undefined
                : toBigNum(
                    data.marginAccountBalance,
                    data.assetDecimals
                  ).toNumber();
            },
            cellRenderer: ({ data }: VegaICellRendererParams<Position>) => {
              if (
                !data ||
                !data.marginAccountBalance ||
                !data.marketDecimalPlaces
              ) {
                return null;
              }
              const margin = addDecimalsFormatNumberQuantum(
                data.marginAccountBalance,
                data.assetDecimals,
                data.quantum
              );

              const lev = data?.currentLeverage ? data.currentLeverage : 1;
              const leverage = formatNumber(Math.max(1, lev), 1);
              return (
                <StackedCell primary={margin} secondary={leverage + 'x'} />
              );
            },
          },
          {
            colId: 'liquidationPrice',
            headerName: 'Liquidation',
            headerTooltip: t('Worst case liquidation price'),
            cellClass: 'font-mono text-right',
            type: 'rightAligned',
            // Cannot be sortable as data is fetched within the cell
            sortable: false,
            filter: false,
            cellRenderer: ({ data }: VegaICellRendererParams<Position>) => {
              if (!data) {
                return '-';
              }
              return (
                <LiquidationPrice
                  marketId={data.marketId}
                  openVolume={data.openVolume}
                  collateralAvailable={data.totalBalance}
                  marketDecimalPlaces={data.marketDecimalPlaces}
                />
              );
            },
          },
          {
            headerName: t('Realised PNL'),
            field: 'realisedPNL',
            type: 'rightAligned',
            cellClassRules: signedNumberCssClassRules,
            cellClass: 'font-mono text-right',
            filter: 'agNumberColumnFilter',
            valueGetter: ({ data }: VegaValueGetterParams<Position>) => {
              return !data
                ? undefined
                : toBigNum(data.realisedPNL, data.assetDecimals).toNumber();
            },
            valueFormatter: ({
              data,
            }: VegaValueFormatterParams<Position, 'realisedPNL'>) => {
              return !data
                ? ''
                : addDecimalsFormatNumberQuantum(
                    data.realisedPNL,
                    data.assetDecimals,
                    data.quantum
                  );
            },
            headerTooltip: t(
              'Profit or loss is realised whenever your position is reduced to zero and the margin is released back to your collateral balance. P&L excludes any fees paid.'
            ),
            cellRenderer: PNLCell,
          },
          {
            headerName: t('Unrealised PNL'),
            field: 'unrealisedPNL',
            type: 'rightAligned',
            cellClassRules: signedNumberCssClassRules,
            cellClass: 'font-mono text-right',
            filter: 'agNumberColumnFilter',
            valueGetter: ({ data }: VegaValueGetterParams<Position>) => {
              return !data
                ? undefined
                : toBigNum(data.unrealisedPNL, data.assetDecimals).toNumber();
            },
            valueFormatter: ({
              data,
            }: VegaValueFormatterParams<Position, 'unrealisedPNL'>) =>
              !data
                ? ''
                : addDecimalsFormatNumberQuantum(
                    data.unrealisedPNL,
                    data.assetDecimals,
                    data.quantum
                  ),
            headerTooltip: t(
              'Unrealised profit is the current profit on your open position. Margin is still allocated to your position.'
            ),
          },
          onClose && !isReadOnly
            ? {
                ...COL_DEFS.actions,
                cellRenderer: ({ data }: VegaICellRendererParams<Position>) => {
                  return (
                    <div className="flex gap-2 items-center justify-end">
                      {data?.openVolume &&
                      data?.openVolume !== '0' &&
                      data.partyId === pubKey ? (
                        <ButtonLink
                          data-testid="close-position"
                          onClick={() => data && onClose(data)}
                        >
                          <VegaIcon name={VegaIconNames.CROSS} size={16} />
                        </ButtonLink>
                      ) : null}
                      {data?.assetId && (
                        <PositionActionsDropdown assetId={data?.assetId} />
                      )}
                    </div>
                  );
                },
                minWidth: 75,
                maxWidth: 75,
              }
            : null,
        ];
        return columnDefs.filter<ColDef>(
          (colDef: ColDef | null): colDef is ColDef => colDef !== null
        );
      }, [isReadOnly, multipleKeys, onClose, onMarketClick, pubKey, pubKeys])}
      {...props}
    />
  );
};

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
    data.assetDecimals
  );

  return (
    <WarningCell
      tooltipContent={
        <>
          <p className="mb-2">
            {t('Lifetime loss socialisation deductions: %s', lossesFormatted)}
          </p>
          <p className="mb-2">
            {t(
              `You received less %s in gains that you should have when the market moved in your favour. This occurred because one or more other trader(s) were closed out and did not have enough funds to cover their losses, and the market's insurance pool was empty.`,
              [data.assetSymbol]
            )}
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
  if (!valueFormatted || !data || !data.notional) {
    return <>-</>;
  }

  const notional = addDecimalsFormatNumber(
    data.notional,
    data.marketDecimalPlaces
  );

  const cellContent = (
    <StackedCell primary={valueFormatted} secondary={notional} />
  );

  if (data.status === PositionStatus.POSITION_STATUS_UNSPECIFIED) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{cellContent}</>;
  }

  const POSITION_RESOLUTION_LINK = DocsLinks?.POSITION_RESOLUTION ?? '';

  let primaryTooltip;
  switch (data.status) {
    case PositionStatus.POSITION_STATUS_CLOSED_OUT:
      primaryTooltip = t('Your position was closed.');
      break;
    case PositionStatus.POSITION_STATUS_ORDERS_CLOSED:
      primaryTooltip = t('Your open orders were cancelled.');
      break;
    case PositionStatus.POSITION_STATUS_DISTRESSED:
      primaryTooltip = t('Your position is distressed.');
      break;
  }

  let secondaryTooltip;
  switch (data.status) {
    case PositionStatus.POSITION_STATUS_CLOSED_OUT:
      secondaryTooltip = t(
        `You did not have enough %s collateral to meet the maintenance margin requirements for your position, so it was closed by the network.`,
        [data.assetSymbol]
      );
      break;
    case PositionStatus.POSITION_STATUS_ORDERS_CLOSED:
      secondaryTooltip = t(
        'The position was distressed, but removing open orders from the book brought the margin level back to a point where the open position could be maintained.'
      );
      break;
    case PositionStatus.POSITION_STATUS_DISTRESSED:
      secondaryTooltip = t(
        'The position was distressed, but could not be closed out - orders were removed from the book, and the open volume will be closed out once there is sufficient volume on the book.'
      );
      break;
    default:
      secondaryTooltip = t('Maintained by network');
  }
  return (
    <WarningCell
      showIcon={data.status !== PositionStatus.POSITION_STATUS_UNSPECIFIED}
      tooltipContent={
        <>
          <p className="mb-2">{primaryTooltip}</p>
          <p className="mb-2">{secondaryTooltip}</p>
          <p className="mb-2">
            {t('Status: %s', PositionStatusMapping[data.status])}
          </p>
          {POSITION_RESOLUTION_LINK && (
            <ExternalLink href={POSITION_RESOLUTION_LINK}>
              {t('Read more about position resolution')}
            </ExternalLink>
          )}
        </>
      }
    >
      {cellContent}
    </WarningCell>
  );
};

const WarningCell = ({
  children,
  tooltipContent,
  showIcon = true,
}: {
  children: ReactNode;
  tooltipContent: ReactNode;
  showIcon?: boolean;
}) => {
  return (
    <Tooltip description={tooltipContent}>
      <div className="flex justify-end items-center">
        <span className="text-black dark:text-white mr-2">
          {showIcon && (
            <VegaIcon name={VegaIconNames.EXCLAIMATION_MARK} size={12} />
          )}
        </span>
        <span className="overflow-hidden whitespace-nowrap text-ellipsis">
          {children}
        </span>
      </div>
    </Tooltip>
  );
};
