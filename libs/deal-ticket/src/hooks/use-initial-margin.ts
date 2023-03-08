import { useMemo } from 'react';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { marketDataProvider } from '@vegaprotocol/market-list';
import {
  calculateMargins,
  // getDerivedPrice,
  volumeAndMarginProvider,
} from '@vegaprotocol/positions';
import { Side } from '@vegaprotocol/types';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { marketInfoProvider } from '@vegaprotocol/market-info';

export const useInitialMargin = (
  marketId: OrderSubmissionBody['orderSubmission']['marketId'],
  size?: OrderSubmissionBody['orderSubmission']['size'],
  side?: OrderSubmissionBody['orderSubmission']['side']
) => {
  const { pubKey: partyId } = useVegaWallet();
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
    dataProvider: marketInfoProvider,
    variables: commonVariables,
  });
  let totalMargin = '0';
  let margin = '0';
  if (marketInfo?.riskFactors && marketData && size && side) {
    const {
      positionDecimalPlaces,
      decimalPlaces,
      tradableInstrument,
      riskFactors,
    } = marketInfo;
    const { marginCalculator, instrument } = tradableInstrument;
    const { decimals } = instrument.product.settlementAsset;
    margin = totalMargin = calculateMargins({
      side,
      size,
      price: marketData.markPrice, // getDerivedPrice(order, marketData), same in positions-data-providers
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
    if (side === Side.SIDE_SELL) {
      sellMargin += BigInt(totalMargin);
    } else {
      buyMargin += BigInt(totalMargin);
    }
    totalMargin =
      sellMargin > buyMargin ? sellMargin.toString() : buyMargin.toString();
  }

  return useMemo(() => ({ totalMargin, margin }), [totalMargin, margin]);
};
