import {
  useAccountBalance,
  useMarginAccountBalance,
} from '@vegaprotocol/accounts';
import { usePositionEstimate } from '@vegaprotocol/deal-ticket';
import { getAsset, useMarket } from '@vegaprotocol/markets';
import { useActiveOrders } from '@vegaprotocol/orders';
import { useOpenVolume } from '@vegaprotocol/positions';
import { type OrderInfo, MarginMode, OrderType } from '@vegaprotocol/types';
import { Intent, Notification } from '@vegaprotocol/ui-toolkit';
import { addDecimalsFormatNumberQuantum } from '@vegaprotocol/utils';
import { useT } from '../../lib/use-t';

export const MarginChange = ({
  partyId,
  marketId,
  marginMode,
  marginFactor,
}: {
  partyId: string | undefined;
  marketId: string;
  marginMode: MarginMode;
  marginFactor: string;
}) => {
  const t = useT();
  const { data: market } = useMarket(marketId);
  const asset = market && getAsset(market);
  const {
    marginAccountBalance,
    orderMarginAccountBalance,
    loading: marginAccountBalanceLoading,
  } = useMarginAccountBalance(marketId);
  const {
    accountBalance: generalAccountBalance,
    loading: generalAccountBalanceLoading,
  } = useAccountBalance(asset?.id);
  const { openVolume, averageEntryPrice } = useOpenVolume(
    partyId,
    marketId
  ) || {
    openVolume: '0',
    averageEntryPrice: '0',
  };
  const { data: activeOrders } = useActiveOrders(partyId, marketId);
  const orders = activeOrders
    ? activeOrders.map<OrderInfo>((order) => ({
        isMarketOrder: order.type === OrderType.TYPE_MARKET,
        price: order.price,
        remaining: order.remaining,
        side: order.side,
      }))
    : [];
  const skip =
    (!orders?.length && openVolume === '0') ||
    marginAccountBalanceLoading ||
    generalAccountBalanceLoading;
  const estimateMargin = usePositionEstimate(
    {
      generalAccountBalance: generalAccountBalance || '0',
      marginAccountBalance: marginAccountBalance || '0',
      marginFactor,
      marginMode,
      averageEntryPrice,
      openVolume,
      marketId,
      orderMarginAccountBalance: orderMarginAccountBalance || '0',
      includeRequiredPositionMarginInAvailableCollateral: true,
      orders,
    },
    skip
  );
  if (!asset || !estimateMargin?.estimatePosition) {
    return null;
  }
  const collateralIncreaseEstimate = BigInt(
    estimateMargin.estimatePosition.collateralIncreaseEstimate.bestCase
  );

  let positionWarning = '';
  let marginChangeWarning = '';
  if (collateralIncreaseEstimate) {
    if (orders?.length && openVolume !== '0') {
      positionWarning = t(
        'youHaveOpenPositionAndOrders',
        'You have an existing position and open orders on this market.',
        {
          count: orders.length,
        }
      );
    } else if (!orders?.length) {
      positionWarning = t('You have an existing position on this market.');
    } else {
      positionWarning = t(
        'youHaveOpenOrders',
        'You have open orders on this market.',
        {
          count: orders.length,
        }
      );
    }

    const isCollateralIncreased = collateralIncreaseEstimate > BigInt(0);
    const amount = addDecimalsFormatNumberQuantum(
      collateralIncreaseEstimate.toString().replace('-', ''),
      asset?.decimals,
      asset?.quantum
    );
    const { symbol } = asset;
    const interpolation = { amount, symbol };
    if (marginMode === MarginMode.MARGIN_MODE_CROSS_MARGIN) {
      marginChangeWarning = isCollateralIncreased
        ? t(
            'Changing the margin mode will move {{amount}} {{symbol}} from your general account to fund the position.',
            interpolation
          )
        : t(
            'Changing the margin mode will release {{amount}} {{symbol}} to your general account.',
            interpolation
          );
    } else {
      marginChangeWarning = isCollateralIncreased
        ? t(
            'Changing the margin mode and leverage will move {{amount}} {{symbol}} from your general account to fund the position.',
            interpolation
          )
        : t(
            'Changing the margin mode and leverage will release {{amount}} {{symbol}} to your general account.',
            interpolation
          );
    }
  }
  return (
    <div className="mb-2">
      {positionWarning && marginChangeWarning && (
        <Notification
          intent={Intent.Warning}
          message={
            <>
              <p>{positionWarning}</p>
              <p>{marginChangeWarning}</p>
            </>
          }
        />
      )}
      {/*
      // TODO: Fix this
      <DealTicketMarginDetails
        marginAccountBalance={marginAccountBalance}
        generalAccountBalance={generalAccountBalance}
        orderMarginAccountBalance={orderMarginAccountBalance}
        asset={asset}
        market={market}
        positionEstimate={estimateMargin.estimatePosition}
        side={
          openVolume.startsWith('-')
            ? Schema.Side.SIDE_SELL
            : Schema.Side.SIDE_BUY
        }
      /> */}
    </div>
  );
};
