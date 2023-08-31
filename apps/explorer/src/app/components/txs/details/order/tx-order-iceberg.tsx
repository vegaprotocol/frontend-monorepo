import { t } from '@vegaprotocol/i18n';
import type { components } from '../../../../../types/explorer';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import SizeInMarket from '../../../size-in-market/size-in-market';

export interface TxDetailsOrderIcebergDetailsProps {
  iceberg: components['schemas']['v1IcebergOpts'];
  size: components['schemas']['v1OrderSubmission']['size'];
  marketId?: string;
}

/**

.iceberg .sub {
  vertical-align: bottom;
  color: #954F01;
}

.iceberg .sup {
  vertical-align: top;
  color: #515E1E;
}

 */

/**
 * Visualises the iceberg details of an order, showing the minimum visible size,
 * the full size and the peak size.
 */
export const TxOrderIcebergDetails = ({
  iceberg,
  size,
  marketId,
}: TxDetailsOrderIcebergDetailsProps) => {
  return (
    <div
      className="inline-block iceberg bg-vega-blue-300 border-vega-blue-350 border-[1px] text-[70%] font-mono py-[2px] pl-2 pr-3 height-[1em] leading-[1em] cursor-pointer"
      style={{ clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)' }}
    >
      <Tooltip description={t('Iceberg: Minimum visible size')}>
        <span className="align-bottom text-vega-orange-650">
          {marketId ? (
            <SizeInMarket
              size={iceberg.minimumVisibleSize}
              marketId={marketId}
            />
          ) : (
            iceberg.minimumVisibleSize
          )}
        </span>
      </Tooltip>
      <Tooltip description={t('Iceberg: Total size')}>
        <span className="text-sm text-vega-blue-600 mx-3">
          {marketId ? <SizeInMarket size={size} marketId={marketId} /> : size}
        </span>
      </Tooltip>
      <Tooltip description={t('Iceberg: Visible peak')}>
        <span className="align-top text-vega-yellow-600">
          {marketId ? (
            <SizeInMarket size={iceberg.peakSize} marketId={marketId} />
          ) : (
            iceberg.peakSize
          )}
        </span>
      </Tooltip>
    </div>
  );
};
