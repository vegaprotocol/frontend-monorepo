import { useFormContext } from 'react-hook-form';
import { DatagridRow } from '../elements/datagrid';
import { useTicketContext } from '../ticket-context';
import { Side } from '@vegaprotocol/types';
import { formatRange, formatValue } from '@vegaprotocol/utils';

import { useT } from '../../../lib/use-t';
import { ExternalLink, Tooltip } from '@vegaprotocol/ui-toolkit';
import { LIQUIDATION_PRICE_ESTIMATE_TOOLTIP_TEXT } from '@vegaprotocol/deal-ticket';
import { Trans } from 'react-i18next';

import { useEstimatePosition } from '../use-estimate-position';

export const emptyValue = '-';

export const Liquidation = () => {
  const t = useT();
  const ticket = useTicketContext();
  const form = useFormContext();

  const side = form.watch('side');
  const { data } = useEstimatePosition();

  const liquidationEstimate = data?.estimatePosition?.liquidation;

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
      side === Side.SIDE_BUY
        ? liquidationEstimateBestCaseIncludingBuyOrders
        : liquidationEstimateBestCaseIncludingSellOrders;

    const liquidationEstimateWorstCaseIncludingBuyOrders = BigInt(
      liquidationEstimate.worstCase.including_buy_orders.replace(/\..*/, '')
    );
    const liquidationEstimateWorstCaseIncludingSellOrders = BigInt(
      liquidationEstimate.worstCase.including_sell_orders.replace(/\..*/, '')
    );
    const liquidationEstimateWorstCase =
      side === Side.SIDE_BUY
        ? liquidationEstimateWorstCaseIncludingBuyOrders
        : liquidationEstimateWorstCaseIncludingSellOrders;

    liquidationPriceEstimate = formatValue(
      liquidationEstimateWorstCase.toString(),
      ticket.market.decimalPlaces,
      undefined,
      ticket.market.decimalPlaces
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
      ticket.market.decimalPlaces,
      undefined,
      ticket.market.decimalPlaces
    );
  }

  return (
    <DatagridRow
      label={
        <Tooltip
          description={
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
                      key="link"
                      href={
                        'https://github.com/vegaprotocol/specs/blob/master/non-protocol-specs/0012-NP-LIPE-liquidation-price-estimate.md'
                      }
                    >
                      liquidation price estimate documentation
                    </ExternalLink>,
                  ]}
                />
              </span>
            </>
          }
        >
          <span>{t('Liquidation estimate')}</span>
        </Tooltip>
      }
      value={
        <Tooltip description={liquidationPriceEstimateRange}>
          <span>{liquidationPriceEstimate}</span>
        </Tooltip>
      }
    />
  );
};
