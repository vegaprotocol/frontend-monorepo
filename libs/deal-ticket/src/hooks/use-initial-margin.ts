import { useDataProvider } from '@vegaprotocol/react-helpers';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useMemo } from 'react';
import { marketDataProvider } from '@vegaprotocol/market-list';
import {
  calculateMargins,
  getDerivedPrice,
  volumeAndMarginProvider,
} from '@vegaprotocol/positions';
import { Side } from '@vegaprotocol/types';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { useEstimateOrderQuery } from './__generated__/EstimateOrder';
import { marketInfoDataProvider } from '@vegaprotocol/market-info';
import { marketMarginDataProvider } from '@vegaprotocol/positions';
import { useMarketAccountBalance } from '@vegaprotocol/accounts';

export const useInitialMargin = (
  order: OrderSubmissionBody['orderSubmission']
) => {
  const { pubKey: partyId } = useVegaWallet();
  const { size, side, timeInForce, type, marketId } = order;
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
  const { data: currentMargin } = useDataProvider({
    dataProvider: marketMarginDataProvider,
    variables: commonVariables,
    skip: !partyId,
  });
  const { accountBalance } = useMarketAccountBalance(marketId);

  const price = marketData && getDerivedPrice(order, marketData);
  const { data: estimatedOrder } = useEstimateOrderQuery({
    variables: {
      ...commonVariables,
      price,
      size,
      side,
      timeInForce,
      type,
    },
    skip: !partyId || !size || !price,
  });
  let estimatedMargin: string | undefined = undefined;
  let totalEstimatedMargin: string | undefined = undefined;
  // let totalApiEstimatedMargin: string | undefined = undefined;
  let estimatedInitialMargin: string | undefined = undefined;
  const apiEstimatedMargin =
    estimatedOrder && estimatedOrder.estimateOrder.marginLevels.initialLevel;
  if (marketInfo?.market && marketInfo?.market.riskFactors && marketData) {
    const {
      positionDecimalPlaces,
      decimalPlaces,
      tradableInstrument,
      riskFactors,
    } = marketInfo.market;
    const { marginCalculator, instrument } = tradableInstrument;
    const { decimals } = instrument.product.settlementAsset;
    const { initialMargin } = calculateMargins({
      side,
      size,
      price: getDerivedPrice(order, marketData),
      positionDecimalPlaces,
      decimalPlaces,
      decimals,
      scalingFactors: marginCalculator?.scalingFactors,
      riskFactors,
    });
    estimatedMargin = initialMargin;
  }

  if (activeVolumeAndMargin && apiEstimatedMargin) {
    let sellMargin = BigInt(activeVolumeAndMargin.sellInitialMargin);
    let buyMargin = BigInt(activeVolumeAndMargin.buyInitialMargin);
    const margin = BigInt(
      estimatedOrder.estimateOrder.marginLevels.initialLevel
    );
    estimatedInitialMargin =
      sellMargin > buyMargin ? sellMargin.toString() : buyMargin.toString();
    if (order.side === Side.SIDE_SELL) {
      activeVolumeAndMargin.sellVolume = (
        BigInt(activeVolumeAndMargin.sellVolume) + BigInt(order.size)
      ).toString();
      sellMargin += margin;
    } else {
      buyMargin += margin;
    }
    totalEstimatedMargin =
      sellMargin > buyMargin ? sellMargin.toString() : buyMargin.toString();
  }

  return useMemo(() => {
    return {
      estimatedMargin,
      apiEstimatedMargin,
      estimatedInitialMargin,
      apiInitialMargin: currentMargin?.initialLevel,
      totalEstimatedMargin,
      accountBalance,
    };
  }, [
    estimatedMargin,
    apiEstimatedMargin,
    currentMargin?.initialLevel,
    estimatedInitialMargin,
    totalEstimatedMargin,
    accountBalance,
  ]);
};
