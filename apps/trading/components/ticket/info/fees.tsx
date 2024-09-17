import BigNumber from 'bignumber.js';

import { formatNumberPercentage, formatValue } from '@vegaprotocol/utils';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { Intent, Pill, Tooltip } from '@vegaprotocol/ui-toolkit';

import { useT } from '../../../lib/use-t';
import { useTicketContext } from '../ticket-context';
import { DatagridRow } from '../elements/datagrid';

import { FeesBreakdown } from './fees-breakdown';
import { useEstimateFees } from './use-estimate-fees';
import { useForm } from '../use-form';
import { useMarketTradingMode, useMarkPrice } from '@vegaprotocol/markets';

export const Fees = ({ oco = false }: { oco?: boolean }) => {
  const t = useT();
  const ticket = useTicketContext();
  const asset =
    ticket.type === 'default' ? ticket.settlementAsset : ticket.quoteAsset;

  const form = useForm();

  const { pubKey } = useVegaWallet();
  const { data: markPrice } = useMarkPrice(ticket.market.id);
  const { data: marketTradingMode } = useMarketTradingMode(ticket.market.id);

  const estimate = useEstimateFees({
    partyId: pubKey,
    useOcoFields: oco,
    markPrice,
    marketTradingMode,
    values: form.watch(),
    market: ticket.market,
  });

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
            {!estimate.discount.isZero() && (
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
            description={`~${formatValue(
              estimate.fee.toString(),
              asset.decimals
            )}`}
          >
            <span>{`~${formatValue(
              estimate.fee.toString(),
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
