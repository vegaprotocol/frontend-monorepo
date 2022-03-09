import { DealTicket } from '../deal-ticket';

export const Chart = () => <div>TODO: Chart</div>;
export const Orderbook = () => <div>TODO: Orderbook</div>;
export const Orders = () => <div>TODO: Orders</div>;
export const Positions = () => <div>TODO: Positions</div>;
export const Collateral = () => <div>TODO: Collateral</div>;

export type TradingView = keyof typeof TradingViews;

export const TradingViews = {
  chart: Chart,
  ticket: DealTicket,
  orderbook: Orderbook,
  orders: Orders,
  positions: Positions,
  collateral: Collateral,
};
