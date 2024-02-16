// NOTE: These are a temporary measure, pulled from an old branch on console.

import { IconNames } from '@blueprintjs/icons';
import { Icon } from '@vegaprotocol/ui-toolkit';
import { USDc } from './usdc';
import { Vega } from './vega';
import { USDt } from './usdt';

export interface AssetIconProps {
  symbol: string;
}

/**
 * A poorly implemented, limited support for asset icons.
 *
 * These are committed as 'deprecated' to discourage use outside the Treasury page. Rather
 * than use this, a better approach would be to use source contract addresses to match assets.
 * This will be done separately.
 *
 * @deprecated
 */
export function AssetIcon({ symbol }: AssetIconProps) {
  const s = symbol.toLowerCase();
  switch (s) {
    case 'a4a16e250a09a86061ec83c2f9466fc9dc33d332f86876ee74b6f128a5cd6710': // mainnet
    case 'c9fe6fc24fce121b2cc72680543a886055abb560043fda394ba5376203b7527d': // mainnet
      return <USDc size={32} />;
    case 'd1984e3d365faa05bcafbe41f50f90e3663ee7c0da22bb1e24b164e9532691b2': // mainnet
    case 'fc7fd956078fb1fc9db5c19b88f0874c4299b2a7639ad05a47a28c0aef291b55': // testnet
      return <Vega size={32} />;
    case 'bf1e88d19db4b3ca0d1d5bdb73718a01686b18cf731ca26adedf3c8b83802bba': // mainnet
    case 'ede4076aef07fd79502d14326c54ab3911558371baaf697a19d077f4f89de399': // testnet
      return <USDt size={32} />;
    default:
      return <Icon name={IconNames.BANK_ACCOUNT} size={8} />;
  }
}
