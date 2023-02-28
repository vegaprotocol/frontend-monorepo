import { useMemo } from 'react';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { marketDataProvider } from '@vegaprotocol/market-list';
import {
  calculateMargins,
  getDerivedPrice,
  volumeAndMarginProvider,
} from '@vegaprotocol/positions';
import { Side } from '@vegaprotocol/types';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { marketInfoDataProvider } from '@vegaprotocol/market-info';

export const useInitialMargin = (
  order: OrderSubmissionBody['orderSubmission']
) => {
  const { pubKey: partyId } = useVegaWallet();
  const { size, side, marketId } = order;
  const commonVariables = { marketId, partyId: partyId || '' };
  const { data: marketData } = useDataProvider({
    dataProvider: marketDataProvider,
    variables: { marketId },
  });
  const { data: activeVolumeAndMargin } = useDataProvider({
    dataProvider: volumeAndMarginProvider,
    variables: commonVariables,
    skip: !partyId,
  });
  const { data: marketInfo } = useDataProvider({
    dataProvider: marketInfoDataProvider,
    variables: commonVariables,
  });
  let totalMargin = '0';
  let margin = '0';

  if (marketInfo?.market && marketInfo?.market.riskFactors && marketData) {
    const {
      positionDecimalPlaces,
      decimalPlaces,
      tradableInstrument,
      riskFactors,
    } = marketInfo.market;
    const { marginCalculator, instrument } = tradableInstrument;
    const { decimals } = instrument.product.settlementAsset;
    margin = totalMargin = calculateMargins({
      side,
      size,
      price: getDerivedPrice(order, marketData),
      positionDecimalPlaces,
      decimalPlaces,
      decimals,
      scalingFactors: marginCalculator?.scalingFactors,
      riskFactors,
    }).initialMargin;
  }

  if (activeVolumeAndMargin) {
    let sellMargin = BigInt(activeVolumeAndMargin.sellInitialMargin);
    let buyMargin = BigInt(activeVolumeAndMargin.buyInitialMargin);
    if (order.side === Side.SIDE_SELL) {
      activeVolumeAndMargin.sellVolume = (
        BigInt(activeVolumeAndMargin.sellVolume) + BigInt(order.size)
      ).toString();
      sellMargin += BigInt(totalMargin);
    } else {
      buyMargin += BigInt(totalMargin);
    }
    totalMargin =
      sellMargin > buyMargin ? sellMargin.toString() : buyMargin.toString();
  }

  return useMemo(() => ({ totalMargin, margin }), [totalMargin, margin]);
};
