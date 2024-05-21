import { getAsset, getQuoteName } from '@vegaprotocol/markets';
import type { Market } from '@vegaprotocol/markets';
import type { EstimatePositionQuery } from '@vegaprotocol/positions';
import * as Schema from '@vegaprotocol/types';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { formatNumber, formatRange, formatValue } from '@vegaprotocol/utils';
import { Trans } from 'react-i18next';
import {
  LIQUIDATION_PRICE_ESTIMATE_TOOLTIP_TEXT,
  MARGIN_ACCOUNT_TOOLTIP_TEXT,
} from '../../constants';
import type { Slippage } from '../../hooks/use-slippage';
import { ns, useT } from '../../use-t';
import { emptyValue } from './deal-ticket-fee-details';
import { KeyValue } from './key-value';

export interface DealTicketMarginDetailsProps {
  generalAccountBalance: string;
  marginAccountBalance: string;
  orderMarginAccountBalance: string;
  market: Market;
  assetSymbol: string;
  positionEstimate: EstimatePositionQuery['estimatePosition'];
  side: Schema.Side;
  slippage?: Slippage;
}

export const DealTicketMarginDetails = ({
  marginAccountBalance,
  generalAccountBalance,
  orderMarginAccountBalance,
  assetSymbol,
  market,
  positionEstimate,
  side,
  slippage,
}: DealTicketMarginDetailsProps) => {
  const t = useT();
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

  const quoteName = getQuoteName(market);

  return (
    <div className="flex flex-col w-full gap-2 mt-2">
      <SlippageAndTradeInfo slippage={slippage} market={market} />
      <KeyValue
        label={t('Current margin')}
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
    </div>
  );
};

const SlippageAndTradeInfo = ({
  slippage,
  market,
}: {
  slippage?: Slippage;
  market: Market;
}) => {
  const t = useT();

  if (!slippage) return null;

  const slippageVal = formatNumber(slippage.slippage, market.decimalPlaces);
  const slippagePct = formatNumber(slippage.slippagePct, 5);
  const weightedPrice =
    slippage.totalVolume === '0'
      ? 'N/A'
      : formatNumber(slippage.weightedAveragePrice, market.decimalPlaces);
  const totalVolume = formatNumber(
    slippage.totalVolume,
    market.positionDecimalPlaces
  );

  return (
    <>
      <KeyValue
        label={t('Projected trade')}
        formattedValue={`${totalVolume} @ ${weightedPrice}`}
        labelDescription={t(
          'Amount that will trade at the average weighted price'
        )}
      />

      <KeyValue
        label={t('Slippage')}
        formattedValue={`${slippagePct}% (${slippageVal})`}
      />
    </>
  );
};
