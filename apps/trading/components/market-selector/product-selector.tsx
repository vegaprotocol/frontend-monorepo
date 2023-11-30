import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { Links } from '../../lib/links';
import { useT } from '../../lib/use-t';

// Make sure these match the available __typename properties on product
export const Product = {
  All: 'All',
  Future: 'Future',
  Spot: 'Spot',
  Perpetual: 'Perpetual',
} as const;

export type ProductType = keyof typeof Product;

export const ProductSelector = ({
  product,
  onSelect,
}: {
  product: ProductType;
  onSelect: (product: ProductType) => void;
}) => {
  const t = useT();
  const ProductTypeMapping: {
    [key in ProductType]: string;
  } = {
    [Product.All]: t('All'),
    [Product.Future]: t('Futures'),
    [Product.Spot]: t('Spot'),
    [Product.Perpetual]: t('Perpetuals'),
  };
  return (
    <div className="flex mb-2">
      {Object.keys(Product).map((t) => {
        const classes = classNames(
          'text-sm px-3 py-1.5 rounded hover:text-vega-clight-50 dark:hover:text-vega-cdark-50',
          {
            'bg-vega-clight-500 dark:bg-vega-cdark-500 text-default':
              t === product,
            'text-secondary': t !== product,
          }
        );
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
      <Link
        to={Links.MARKETS()}
        className="flex items-center ml-auto text-sm gap-2"
        title={t('See all markets')}
      >
        <span className="underline underline-offset-4">{t('Browse')}</span>
        <VegaIcon name={VegaIconNames.ARROW_RIGHT} />
      </Link>
    </div>
  );
};
