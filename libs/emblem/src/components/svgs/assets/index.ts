import { type SVGAttributes, type ComponentType } from 'react';
import { USDT } from './usdt';
import { NEB } from './neb';

export const assetIcons: Record<
  string,
  ComponentType<SVGAttributes<SVGElement>>
> = {
  d1984e3d365faa05bcafbe41f50f90e3663ee7c0da22bb1e24b164e9532691b2: NEB,
  '2a1f29de786c49d7d4234410bf2e7196a6d173730288ffe44b1f7e282efb92b1': USDT,
};
