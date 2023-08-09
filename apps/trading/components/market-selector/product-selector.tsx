import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { Routes } from '../../pages/client-router';
import { t } from '@vegaprotocol/i18n';
import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';

// Make sure these match the available __typename properties on product
export const Product = {
  Future: 'Future',
  Spot: 'Spot',
  Perpetual: 'Perpetual',
} as const;

export type ProductType = keyof typeof Product | 'All';

const ProductTypeMapping: {
  [key in ProductType]: string;
} = {
  All: 'All',
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
    <div className="flex mb-2">
      {['All', ...Object.keys(Product)].map((t) => {
        const classes = classNames('px-3 py-1.5 rounded', {
          'bg-vega-clight-500 dark:bg-vega-cdark-500 text-default':
            t === product,
          'text-secondary': t !== product,
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
      <Link
        to={Routes.MARKETS}
        className="flex items-center gap-2 ml-auto"
        title={t('See all markets')}
      >
        <VegaIcon name={VegaIconNames.ARROW_RIGHT} />
      </Link>
    </div>
  );
};
