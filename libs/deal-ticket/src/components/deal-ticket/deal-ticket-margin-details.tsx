import { useCallback, useState } from 'react';
import { getAsset, getQuoteName } from '@vegaprotocol/markets';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { AccountBreakdownDialog } from '@vegaprotocol/accounts';
import { formatRange, formatValue } from '@vegaprotocol/utils';
import { marketMarginDataProvider } from '@vegaprotocol/accounts';
import { useDataProvider } from '@vegaprotocol/data-provider';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import * as Schema from '@vegaprotocol/types';
import {
  MARGIN_DIFF_TOOLTIP_TEXT,
  DEDUCTION_FROM_COLLATERAL_TOOLTIP_TEXT,
  TOTAL_MARGIN_AVAILABLE,
  LIQUIDATION_PRICE_ESTIMATE_TOOLTIP_TEXT,
  EST_TOTAL_MARGIN_TOOLTIP_TEXT,
  MARGIN_ACCOUNT_TOOLTIP_TEXT,
} from '../../constants';
import { KeyValue } from './key-value';
import {
  Accordion,
  AccordionChevron,
  AccordionPanel,
  ExternalLink,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import { useT, ns } from '../../use-t';
import { Trans } from 'react-i18next';
import type { Market } from '@vegaprotocol/markets';
import { emptyValue } from './deal-ticket-fee-details';
import type { EstimatePositionQuery } from '@vegaprotocol/positions';

export interface DealTicketMarginDetailsProps {
  generalAccountBalance?: string;
  marginAccountBalance?: string;
  orderMarginAccountBalance?: string;
  market: Market;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  assetSymbol: string;
  positionEstimate: EstimatePositionQuery['estimatePosition'];
  side: Schema.Side;
}

export const DealTicketMarginDetails = ({
  marginAccountBalance,
  generalAccountBalance,
  orderMarginAccountBalance,
  assetSymbol,
  market,
  onMarketClick,
  positionEstimate,
  side,
}: DealTicketMarginDetailsProps) => {
  const t = useT();
  const [breakdownDialog, setBreakdownDialog] = useState(false);
  const { pubKey: partyId } = useVegaWallet();
  const { data: currentMargins } = useDataProvider({
    dataProvider: marketMarginDataProvider,
    variables: { marketId: market.id, partyId: partyId || '' },
    skip: !partyId,
  });
  const isInIsolatedMode =
    positionEstimate?.margin.bestCase.marginMode ===
    Schema.MarginMode.MARGIN_MODE_ISOLATED_MARGIN;
  const liquidationEstimate = positionEstimate?.liquidation;
  const marginEstimate = positionEstimate?.margin;
  const totalMarginAccountBalance =
    BigInt(marginAccountBalance || '0') +
    BigInt(orderMarginAccountBalance || '0');
  const totalBalance =
    BigInt(generalAccountBalance || '0') + totalMarginAccountBalance;
  const asset = getAsset(market);
  const { decimals: assetDecimals, quantum } = asset;
  let marginRequiredBestCase: string | undefined = undefined;
  let marginRequiredWorstCase: string | undefined = undefined;

  const collateralIncreaseEstimateBestCase = BigInt(
    positionEstimate?.collateralIncreaseEstimate.bestCase ?? '0'
  );
  const collateralIncreaseEstimateWorstCase = BigInt(
    positionEstimate?.collateralIncreaseEstimate.worstCase ?? '0'
  );
  const marginEstimateBestCase = isInIsolatedMode
    ? totalMarginAccountBalance + collateralIncreaseEstimateBestCase
    : BigInt(marginEstimate?.bestCase.initialLevel ?? 0);
  const marginEstimateWorstCase = isInIsolatedMode
    ? totalMarginAccountBalance + collateralIncreaseEstimateWorstCase
    : BigInt(marginEstimate?.worstCase.initialLevel ?? 0);
  if (isInIsolatedMode) {
    marginRequiredBestCase = collateralIncreaseEstimateBestCase.toString();
    marginRequiredWorstCase = collateralIncreaseEstimateWorstCase.toString();
  } else if (marginEstimate) {
    if (currentMargins) {
      const currentMargin = BigInt(currentMargins.initialLevel);
      marginRequiredBestCase = (
        marginEstimateBestCase - currentMargin
      ).toString();
      if (marginRequiredBestCase.startsWith('-')) {
        marginRequiredBestCase = '0';
      }

      marginRequiredWorstCase = (
        marginEstimateWorstCase - currentMargin
      ).toString();

      if (marginRequiredWorstCase.startsWith('-')) {
        marginRequiredWorstCase = '0';
      }
    } else {
      marginRequiredBestCase = marginEstimateBestCase.toString();
      marginRequiredWorstCase = marginEstimateWorstCase.toString();
    }
  }

  const totalMarginAvailable = (
    currentMargins
      ? totalBalance - BigInt(currentMargins.maintenanceLevel)
      : totalBalance
  ).toString();

  let deductionFromCollateral = null;
  let projectedMargin = null;
  if (totalMarginAccountBalance) {
    const deductionFromCollateralBestCase =
      marginEstimateBestCase - totalMarginAccountBalance;

    const deductionFromCollateralWorstCase =
      marginEstimateWorstCase - totalMarginAccountBalance;

    deductionFromCollateral = (
      <KeyValue
        indent
        label={t('Deduction from collateral')}
        value={formatRange(
          deductionFromCollateralBestCase > 0
            ? deductionFromCollateralBestCase.toString()
            : '0',
          deductionFromCollateralWorstCase > 0
            ? deductionFromCollateralWorstCase.toString()
            : '0',
          assetDecimals
        )}
        formattedValue={formatValue(
          deductionFromCollateralWorstCase > 0
            ? deductionFromCollateralWorstCase.toString()
            : '0',
          assetDecimals,
          quantum
        )}
        symbol={assetSymbol}
        labelDescription={t(
          'DEDUCTION_FROM_COLLATERAL_TOOLTIP_TEXT',
          DEDUCTION_FROM_COLLATERAL_TOOLTIP_TEXT,
          { assetSymbol }
        )}
      />
    );
    projectedMargin = (
      <KeyValue
        label={t('Projected margin')}
        value={formatRange(
          marginEstimateBestCase.toString(),
          marginEstimateWorstCase.toString(),
          assetDecimals
        )}
        formattedValue={formatValue(
          marginEstimateWorstCase.toString(),
          assetDecimals,
          quantum
        )}
        symbol={assetSymbol}
        labelDescription={t(
          'EST_TOTAL_MARGIN_TOOLTIP_TEXT',
          EST_TOTAL_MARGIN_TOOLTIP_TEXT
        )}
      />
    );
  }

  let liquidationPriceEstimate = emptyValue;
  let liquidationPriceEstimateRange = emptyValue;

  if (liquidationEstimate) {
    const liquidationEstimateBestCaseIncludingBuyOrders = BigInt(
      liquidationEstimate.bestCase.including_buy_orders.replace(/\..*/, '')
    );
    const liquidationEstimateBestCaseIncludingSellOrders = BigInt(
      liquidationEstimate.bestCase.including_sell_orders.replace(/\..*/, '')
    );
    const liquidationEstimateBestCase =
      side === Schema.Side.SIDE_BUY
        ? liquidationEstimateBestCaseIncludingBuyOrders
        : liquidationEstimateBestCaseIncludingSellOrders;

    const liquidationEstimateWorstCaseIncludingBuyOrders = BigInt(
      liquidationEstimate.worstCase.including_buy_orders.replace(/\..*/, '')
    );
    const liquidationEstimateWorstCaseIncludingSellOrders = BigInt(
      liquidationEstimate.worstCase.including_sell_orders.replace(/\..*/, '')
    );
    const liquidationEstimateWorstCase =
      side === Schema.Side.SIDE_BUY
        ? liquidationEstimateWorstCaseIncludingBuyOrders
        : liquidationEstimateWorstCaseIncludingSellOrders;

    liquidationPriceEstimate = formatValue(
      liquidationEstimateWorstCase.toString(),
      market.decimalPlaces,
      undefined,
      market.decimalPlaces
    );
    liquidationPriceEstimateRange = formatRange(
      (liquidationEstimateBestCase < liquidationEstimateWorstCase
        ? liquidationEstimateBestCase
        : liquidationEstimateWorstCase
      ).toString(),
      (liquidationEstimateBestCase > liquidationEstimateWorstCase
        ? liquidationEstimateBestCase
        : liquidationEstimateWorstCase
      ).toString(),
      market.decimalPlaces,
      undefined,
      market.decimalPlaces
    );
  }

  const onAccountBreakdownDialogClose = useCallback(
    () => setBreakdownDialog(false),
    []
  );

  const quoteName = getQuoteName(market);

  return (
    <div className="flex flex-col w-full gap-2">
      <Accordion>
        <AccordionPanel
          itemId="margin"
          trigger={
            <AccordionPrimitive.Trigger
              data-testid="accordion-toggle"
              className={classNames(
                'w-full pt-2',
                'flex items-center gap-2 text-xs',
                'group'
              )}
            >
              <div
                data-testid={`deal-ticket-fee-margin-required`}
                key={'value-dropdown'}
                className="flex items-center justify-between w-full gap-2"
              >
                <div className="flex items-center text-left gap-1">
                  <Tooltip
                    description={t(
                      'MARGIN_DIFF_TOOLTIP_TEXT',
                      MARGIN_DIFF_TOOLTIP_TEXT,
                      { assetSymbol }
                    )}
                  >
                    <span className="text-muted">{t('Margin required')}</span>
                  </Tooltip>

                  <AccordionChevron size={10} />
                </div>
                <Tooltip
                  description={
                    formatRange(
                      marginRequiredBestCase,
                      marginRequiredWorstCase,
                      assetDecimals
                    ) ?? '-'
                  }
                >
                  <div className="font-mono text-right">
                    {formatValue(
                      marginRequiredWorstCase,
                      assetDecimals,
                      quantum
                    )}{' '}
                    {assetSymbol || ''}
                  </div>
                </Tooltip>
              </div>
            </AccordionPrimitive.Trigger>
          }
        >
          <div className="flex flex-col w-full gap-2">
            <KeyValue
              label={t('Total margin available')}
              indent
              value={formatValue(totalMarginAvailable, assetDecimals)}
              formattedValue={formatValue(
                totalMarginAvailable,
                assetDecimals,
                quantum
              )}
              symbol={assetSymbol}
              labelDescription={t(
                'TOTAL_MARGIN_AVAILABLE',
                TOTAL_MARGIN_AVAILABLE,
                {
                  generalAccountBalance: formatValue(
                    generalAccountBalance,
                    assetDecimals,
                    quantum
                  ),
                  marginAccountBalance: formatValue(
                    marginAccountBalance,
                    assetDecimals,
                    quantum
                  ),
                  orderMarginAccountBalance: formatValue(
                    orderMarginAccountBalance,
                    assetDecimals,
                    quantum
                  ),
                  marginMaintenance: formatValue(
                    currentMargins?.maintenanceLevel,
                    assetDecimals,
                    quantum
                  ),
                  assetSymbol,
                }
              )}
            />
            {deductionFromCollateral}
            <KeyValue
              label={t('Current margin allocation')}
              indent
              onClick={
                generalAccountBalance
                  ? () => setBreakdownDialog(true)
                  : undefined
              }
              value={formatValue(
                totalMarginAccountBalance.toString(),
                assetDecimals
              )}
              symbol={assetSymbol}
              labelDescription={t(
                'MARGIN_ACCOUNT_TOOLTIP_TEXT',
                MARGIN_ACCOUNT_TOOLTIP_TEXT
              )}
              formattedValue={formatValue(
                totalMarginAccountBalance.toString(),
                assetDecimals,
                quantum
              )}
            />
          </div>
        </AccordionPanel>
      </Accordion>
      {projectedMargin}
      <KeyValue
        label={t('Liquidation')}
        value={liquidationPriceEstimateRange}
        formattedValue={liquidationPriceEstimate}
        symbol={quoteName}
        labelDescription={
          <>
            <span>
              {t(
                'LIQUIDATION_PRICE_ESTIMATE_TOOLTIP_TEXT',
                LIQUIDATION_PRICE_ESTIMATE_TOOLTIP_TEXT
              )}
            </span>{' '}
            <span>
              <Trans
                defaults="For full details please see <0>liquidation price estimate documentation</0>."
                components={[
                  <ExternalLink
                    href={
                      'https://github.com/vegaprotocol/specs/blob/master/non-protocol-specs/0012-NP-LIPE-liquidation-price-estimate.md'
                    }
                  >
                    liquidation price estimate documentation
                  </ExternalLink>,
                ]}
                ns={ns}
              />
            </span>
          </>
        }
      />
      {partyId && (
        <AccountBreakdownDialog
          assetId={breakdownDialog ? asset.id : undefined}
          partyId={partyId}
          onMarketClick={onMarketClick}
          onClose={onAccountBreakdownDialogClose}
        />
      )}
    </div>
  );
};
