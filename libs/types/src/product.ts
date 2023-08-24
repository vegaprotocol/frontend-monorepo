import type { Product, ProductConfiguration } from './__generated__/types';

export type ProductType = NonNullable<Product['__typename']>;

export type ProposalProductType = NonNullable<
  ProductConfiguration['__typename']
>;
