import type { PriceInMarketProps } from '../price-in-market';

export const PriceInMarket = ({ price }: PriceInMarketProps) => {
  return <span>{price}</span>;
};
