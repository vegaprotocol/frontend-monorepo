import { MarginMode } from '@vegaprotocol/types';
import { useTicketContext } from '../ticket-context';
import { useEstimatePosition } from '../use-estimate-position';
import { toBigNum } from '@vegaprotocol/utils';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import {
  isMarketClosed,
  isMarketInAuction,
  useMarketState,
  useMarketTradingMode,
} from '@vegaprotocol/markets';

import * as Msg from '../feedback';

export const Feedback = () => {
  const { pubKey } = useVegaWallet();
  const ticket = useTicketContext('default');

  const { data: positionEstimate } = useEstimatePosition();
  const { data: marketState } = useMarketState(ticket.market.id);
  const { data: marketTradingMode } = useMarketTradingMode(ticket.market.id);

  const requiredCollateral = toBigNum(
    positionEstimate?.estimatePosition?.collateralIncreaseEstimate.bestCase ||
      '0',
    ticket.settlementAsset.decimals
  );

  const generalAccount = toBigNum(
    ticket.accounts.general,
    ticket.settlementAsset.decimals
  );
  const marginAccount = toBigNum(
    ticket.accounts.margin,
    ticket.settlementAsset.decimals
  );
  const orderMarginAccount = toBigNum(
    ticket.accounts.orderMargin,
    ticket.settlementAsset.decimals
  );

  if (marketState && isMarketClosed(marketState)) {
    return <Msg.MarketClosed marketState={marketState} />;
  }

  // Dont show any collateral/margin related warnings unless the user is connected
  if (!pubKey) {
    return null;
  }

  if (ticket.marginMode.mode === MarginMode.MARGIN_MODE_CROSS_MARGIN) {
    if (
      generalAccount.isLessThanOrEqualTo(0) &&
      marginAccount.isLessThanOrEqualTo(0)
    ) {
      return <Msg.NoCollateral asset={ticket.settlementAsset} />;
    }
  } else if (
    ticket.marginMode.mode === MarginMode.MARGIN_MODE_ISOLATED_MARGIN
  ) {
    if (
      generalAccount.isLessThanOrEqualTo(0) &&
      orderMarginAccount.isLessThanOrEqualTo(0)
    ) {
      return <Msg.NoCollateral asset={ticket.settlementAsset} />;
    }
  }

  if (generalAccount.isLessThan(requiredCollateral)) {
    return (
      <Msg.NotEnoughCollateral
        requiredCollateral={requiredCollateral}
        availableCollateral={generalAccount}
        asset={ticket.settlementAsset}
      />
    );
  }

  if (marketTradingMode && isMarketInAuction(marketTradingMode)) {
    return <Msg.MarketAuction marketTradingMode={marketTradingMode} />;
  }

  return null;
};
