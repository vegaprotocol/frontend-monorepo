import { type SVGAttributes, type ComponentType } from 'react';
import { USDT } from './usdt';

export const assetIcons: Record<
  string,
  ComponentType<SVGAttributes<SVGElement>>
> = {
  '2a1f29de786c49d7d4234410bf2e7196a6d173730288ffe44b1f7e282efb92b1': USDT,
};
