import {
  getProductType,
  getQuoteName,
  type Market,
} from '@vegaprotocol/markets';
import type { EstimatePositionQuery } from '@vegaprotocol/positions';
import * as Schema from '@vegaprotocol/types';
import { ExternalLink, Tooltip } from '@vegaprotocol/ui-toolkit';
import { formatRange, formatValue } from '@vegaprotocol/utils';
import { Trans } from 'react-i18next';
import { ns, useT } from '../../lib/use-t';
import { getAssetSymbol, type AssetFieldsFragment } from '@vegaprotocol/assets';
import { type ReactNode } from 'react';

export interface MarginDetailsProps {
  generalAccountBalance: string;
  marginAccountBalance: string;
  orderMarginAccountBalance: string;
  market: Market;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  asset: AssetFieldsFragment;
  positionEstimate: EstimatePositionQuery['estimatePosition'];
  side: Schema.Side;
}

export const MarginDetails = ({
  marginAccountBalance,
  generalAccountBalance,
  orderMarginAccountBalance,
  asset,
  market,
  positionEstimate,
  side,
}: MarginDetailsProps) => {
  const t = useT();
  const liquidationEstimate = positionEstimate?.liquidation;
  const totalMarginAccountBalance =
    BigInt(marginAccountBalance || '0') +
    BigInt(orderMarginAccountBalance || '0');

  const productType = getProductType(market);

  const { decimals: assetDecimals, quantum } = asset;

  const collateralIncreaseEstimateBestCase = BigInt(
    positionEstimate?.collateralIncreaseEstimate.bestCase ?? '0'
  );
  const collateralIncreaseEstimateWorstCase = BigInt(
    positionEstimate?.collateralIncreaseEstimate.worstCase ?? '0'
  );

  let liquidationPriceEstimate = '-';
  let liquidationPriceEstimateRange = '-';

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
    <div className="flex flex-col w-full gap-1 mt-1">
      {productType !== 'Spot' && (
        <KeyValue
          label={t('Current margin')}
          value={formatValue(
            totalMarginAccountBalance.toString(),
            assetDecimals
          )}
          symbol={asset.symbol}
          labelDescription={t('Margin account balance.')}
          formattedValue={formatValue(
            totalMarginAccountBalance.toString(),
            assetDecimals,
            quantum
          )}
        />
      )}
      <KeyValue
        label={t('Available collateral')}
        value={formatValue(generalAccountBalance, assetDecimals)}
        formattedValue={formatValue(
          generalAccountBalance.toString(),
          assetDecimals,
          quantum
        )}
        symbol={getAssetSymbol(asset)}
      />
      {productType !== 'Spot' && (
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
          symbol={asset.symbol}
        />
      )}
      {productType !== 'Spot' && (
        <KeyValue
          label={t('Liquidation estimate')}
          value={liquidationPriceEstimateRange}
          formattedValue={liquidationPriceEstimate}
          symbol={quoteName}
          labelDescription={
            <>
              <span>
                {t(
                  'This is an approximation for the liquidation price for that particular contract position, assuming nothing else changes, which may affect your margin and collateral balances.'
                )}
              </span>{' '}
              <span>
                <Trans
                  defaults="For full details please see <0>liquidation price estimate documentation</0>."
                  components={[
                    <ExternalLink
                      key="link"
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
      )}
    </div>
  );
};

interface KeyValuePros {
  id?: string;
  label: ReactNode;
  value?: ReactNode;
  symbol?: string;
  indent?: boolean | undefined;
  labelDescription?: ReactNode;
  formattedValue?: ReactNode;
  onClick?: () => void;
}

const KeyValue = ({
  id,
  label,
  value,
  labelDescription,
  symbol,
  onClick,
  formattedValue,
}: KeyValuePros) => {
  const displayValue = (
    <>
      {formattedValue || '-'} {symbol || ''}
    </>
  );

  const valueElement = onClick ? (
    <button
      type="button"
      onClick={onClick}
      className="font-mono ml-auto [word-break:break-word]"
    >
      {displayValue}
    </button>
  ) : (
    <div className="font-mono ml-auto [word-break:break-word]">
      {displayValue}
    </div>
  );

  return (
    <div
      data-testid={`deal-ticket-fee-${
        !id && typeof label === 'string'
          ? label.toLocaleLowerCase().replace(/\s/g, '-')
          : id
      }`}
      key={typeof label === 'string' ? label : 'value-dropdown'}
      className="text-xs flex justify-between items-center gap-4 flex-wrap text-right"
    >
      <Tooltip description={labelDescription}>
        <div className="text-surface-1-fg-muted text-left">{label}</div>
      </Tooltip>
      <Tooltip description={value && `${value} ${symbol || ''}`}>
        {valueElement}
      </Tooltip>
    </div>
  );
};
