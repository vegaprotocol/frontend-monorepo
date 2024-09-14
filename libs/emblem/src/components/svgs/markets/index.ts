import { type SVGAttributes, type ComponentType } from 'react';
import { GoldYen } from './gold-yen';

export const marketIcons: Record<
  string,
  ComponentType<SVGAttributes<SVGElement>>
> = {
  '27b3e25451b736261b26b30de0b3009143ff46f7404b4ee784b10c0792abe149': GoldYen,
};
