import { Vega } from './vega';
import { USDc } from './usdc';
import { USDt } from './usdt';

export const TokenIconMap: Record<
  string,
  ({ size }: { size: number }) => JSX.Element
> = {
  // Vega
  '0xcB84d72e61e383767C4DFEb2d8ff7f4FB89abc6e': Vega, // mainnet
  '0xdf1B0F223cb8c7aB3Ef8469e529fe81E73089BD9': Vega, // testnet
  '0x62720E92FB7d77699A5D3754c429a3116900a84b': Vega, // stagnet

  // USDc
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': USDc, // mainnet
  '0xdBa6373d0DAAAA44bfAd663Ff93B1bF34cE054E9': USDc, // testnet

  // USDt
  '0xdAC17F958D2ee523a2206206994597C13D831ec7': USDt, // mainnet
  '0x607c609C21171578847d7c31f29C235850f47Bb7': USDt, // tesnet
};
