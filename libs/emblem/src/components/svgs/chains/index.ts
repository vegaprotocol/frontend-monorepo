import { type SVGAttributes, type ComponentType } from 'react';
import { Chain1 } from './1';
import { Chain42161 } from './42161';

export const chainIcons: Record<
  string,
  ComponentType<SVGAttributes<SVGElement>>
> = {
  1: Chain1,
  42161: Chain42161,
};
