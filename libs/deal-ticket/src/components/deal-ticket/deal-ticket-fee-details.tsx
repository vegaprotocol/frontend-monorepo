import { Tooltip } from '@vegaprotocol/ui-toolkit';
import type { MarginLevels } from '@vegaprotocol/types';
import classnames from 'classnames';
import type { ReactNode } from 'react';
import { t } from '@vegaprotocol/i18n';
import { FeesBreakdown } from '@vegaprotocol/market-info';
import { getFeeDetailsValues } from '../../hooks/use-estimate-fees';
import type { FeeDetails } from '../../hooks/use-estimate-fees';
import { useVegaWallet } from '@vegaprotocol/wallet';

import type { Market } from '@vegaprotocol/markets';
import type { EstimatePositionQuery } from '@vegaprotocol/positions';
import type { EstimateFeesQuery } from '../../hooks/__generated__/EstimateOrder';

import { addDecimalsFormatNumber, isNumeric } from '@vegaprotocol/utils';
import { marketMarginDataProvider } from '@vegaprotocol/positions';
import { useDataProvider } from '@vegaprotocol/data-provider';

import {
  EST_TOTAL_MARGIN_TOOLTIP_TEXT,
  NOTIONAL_SIZE_TOOLTIP_TEXT,
  MARGIN_ACCOUNT_TOOLTIP_TEXT,
  MARGIN_DIFF_TOOLTIP_TEXT,
  DEDUCTION_FROM_COLLATERAL_TOOLTIP_TEXT,
  TOTAL_MARGIN_AVAILABLE,
  LIQUIDATION_PRICE_ESTIMATE_TOOLTIP_TEXT,
} from '../../constants';

const emptyValue = '-';
const formatValue = (
  value: string | number | null | undefined,
  formatDecimals: number
): string => {
  return isNumeric(value)
    ? addDecimalsFormatNumber(value, formatDecimals)
    : emptyValue;
};
const formatRange = (
  min: string | number | null | undefined,
  max: string | number | null | undefined,
  formatDecimals: number
) => {
  const minFormatted = formatValue(min, formatDecimals);
  const maxFormatted = formatValue(max, formatDecimals);
  if (minFormatted !== maxFormatted) {
    return `${minFormatted} - ${maxFormatted}`;
  }
  if (minFormatted !== emptyValue) {
    return minFormatted;
  }
  return maxFormatted;
};
export interface DealTicketFeeDetailPros {
  label: string;
  value?: string | null | undefined;
  symbol: string;
  indent?: boolean | undefined;
  labelDescription?: ReactNode;
}

export const DealTicketFeeDetail = ({
  label,
  value,
  labelDescription,
  symbol,
  indent,
}: DealTicketFeeDetailPros) => (
  <div
    key={typeof label === 'string' ? label : 'value-dropdown'}
    className={classnames(
      'text-xs mt-2 flex justify-between items-center gap-4 flex-wrap',
      { 'ml-2': indent }
    )}
  >
    <div>
      <Tooltip description={labelDescription}>
        <div>{label}</div>
      </Tooltip>
    </div>
    <div className="text-neutral-500 dark:text-neutral-300">{`${value ?? '-'} ${
      symbol || ''
    }`}</div>
  </div>
);

export const MarginStackChart = (
  props: Pick<
    MarginLevels,
    | 'collateralReleaseLevel'
    | 'initialLevel'
    | 'maintenanceLevel'
    | 'searchLevel'
  >
) => {
  const collateralReleaseLevel = Number(props.collateralReleaseLevel);
  const initialLevel = Number(props.initialLevel);
  const maintenanceLevel = Number(props.maintenanceLevel);
  const searchLevel = Number(props.searchLevel);
  const red = maintenanceLevel / collateralReleaseLevel;
  const orange = (searchLevel - maintenanceLevel) / collateralReleaseLevel;
  const yellow =
    ((searchLevel + initialLevel) / 2 - searchLevel) / collateralReleaseLevel;

  return (
    <div style={{ height: '15px', display: 'flex', backgroundColor: 'green' }}>
      <div
        style={{
          height: '100%',
          width: `${red * 100}%`,
          backgroundColor: 'red',
        }}
      ></div>
      <div
        style={{
          height: '100%',
          width: `${orange * 100}%`,
          backgroundColor: 'orange',
        }}
      ></div>
      <div
        style={{
          height: '100%',
          width: `${yellow * 100}%`,
          backgroundColor: 'yellow',
        }}
      ></div>
      <div
        style={{
          borderRight: '1px solid black',
          height: '100%',
          marginLeft: `${yellow * 100}%`,
        }}
      ></div>
    </div>
  );
};

export interface DealTicketFeeDetailsProps {
  generalAccountBalance?: string;
  marginAccountBalance?: string;
  market: Market;
  assetSymbol: string;
  notionalSize: string | null;
  feeEstimate: EstimateFeesQuery['estimateFees'] | undefined;
  positionEstimate: EstimatePositionQuery['estimatePosition'];
}

export const DealTicketFeeDetails = ({
  marginAccountBalance,
  generalAccountBalance,
  assetSymbol,
  feeEstimate,
  market,
  notionalSize,
  positionEstimate,
}: DealTicketFeeDetailsProps) => {
  const { pubKey } = useVegaWallet();
  const { data: currentMargins } = useDataProvider({
    dataProvider: marketMarginDataProvider,
    variables: { marketId: market.id, partyId: pubKey || '' },
    skip: !pubKey,
  });
  const liquidationEstimate = positionEstimate?.liquidation;
  const marginEstimate = positionEstimate?.margin;
  const totalBalance =
    BigInt(generalAccountBalance || '0') + BigInt(marginAccountBalance || '0');
  const assetDecimals =
    market.tradableInstrument.instrument.product.settlementAsset.decimals;
  let marginRequiredBestCase: string | undefined = undefined;
  let marginRequiredWorstCase: string | undefined = undefined;
  if (marginEstimate) {
    if (currentMargins) {
      marginRequiredBestCase = (
        BigInt(marginEstimate.bestCase.initialLevel) -
        BigInt(currentMargins.initialLevel)
      ).toString();
      if (marginRequiredBestCase.startsWith('-')) {
        marginRequiredBestCase = '0';
      }
      marginRequiredWorstCase = (
        BigInt(marginEstimate.worstCase.initialLevel) -
        BigInt(currentMargins.initialLevel)
      ).toString();
      if (marginRequiredWorstCase.startsWith('-')) {
        marginRequiredWorstCase = '0';
      }
    } else {
      marginRequiredBestCase = marginEstimate.bestCase.initialLevel;
      marginRequiredWorstCase = marginEstimate.worstCase.initialLevel;
    }
  }

  const totalMarginAvailable = (
    currentMargins
      ? totalBalance - BigInt(currentMargins.maintenanceLevel)
      : totalBalance
  ).toString();

  let deductionFromCollateral = null;
  if (marginAccountBalance) {
    const deductionFromCollateralBestCase =
      BigInt(marginEstimate?.bestCase.initialLevel ?? 0) -
      BigInt(marginAccountBalance);

    const deductionFromCollateralWorstCase =
      BigInt(marginEstimate?.worstCase.initialLevel ?? 0) -
      BigInt(marginAccountBalance);

    deductionFromCollateral = (
      <DealTicketFeeDetail
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
        symbol={assetSymbol}
        labelDescription={DEDUCTION_FROM_COLLATERAL_TOOLTIP_TEXT(assetSymbol)}
      />
    );
  }

  let liquidationPriceEstimate = emptyValue;

  if (liquidationEstimate) {
    const liquidationEstimateBestCaseIncludingBuyOrders = BigInt(
      liquidationEstimate.bestCase.including_buy_orders.replace(/\..*/, '')
    );
    const liquidationEstimateBestCaseIncludingSellOrders = BigInt(
      liquidationEstimate.bestCase.including_sell_orders.replace(/\..*/, '')
    );
    const liquidationEstimateBestCase =
      liquidationEstimateBestCaseIncludingBuyOrders >
      liquidationEstimateBestCaseIncludingSellOrders
        ? liquidationEstimateBestCaseIncludingBuyOrders
        : liquidationEstimateBestCaseIncludingSellOrders;

    const liquidationEstimateWorstCaseIncludingBuyOrders = BigInt(
      liquidationEstimate.worstCase.including_buy_orders.replace(/\..*/, '')
    );
    const liquidationEstimateWorstCaseIncludingSellOrders = BigInt(
      liquidationEstimate.worstCase.including_sell_orders.replace(/\..*/, '')
    );
    const liquidationEstimateWorstCase =
      liquidationEstimateWorstCaseIncludingBuyOrders >
      liquidationEstimateWorstCaseIncludingSellOrders
        ? liquidationEstimateWorstCaseIncludingBuyOrders
        : liquidationEstimateWorstCaseIncludingSellOrders;
    liquidationPriceEstimate = formatRange(
      (liquidationEstimateBestCase < liquidationEstimateWorstCase
        ? liquidationEstimateBestCase
        : liquidationEstimateWorstCase
      ).toString(),
      (liquidationEstimateBestCase > liquidationEstimateWorstCase
        ? liquidationEstimateBestCase
        : liquidationEstimateWorstCase
      ).toString(),
      assetDecimals
    );
  }

  return (
    <div>
      <DealTicketFeeDetail
        label={t('Notional')}
        value={formatValue(notionalSize, assetDecimals)}
        symbol={assetSymbol}
        labelDescription={NOTIONAL_SIZE_TOOLTIP_TEXT(assetSymbol)}
      />
      <DealTicketFeeDetail
        label={t('Fees')}
        value={
          feeEstimate?.totalFeeAmount &&
          `~${formatValue(feeEstimate?.totalFeeAmount, assetDecimals)}`
        }
        labelDescription={
          <>
            <span>
              {t(
                `An estimate of the most you would be expected to pay in fees, in the market's settlement asset ${assetSymbol}.`
              )}
            </span>
            <FeesBreakdown
              fees={feeEstimate?.fees}
              feeFactors={market.fees.factors}
              symbol={assetSymbol}
              decimals={assetDecimals}
            />
          </>
        }
        symbol={assetSymbol}
      />
      <DealTicketFeeDetail
        label={t('Margin required')}
        value={formatRange(
          marginRequiredBestCase,
          marginRequiredWorstCase,
          assetDecimals
        )}
        labelDescription={MARGIN_DIFF_TOOLTIP_TEXT(assetSymbol)}
        symbol={assetSymbol}
      />
      {currentMargins ? (
        <div>
          <div className="text-xs mt-2 mb-1">Current margin</div>
          <MarginStackChart {...currentMargins} />
        </div>
      ) : null}
      {positionEstimate ? (
        <div>
          <div className="text-xs mt-2 mb-1">Projected margin best case</div>
          <MarginStackChart {...positionEstimate.margin.bestCase} />
        </div>
      ) : null}
      {positionEstimate ? (
        <div>
          <div className="text-xs mt-2 mb-1">Projected margin worst case</div>
          <MarginStackChart {...positionEstimate.margin.worstCase} />
        </div>
      ) : null}
      <DealTicketFeeDetail
        label={t('Total margin available')}
        value={formatValue(totalMarginAvailable, assetDecimals)}
        symbol={assetSymbol}
        labelDescription={TOTAL_MARGIN_AVAILABLE(
          formatValue(generalAccountBalance, assetDecimals),
          formatValue(marginAccountBalance, assetDecimals),
          formatValue(currentMargins?.maintenanceLevel, assetDecimals),
          assetSymbol
        )}
      />
      {deductionFromCollateral}
      <DealTicketFeeDetail
        label={t('Liquidation price estimate')}
        value={liquidationPriceEstimate}
        symbol={assetSymbol}
        labelDescription={LIQUIDATION_PRICE_ESTIMATE_TOOLTIP_TEXT}
      />
    </div>
  );
};
