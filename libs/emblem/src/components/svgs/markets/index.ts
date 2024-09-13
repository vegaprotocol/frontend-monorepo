import { type SVGAttributes, type ComponentType } from 'react';
import { GoldYen } from './gold-yen';

export const marketIcons: Record<
  string,
  ComponentType<SVGAttributes<SVGElement>>
> = {
  '431502ba62e78573e1454f3c38b6de8d75686e5ce61b18326afcb3cd761b24f4': GoldYen,
};
