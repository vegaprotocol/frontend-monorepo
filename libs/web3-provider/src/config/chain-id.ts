export type Network = 'devnet' | 'stagnet' | 'stagnet2' | 'testnet' | 'mainnet';

export const REQUIRED_CHAIN_ID: {
  [key in Network]: number;
} = {
  devnet: 3,
  stagnet: 3,
  stagnet2: 3,
  testnet: 3,
  mainnet: 1,
};

export const APP_CHAIN_ID =
  REQUIRED_CHAIN_ID[process.env['NX_VEGA_NETWORK'] as Network];
