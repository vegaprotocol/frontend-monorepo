import { FeesBreakdown } from '@vegaprotocol/market-info';
import { addDecimalsFormatNumber, t } from '@vegaprotocol/react-helpers';
import { Side } from '@vegaprotocol/types';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { useVegaWallet } from '@vegaprotocol/wallet';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';
import type { DealTicketMarketFragment } from '../components';
import { EST_SLIPPAGE } from '../components';
import { EST_CLOSEOUT_TOOLTIP_TEXT } from '../components';
import { EST_MARGIN_TOOLTIP_TEXT } from '../components';
import { NOTIONAL_SIZE_TOOLTIP_TEXT } from '../components';
import useCalculateSlippage from './use-calculate-slippage';
import { useMaximumPositionSize } from './use-maximum-position-size';
import { useOrderCloseOut } from './use-order-closeout';
import type { OrderMargin } from './use-order-margin';
import useOrderMargin from './use-order-margin';
import { usePartyBalanceQuery } from './__generated__/PartyBalance';

export const useFeeDealTicketDetails = (
  order: OrderSubmissionBody['orderSubmission'],
  market: DealTicketMarketFragment,
  orderPrice = market.depth.lastTrade?.price
) => {
  const { pubKey } = useVegaWallet();

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

  const slippage = useCalculateSlippage({ marketId: market.id, order });

  const notionalSize = useMemo(() => {
    if (order.price) {
      const size = new BigNumber(order.price ?? 0)
        .multipliedBy(order.size)
        .toNumber();
      return addDecimalsFormatNumber(size, market.decimalPlaces);
    }
    return null;
  }, [market.decimalPlaces, order.price, order.size]);

  const fees = useMemo(() => {
    if (estMargin?.fees && notionalSize) {
      const percentage = new BigNumber(estMargin?.fees)
        .dividedBy(notionalSize)
        .multipliedBy(100)
        .decimalPlaces(2)
        .toString();
      return `${estMargin.fees} (${percentage}%)`;
    }
    return null;
  }, [estMargin?.fees, notionalSize]);
  const [slippageValue, setSlippageValue] = useState(
    slippage ? parseFloat(slippage) : 0
  );

  useEffect(() => {
    setSlippageValue(slippage ? parseFloat(slippage) : 0);
  }, [slippage]);

  const maxTrade = useMaximumPositionSize({
    partyId: pubKey || '',
    accounts: partyBalance?.party?.accounts || [],
    marketId: market.id,
    settlementAssetId:
      market.tradableInstrument.instrument.product.settlementAsset.id,
    price: orderPrice,
    order,
  });

  const quoteName = market.tradableInstrument.instrument.product.quoteName;

  const price = useMemo(() => {
    if (slippage && orderPrice) {
      const isLong = order.side === Side.SIDE_BUY;
      const multiplier = new BigNumber(1)[isLong ? 'plus' : 'minus'](
        parseFloat(slippage) / 100
      );
      return new BigNumber(orderPrice).multipliedBy(multiplier).toNumber();
    }
    return null;
  }, [orderPrice, order.side, slippage]);

  const formattedPrice =
    price && addDecimalsFormatNumber(price, market.decimalPlaces);

  const max = useMemo(() => {
    return new BigNumber(maxTrade)
      .decimalPlaces(market.positionDecimalPlaces)
      .toNumber();
  }, [market.positionDecimalPlaces, maxTrade]);

  return {
    fees,
    market,
    quoteName,
    notionalSize,
    estMargin,
    estCloseOut,
    maxTrade,
    slippage,
    slippageValue,
    setSlippageValue,
    price,
    formattedPrice,
    max,
  };
};

export interface FeeDetails {
  fees: string | null;
  market: DealTicketMarketFragment;
  quoteName: string;
  notionalSize: string | null;
  estMargin: OrderMargin | null;
  estCloseOut: string;
  slippageValue: number;
}

export const getFeeDetailLabelValues = ({
  fees,
  market,
  quoteName,
  notionalSize,
  estMargin,
  estCloseOut,
  slippageValue,
}: FeeDetails) => {
  const details = [
    {
      label: t('Fees'),
      value: fees,
      labelDescription: <FeesBreakdown feeFactors={market.fees.factors} />,
      quoteName,
    },
    {
      label: t('Notional size'),
      value: notionalSize,
      quoteName,
      labelDescription: NOTIONAL_SIZE_TOOLTIP_TEXT,
    },
    {
      label: t('Margin required'),
      value: estMargin?.margin,
      quoteName,
      labelDescription: EST_MARGIN_TOOLTIP_TEXT,
    },
    {
      label: t('Est. close out'),
      value: estCloseOut,
      quoteName,
      labelDescription: EST_CLOSEOUT_TOOLTIP_TEXT,
    },
    {
      label: t('Slippage (estimated)'),
      value: slippageValue,
      quoteName,
      labelDescription: EST_SLIPPAGE,
    },
  ];
  return details;
};
