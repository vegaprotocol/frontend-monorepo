import { useCallback, useState } from 'react';
import { getAsset, getQuoteName } from '@vegaprotocol/markets';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { AccountBreakdownDialog } from '@vegaprotocol/accounts';
import { formatRange, formatValue } from '@vegaprotocol/utils';
import * as Schema from '@vegaprotocol/types';
import {
  LIQUIDATION_PRICE_ESTIMATE_TOOLTIP_TEXT,
  MARGIN_ACCOUNT_TOOLTIP_TEXT,
} from '../../constants';
import { KeyValue } from './key-value';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { useT, ns } from '../../use-t';
import { Trans } from 'react-i18next';
import type { Market } from '@vegaprotocol/markets';
import { emptyValue } from './deal-ticket-fee-details';
import type { EstimatePositionQuery } from '@vegaprotocol/positions';

export interface DealTicketMarginDetailsProps {
  generalAccountBalance: string;
  marginAccountBalance: string;
  orderMarginAccountBalance: string;
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
  const liquidationEstimate = positionEstimate?.liquidation;
  const totalMarginAccountBalance =
    BigInt(marginAccountBalance || '0') +
    BigInt(orderMarginAccountBalance || '0');

  const asset = getAsset(market);
  const { decimals: assetDecimals, quantum } = asset;

  const collateralIncreaseEstimateBestCase = BigInt(
    positionEstimate?.collateralIncreaseEstimate.bestCase ?? '0'
  );
  const collateralIncreaseEstimateWorstCase = BigInt(
    positionEstimate?.collateralIncreaseEstimate.worstCase ?? '0'
  );

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
    <div className="flex flex-col w-full gap-2 mt-2">
      <KeyValue
        label={t('Current margin')}
        onClick={
          generalAccountBalance ? () => setBreakdownDialog(true) : undefined
        }
        value={formatValue(totalMarginAccountBalance.toString(), assetDecimals)}
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
      <KeyValue
        label={t('Available collateral')}
        value={formatValue(generalAccountBalance, assetDecimals)}
        formattedValue={formatValue(
          generalAccountBalance.toString(),
          assetDecimals,
          quantum
        )}
        symbol={assetSymbol}
      />
      <KeyValue
        label={t('Additional margin required')}
        value={formatRange(
          collateralIncreaseEstimateBestCase.toString(),
          collateralIncreaseEstimateWorstCase.toString(),
          assetDecimals
        )}
        formattedValue={formatValue(
          collateralIncreaseEstimateBestCase.toString(),
          assetDecimals,
          quantum
        )}
        symbol={assetSymbol}
      />
      <KeyValue
        label={t('Liquidation estimate')}
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
