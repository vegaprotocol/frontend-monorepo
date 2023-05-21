import classNames from 'classnames';

// Make sure these match the available __typename properties on product
export const Product = {
  Future: 'Future',
  Spot: 'Spot',
  Perpetual: 'Perpetual',
} as const;

export type ProductType = keyof typeof Product;

const ProductTypeMapping: {
  [key in ProductType]: string;
} = {
  [Product.Future]: 'Futures',
  [Product.Spot]: 'Spot',
  [Product.Perpetual]: 'Perpetuals',
};

export const ProductSelector = ({
  product,
  onSelect,
}: {
  product: ProductType;
  onSelect: (product: ProductType) => void;
}) => {
  return (
    <div className="flex gap-3 mb-3">
      {Object.keys(Product).map((t) => {
        const classes = classNames('py-1 border-b-2', {
          'border-vega-yellow text-black dark:text-white': t === product,
          'border-transparent text-vega-light-300 dark:text-vega-dark-300':
            t !== product,
        });
        return (
          <button
            key={t}
            onClick={() => {
              onSelect(t as ProductType);
            }}
            className={classes}
            data-testid={`product-${t}`}
          >
            {ProductTypeMapping[t as ProductType]}
          </button>
        );
      })}
    </div>
  );
};
