import { type SVGAttributes, type ComponentType } from 'react';
import { GoldYen } from './gold-yen';
import { GoldGbp } from './gold-gbp';
import { CrudeOil } from './crude-oil';

export const marketIcons: Record<
  string,
  ComponentType<SVGAttributes<SVGElement>>
> = {
    '27b3e25451b736261b26b30de0b3009143ff46f7404b4ee784b10c0792abe149': GoldYen,
    '74711691b900bc8fea802ebb99d06c4ee326bda75058ac1c9637e9bc8233872d': GoldGbp,
    '19fa4e7dcaf956efe33e5345bfd7a8ad3b4ea4634cdd12b3158321350f949009': CrudeOil,
};
