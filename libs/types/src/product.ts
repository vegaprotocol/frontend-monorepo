import type { Product } from './__generated__/types';

export type ProductType = NonNullable<Product['__typename']>;

// TODO: Update to be dynamically created for ProductionConfiguration union when schema
// changes make it to stagnet1
export type ProposalProductType = 'FutureProduct';
