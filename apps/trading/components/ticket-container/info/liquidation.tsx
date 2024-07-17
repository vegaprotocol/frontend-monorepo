import { DatagridRow } from '../elements/datagrid';
import { useTicketContext } from '../ticket-context';
import { Side } from '@vegaprotocol/types';
import { formatRange, formatValue } from '@vegaprotocol/utils';

import { useT } from '../../../lib/use-t';
import { ExternalLink, Tooltip } from '@vegaprotocol/ui-toolkit';
import { Trans } from 'react-i18next';

import { useEstimatePosition } from '../use-estimate-position';
import { useForm } from '../use-form';

export const emptyValue = '-';

export const Liquidation = () => {
  const t = useT();
  const ticket = useTicketContext();
  const form = useForm();

  const side = form.watch('side');
  const { data } = useEstimatePosition();

  const label = t('Liquidation estimate ({{symbol}})', {
    symbol: ticket.quoteAsset.symbol,
  });
  const labelWithTooltip = (
    <Tooltip
      description={
        <>
          <span>{t('ticketTooltipLiquidation')}</span>{' '}
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
      <span>{label}</span>
    </Tooltip>
  );
  const liquidationEstimate = data?.estimatePosition?.liquidation;

  if (!liquidationEstimate) {
    return <DatagridRow label={labelWithTooltip} value="-" />;
  }

  const bestCaseWithBuys = BigInt(
    liquidationEstimate.bestCase.including_buy_orders.replace(/\..*/, '')
  );
  const bestCaseWithSells = BigInt(
    liquidationEstimate.bestCase.including_sell_orders.replace(/\..*/, '')
  );
  const bestCase =
    side === Side.SIDE_BUY ? bestCaseWithBuys : bestCaseWithSells;

  const worstCaseWithBUys = BigInt(
    liquidationEstimate.worstCase.including_buy_orders.replace(/\..*/, '')
  );
  const worstCaseWithSells = BigInt(
    liquidationEstimate.worstCase.including_sell_orders.replace(/\..*/, '')
  );
  const worstCase =
    side === Side.SIDE_BUY ? worstCaseWithBUys : worstCaseWithSells;

  const priceEstimate = formatValue(
    worstCase.toString(),
    ticket.market.decimalPlaces,
    undefined,
    ticket.market.decimalPlaces
  );
  const priceEstimateRange = formatRange(
    (bestCase < worstCase ? bestCase : worstCase).toString(),
    (bestCase > worstCase ? bestCase : worstCase).toString(),
    ticket.market.decimalPlaces,
    undefined,
    ticket.market.decimalPlaces
  );

  if (bestCase === BigInt(0) && worstCase === BigInt(0)) {
    return <DatagridRow label={labelWithTooltip} value="-" />;
  }

  return (
    <DatagridRow
      label={labelWithTooltip}
      value={
        <Tooltip description={priceEstimateRange}>
          <span>{priceEstimate}</span>
        </Tooltip>
      }
    />
  );
};
