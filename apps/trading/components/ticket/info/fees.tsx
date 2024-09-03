import BigNumber from 'bignumber.js';

import { formatNumberPercentage, formatValue } from '@vegaprotocol/utils';
import { Intent, Pill, Tooltip } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../../lib/use-t';
import { useTicketContext } from '../ticket-context';
import { DatagridRow } from '../elements/datagrid';

import { FeesBreakdown } from './fees-breakdown';
import { useEstimateFees } from './use-estimate-fees';

export const Fees = ({ oco = false }: { oco?: boolean }) => {
  const t = useT();
  const estimate = useEstimateFees(oco);
  const ticket = useTicketContext();
  const asset = ticket.quoteAsset;

  return (
    <DatagridRow
      label={
        <Tooltip
          description={
            <div className="flex flex-col gap-2">
              <p>
                {t(
                  "An estimate of the most you would be expected to pay in fees, in the market's settlement asset {{assetSymbol}}.",
                  { assetSymbol: asset.symbol }
                )}
              </p>
              <FeesBreakdown estimate={estimate} decimals={asset.decimals} />
            </div>
          }
        >
          <span>
            <span data-testid="fees-text">
              {t('Fees ({{symbol}})', {
                symbol: asset.symbol,
              })}
            </span>
            {estimate.discount !== '0' && (
              <Pill
                size="xxs"
                intent={Intent.Info}
                className="ml-1"
                data-testid="discount-pill"
              >
                {formatNumberPercentage(BigNumber(estimate.discountPct))}
              </Pill>
            )}
          </span>
        </Tooltip>
      }
      value={
        estimate.fee ? (
          <Tooltip
            description={`~${formatValue(estimate.fee, asset.decimals)}`}
          >
            <span>{`~${formatValue(
              estimate.fee,
              asset.decimals,
              asset.quantum
            )}`}</span>
          </Tooltip>
        ) : (
          '-'
        )
      }
    />
  );
};
