import { Vega } from './vega';
import { USDC } from './usdc';

export const TokenIconMap: Record<
  string,
  ({ size }: { size: number }) => JSX.Element
> = {
  '0xdf1B0F223cb8c7aB3Ef8469e529fe81E73089BD9': Vega, // testnet vega
  '0x62720E92FB7d77699A5D3754c429a3116900a84b': Vega, // stagnet vega
  '0x40ff2D218740EF033b43B8Ce0342aEBC81934554': USDC, // stagnet usdc
};
