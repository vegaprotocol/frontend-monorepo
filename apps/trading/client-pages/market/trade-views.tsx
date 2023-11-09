import type { ComponentProps } from 'react';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { DepthChartContainer } from '@vegaprotocol/market-depth';
import {
  CandlesChartContainer,
  CandlesMenu,
} from '@vegaprotocol/candles-chart';
import { Filter, OpenOrdersMenu } from '@vegaprotocol/orders';
import { TradesContainer } from '../../components/trades-container';
import { OrderbookContainer } from '../../components/orderbook-container';
import { FillsContainer } from '../../components/fills-container';
import { PositionsContainer } from '../../components/positions-container';
import { AccountsContainer } from '../../components/accounts-container';
import { LiquidityContainer } from '../../components/liquidity-container';
import { FundingContainer } from '../../components/funding-container';
import { FundingPaymentsContainer } from '../../components/funding-payments-container';
import type { OrderContainerProps } from '../../components/orders-container';
import { OrdersContainer } from '../../components/orders-container';
import { StopOrdersContainer } from '../../components/stop-orders-container';
import { AccountsMenu } from '../../components/accounts-menu';
import { PositionsMenu } from '../../components/positions-menu';
import { useT } from '../../lib/use-t';

type MarketDependantView =
  | typeof CandlesChartContainer
  | typeof DepthChartContainer
  | typeof OrderbookContainer
  | typeof TradesContainer;

type MarketDependantViewProps = ComponentProps<MarketDependantView>;

export const NoMarketSplash = () => {
  const t = useT();
  return <Splash>{t('No market')}</Splash>;
};

const requiresMarket = (View: MarketDependantView) => {
  const WrappedComponent = (props: MarketDependantViewProps) =>
    props.marketId ? <View {...props} /> : <NoMarketSplash />;
  WrappedComponent.displayName = `RequiresMarket(${View.name})`;
  return WrappedComponent;
};

export type TradingView = keyof ReturnType<typeof useTradingViews>;

export const useTradingViews = () => {
  const t = useT();
  return {
    candles: {
      label: t('Candles'),
      component: requiresMarket(CandlesChartContainer),
      menu: CandlesMenu,
    },
    depth: {
      label: t('Depth'),
      component: requiresMarket(DepthChartContainer),
    },
    liquidity: {
      label: t('Liquidity'),
      component: requiresMarket(LiquidityContainer),
    },
    funding: {
      label: t('Funding'),
      component: requiresMarket(FundingContainer),
    },
    fundingPayments: {
      label: t('Funding Payments'),
      component: FundingPaymentsContainer,
    },
    orderbook: {
      label: t('Orderbook'),
      component: requiresMarket(OrderbookContainer),
    },
    trades: {
      label: t('Trades'),
      component: requiresMarket(TradesContainer),
    },
    positions: {
      label: t('Positions'),
      component: PositionsContainer,
      menu: PositionsMenu,
    },
    activeOrders: {
      label: t('Active'),
      component: (props: OrderContainerProps) => (
        <OrdersContainer {...props} filter={Filter.Open} />
      ),
      menu: OpenOrdersMenu,
    },
    closedOrders: {
      label: t('Closed'),
      component: (props: OrderContainerProps) => (
        <OrdersContainer {...props} filter={Filter.Closed} />
      ),
    },
    rejectedOrders: {
      label: t('Rejected'),
      component: (props: OrderContainerProps) => (
        <OrdersContainer {...props} filter={Filter.Rejected} />
      ),
    },
    orders: {
      label: t('All'),
      component: OrdersContainer,
      menu: OpenOrdersMenu,
    },
    stopOrders: {
      label: t('Stop'),
      component: StopOrdersContainer,
    },
    collateral: {
      label: t('Collateral'),
      component: AccountsContainer,
      menu: AccountsMenu,
    },
    fills: { label: t('Fills'), component: FillsContainer },
  };
};
