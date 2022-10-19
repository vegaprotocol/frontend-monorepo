import { FeesBreakdown } from '@vegaprotocol/market-info';
import {
  addDecimalsFormatNumber,
  formatNumber,
  t,
} from '@vegaprotocol/react-helpers';
import { Side } from '@vegaprotocol/types';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { useVegaWallet } from '@vegaprotocol/wallet';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';
import type { DealTicketMarketFragment } from '../components';
import {
  NOTIONAL_SIZE_TOOLTIP_TEXT,
  EST_MARGIN_TOOLTIP_TEXT,
  EST_CLOSEOUT_TOOLTIP_TEXT,
} from '../components/constants';
import useCalculateSlippage from './use-calculate-slippage';
import { useMaximumPositionSize } from './use-maximum-position-size';
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
    if (order.price) {
      if (slippage && parseFloat(slippage) !== 0) {
        const isLong = order.side === Side.SIDE_BUY;
        const multiplier = new BigNumber(1)[isLong ? 'plus' : 'minus'](
          parseFloat(slippage) / 100
        );
        return new BigNumber(order.price).multipliedBy(multiplier).toNumber();
      }
      return order.price;
    }
    return null;
  }, [order.price, order.side, slippage]);

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

  const fees = useMemo(() => {
    if (estMargin?.totalFees && notionalSize) {
      const percentage = new BigNumber(estMargin?.totalFees ?? 0)
        .dividedBy(notionalSize)
        .multipliedBy(100)
        .decimalPlaces(2)
        .toNumber();
      return `${addDecimalsFormatNumber(
        estMargin.totalFees,
        market.decimalPlaces
      )} (${percentage}%)`;
    }
    return null;
  }, [estMargin?.totalFees, market.decimalPlaces, notionalSize]);

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
    price: order.price,
    order,
  });

  const quoteName = market.tradableInstrument.instrument.product.quoteName;

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
    max,
  };
};

export interface FeeDetails {
  fees: string | null;
  market: DealTicketMarketFragment;
  quoteName: string;
  notionalSize: string | null;
  estMargin: OrderMargin | null;
  estCloseOut: string | null;
  slippageValue: number;
  slippage: string | null;
  price?: string | number | null;
}

export const getFeeDetailsValues = ({
  quoteName,
  notionalSize,
  estMargin,
  estCloseOut,
  price,
  market,
}: FeeDetails) => {
  const formatValue = (value: string | number | null | undefined): string => {
    return value && !isNaN(Number(value))
      ? formatNumber(value, market.decimalPlaces)
      : '-';
  };
  return [
    {
      label: t('Est. price'),
      value: formatValue(price),
      quoteName,
    },
    {
      label: t('Notional size'),
      value: formatValue(notionalSize),
      quoteName,
      labelDescription: NOTIONAL_SIZE_TOOLTIP_TEXT,
    },
    {
      label: t('Est. fees'),
      value: formatValue(estMargin?.totalFees),
      labelDescription: (
        <>
          <span>
            {t(
              'The most you’d be expected to pay in fees, the actual amount may vary.'
            )}
          </span>
          <FeesBreakdown
            fees={estMargin?.fees}
            feeFactors={market.fees.factors}
          />
        </>
      ),
      quoteName,
    },
    {
      label: t('Est. margin required'),
      value: formatValue(estMargin?.margin),
      quoteName,
      labelDescription: EST_MARGIN_TOOLTIP_TEXT,
    },
    {
      label: t('Est. close out'),
      value: formatValue(estCloseOut),
      quoteName,
      labelDescription: EST_CLOSEOUT_TOOLTIP_TEXT,
    },
  ];
};
