import { FeesBreakdown } from '@vegaprotocol/market-info';
import { formatNumber, t } from '@vegaprotocol/react-helpers';
import { Side } from '@vegaprotocol/types';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { useVegaWallet } from '@vegaprotocol/wallet';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import type { DealTicketMarketFragment } from '../components';
import {
  NOTIONAL_SIZE_TOOLTIP_TEXT,
  EST_MARGIN_TOOLTIP_TEXT,
  EST_CLOSEOUT_TOOLTIP_TEXT,
} from '../components/constants';
import { useCalculateSlippage } from './use-calculate-slippage';
import { useOrderCloseOut } from './use-order-closeout';
import type { OrderMargin } from './use-order-margin';
import { useOrderMargin } from './use-order-margin';
import { usePartyBalanceQuery } from './__generated__/PartyBalance';

export const useFeeDealTicketDetails = (
  order: OrderSubmissionBody['orderSubmission'],
  market: DealTicketMarketFragment
) => {
  const { pubKey } = useVegaWallet();

  const slippage = useCalculateSlippage({ marketId: market.id, order });

  const price = useMemo(() => {
    const estPrice = order.price || market.depth.lastTrade?.price;
    if (estPrice) {
      if (slippage && parseFloat(slippage) !== 0) {
        const isLong = order.side === Side.SIDE_BUY;
        const multiplier = new BigNumber(1)[isLong ? 'plus' : 'minus'](
          parseFloat(slippage) / 100
        );
        return new BigNumber(estPrice).multipliedBy(multiplier).toNumber();
      }
      return order.price;
    }
    return null;
  }, [market.depth.lastTrade?.price, order.price, order.side, slippage]);

  const estMargin: OrderMargin | null = useOrderMargin({
    order,
    market,
    partyId: pubKey || '',
  });

  const { data: partyBalance } = usePartyBalanceQuery({
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
  });

  const estCloseOut = useOrderCloseOut({
    order,
    market,
    partyData: partyBalance,
  });

  const notionalSize = useMemo(() => {
    if (order.price && order.size) {
      return new BigNumber(order.size).multipliedBy(order.price).toString();
    }
    return null;
  }, [order.price, order.size]);

  const quoteName = market.tradableInstrument.instrument.product.quoteName;

  return {
    market,
    quoteName,
    notionalSize,
    estMargin,
    estCloseOut,
    slippage,
    price,
    partyData: partyBalance,
  };
};

export interface FeeDetails {
  market: DealTicketMarketFragment;
  quoteName: string;
  notionalSize: string | null;
  estMargin: OrderMargin | null;
  estCloseOut: string | null;
  slippage: string | null;
  price?: string | number | null;
}

export const getFeeDetailsValues = ({
  quoteName,
  notionalSize,
  estMargin,
  estCloseOut,
  market,
}: FeeDetails) => {
  const formatValue = (value: string | number | null | undefined): string => {
    return value && !isNaN(Number(value))
      ? formatNumber(value, market.decimalPlaces)
      : '-';
  };
  return [
    {
      label: t('Notional value'),
      value: formatValue(notionalSize),
      quoteName,
      labelDescription: NOTIONAL_SIZE_TOOLTIP_TEXT,
    },
    {
      label: t('Fees'),
      value: estMargin?.totalFees && `~${formatValue(estMargin?.totalFees)}`,
      labelDescription: (
        <>
          <span>
            {t(
              'The most you would be expected to pay in fees, the actual amount may vary.'
            )}
          </span>
          <FeesBreakdown
            fees={estMargin?.fees}
            feeFactors={market.fees.factors}
            quoteName={quoteName}
          />
        </>
      ),
      quoteName,
    },
    {
      label: t('Margin required'),
      value: estMargin?.margin && `~${formatValue(estMargin?.margin)}`,
      quoteName,
      labelDescription: EST_MARGIN_TOOLTIP_TEXT,
    },
    {
      label: t('Liquidation price (variable)'),
      value: formatValue(estCloseOut),
      quoteName,
      labelDescription: EST_CLOSEOUT_TOOLTIP_TEXT,
    },
  ];
};
