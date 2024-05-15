import type { AssetBalanceProps } from '../asset-balance';

export const AssetBalance = ({ price }: AssetBalanceProps) => (
  <span>${price}</span>
);
