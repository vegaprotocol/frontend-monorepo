import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { Links } from '../../lib/links';
import { useT } from '../../lib/use-t';
import {
  type IMarketType,
  MarketType,
} from '../../lib/hooks/use-market-filters';

export const ProductSelector = ({
  marketTypes,
  onSelect,
}: {
  marketTypes: IMarketType[];
  onSelect: (marketType?: IMarketType) => void;
}) => {
  const t = useT();

  const ProductTypeMapping: {
    [key in IMarketType]: string;
  } = {
    [MarketType.PERPETUAL]: t('Perpetuals'),
    [MarketType.FUTURE]: t('Futures'),
    [MarketType.SPOT]: t('Spot'),
  };

  const buttons = [MarketType.PERPETUAL, MarketType.FUTURE, MarketType.SPOT];

  const getStyles = (selected: boolean) =>
    classNames('text-sm px-3 py-1.5 rounded hover:text-gs-50 ', {
      'bg-gs-500  text-default': selected,
      'text-secondary': !selected,
    });

  return (
    <div className="flex mb-2">
      <button
        key={'all-market-types'}
        onClick={() => {
          onSelect();
        }}
        className={getStyles(
          marketTypes.length === 0 ||
            marketTypes.length === Object.keys(MarketType).length
        )}
        data-testid={`product-ALL`}
      >
        {t('All')}
      </button>
      {buttons.map((t) => {
        return (
          <button
            key={t}
            onClick={() => {
              onSelect(t);
            }}
            className={getStyles(marketTypes.includes(t))}
            data-testid={`product-${t}`}
          >
            {ProductTypeMapping[t]}
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
