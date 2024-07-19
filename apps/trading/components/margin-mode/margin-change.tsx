import {
  useAccountBalance,
  useMarginAccountBalance,
} from '@vegaprotocol/accounts';
import { getAsset, useMarket } from '@vegaprotocol/markets';
import { useActiveOrders } from '@vegaprotocol/orders';
import {
  useEstimatePositionQuery,
  useOpenVolume,
} from '@vegaprotocol/positions';
import {
  type OrderInfo,
  MarginMode,
  OrderType,
  Side,
} from '@vegaprotocol/types';
import { Intent, Notification } from '@vegaprotocol/ui-toolkit';
import { addDecimalsFormatNumberQuantum } from '@vegaprotocol/utils';
import { useT } from '../../lib/use-t';
import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import { MarginDetails } from './margin-details';

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

  const { data } = useEstimatePositionQuery({
    variables: {
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
    skip,
    fetchPolicy: 'cache-and-network',
  });

  if (!asset || !data?.estimatePosition) {
    return null;
  }
  const collateralIncreaseEstimate = BigInt(
    data.estimatePosition.collateralIncreaseEstimate.bestCase
  );

  return (
    <div className="mb-2">
      <Warning
        mode={marginMode}
        collateralIncreaseEstimate={collateralIncreaseEstimate}
        ordersCount={orders?.length ?? 0}
        openVolume={openVolume}
        asset={asset}
      />
      <MarginDetails
        marginAccountBalance={marginAccountBalance}
        generalAccountBalance={generalAccountBalance}
        orderMarginAccountBalance={orderMarginAccountBalance}
        asset={asset}
        market={market}
        positionEstimate={data.estimatePosition}
        side={openVolume.startsWith('-') ? Side.SIDE_SELL : Side.SIDE_BUY}
      />
    </div>
  );
};

const Warning = ({
  mode,
  collateralIncreaseEstimate,
  ordersCount,
  openVolume,
  asset,
}: {
  mode: MarginMode;
  collateralIncreaseEstimate: bigint;
  ordersCount: number;
  openVolume: string;
  asset: AssetFieldsFragment;
}) => {
  const positionWarning = usePositionWarning({ ordersCount, openVolume });
  const marginChangeWarning = useMarginChangeWarning({
    mode,
    asset,
    collateralIncreaseEstimate,
  });

  if (!collateralIncreaseEstimate) return null;
  if (!positionWarning && !marginChangeWarning) return null;

  return (
    <Notification
      intent={Intent.Warning}
      message={
        <>
          <p>{positionWarning}</p>
          <p>{marginChangeWarning}</p>
        </>
      }
    />
  );
};

const usePositionWarning = ({
  ordersCount,
  openVolume,
}: {
  ordersCount: number;
  openVolume: string;
}) => {
  const t = useT();

  let positionWarning = '';

  if (ordersCount && openVolume !== '0') {
    positionWarning = t(
      'youHaveOpenPositionAndOrders',
      'You have an existing position and open orders on this market.',
      {
        count: ordersCount,
      }
    );
  } else if (!ordersCount) {
    positionWarning = t('You have an existing position on this market.');
  } else {
    positionWarning = t(
      'youHaveOpenOrders',
      'You have open orders on this market.',
      {
        count: ordersCount,
      }
    );
  }

  return positionWarning;
};

const useMarginChangeWarning = ({
  mode,
  collateralIncreaseEstimate,
  asset,
}: {
  mode: MarginMode;
  collateralIncreaseEstimate: bigint;
  asset: AssetFieldsFragment;
}) => {
  const t = useT();

  const isCollateralIncreased = collateralIncreaseEstimate > BigInt(0);

  const amount = addDecimalsFormatNumberQuantum(
    collateralIncreaseEstimate.toString().replace('-', ''),
    asset?.decimals,
    asset?.quantum
  );

  let marginChangeWarning = '';

  const interpolation = {
    amount,
    symbol: asset.symbol,
  };

  if (mode === MarginMode.MARGIN_MODE_CROSS_MARGIN) {
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

  return marginChangeWarning;
};
