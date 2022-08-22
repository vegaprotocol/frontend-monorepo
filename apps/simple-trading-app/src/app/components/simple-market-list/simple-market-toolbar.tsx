import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { IconNames } from '@blueprintjs/icons';
import { t } from '@vegaprotocol/react-helpers';
import { themelite as theme } from '@vegaprotocol/tailwindcss-config';
import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItemIndicator,
  Icon,
} from '@vegaprotocol/ui-toolkit';
import useMarketFiltersData from '../../hooks/use-markets-filter';
import { STATES_FILTER } from './constants';
import type { SimpleMarkets_markets } from './__generated__/SimpleMarkets';

interface Props {
  data: SimpleMarkets_markets[];
}

const SimpleMarketToolbar = ({ data }: Props) => {
  const navigate = useNavigate();
  const params = useParams();
  const { products, assetsPerProduct } = useMarketFiltersData(data);
  const [isOpen, setOpen] = useState(false);
  const [activeNumber, setActiveNumber] = useState(
    products?.length ? products.indexOf(params.product || '') + 1 : -1
  );

  const [sliderStyles, setSliderStyles] = useState<Record<string, string>>({});
  const slideContRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (products.length) {
      setActiveNumber(products.indexOf(params.product || '') + 1);
    } else {
      setActiveNumber(-1);
    }
  }, [params, products, setActiveNumber]);

  useEffect(() => {
    const contStyles = (
      slideContRef.current as HTMLUListElement
    ).getBoundingClientRect();
    const selectedStyles = (slideContRef.current as HTMLUListElement).children[
      activeNumber
    ]?.getBoundingClientRect();
    const styles: Record<string, string> = selectedStyles
      ? {
          backgroundColor: activeNumber ? '' : theme.colors.pink,
          width: `${selectedStyles.width}px`,
          left: `${selectedStyles.left - contStyles.left}px`,
        }
      : {};
    setSliderStyles(styles);
  }, [activeNumber, slideContRef]);

  const onStateChange = useCallback(
    (activeState: string) => {
      const asset =
        params.asset && params.asset !== 'all' ? `/${params.asset}` : '';
      const product = params.product ? `/${params.product}` : '';
      const state =
        activeState !== 'Active' || product ? `/${activeState}` : '';
      navigate(`/markets${state}${product}${asset}`);
    },
    [params, navigate]
  );

  return (
    <div className="w-full max-w-full mb-32 font-alpha">
      <ul
        ref={slideContRef}
        className="grid grid-flow-col auto-cols-min gap-8 relative pb-4 mb-16"
        data-testid="market-products-menu"
        aria-label={t('Product type')}
      >
        <li key="all-markets" className="md:mr-16 whitespace-nowrap">
          <Link
            to={`/markets${
              params.state && params.state !== 'Active'
                ? '/' + params.state
                : ''
            }`}
            aria-label={t('All markets')}
            className={classNames('text-h5 pl-0 text-pink hover:opacity-75', {
              active: !activeNumber,
            })}
          >
            {t('All Markets')}
          </Link>
        </li>
        {products.map((product, i) => (
          <li key={product} className="mx-16 whitespace-nowrap">
            <Link
              to={`/markets/${params.state || 'Active'}/${product}`}
              className={classNames(
                'text-h5 hover:opacity-75 text-black dark:text-white',
                {
                  active: activeNumber - 1 === i,
                }
              )}
              aria-label={product}
            >
              {product}
            </Link>
          </li>
        ))}
        <li
          className="absolute bottom-0 h-2 transition-left duration-300 dark:bg-white bg-black"
          key="slider"
          style={sliderStyles}
        />
      </ul>
      <div className="grid gap-8 pb-4 mt-8 md:grid-cols-[min-content,min-content,1fr]">
        <div className="pb-8">
          <DropdownMenu onOpenChange={(open) => setOpen(open)}>
            <DropdownMenuTrigger
              className="mr-16 w-auto text-capMenu text-black dark:text-white"
              data-testid="state-trigger"
            >
              <div className="w-full justify-between uppercase inline-flex items-center justify-center box-border">
                {STATES_FILTER.find(
                  (state) =>
                    state.value === params.state ||
                    (!params.state && state.value === 'Active')
                )?.text || params.state}
                <Icon
                  name={IconNames.ARROW_DOWN}
                  className={classNames(
                    'fill-current ml-8 transition-transform',
                    {
                      'rotate-180': isOpen,
                    }
                  )}
                  size={16}
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {STATES_FILTER.map(({ value, text }) => (
                <DropdownMenuCheckboxItem
                  className="uppercase text-ui dark:text-white"
                  key={value}
                  inset
                  checked={
                    value === params.state ||
                    (!params.state && value === 'Active')
                  }
                  onCheckedChange={() => onStateChange(value)}
                >
                  <DropdownMenuItemIndicator>
                    <Icon name="tick" />
                  </DropdownMenuItemIndicator>
                  {text}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="hidden md:block text-deemphasise dark:text-midGrey">
          |
        </div>
        {activeNumber > 0 && (
          <ul
            className="md:gap-16 gap-12 pb-4 md:ml-16 flex flex-wrap"
            data-testid="market-assets-menu"
            aria-label={t('Asset on the market')}
          >
            <li key="all">
              <Link
                to={`/markets/${params.state}/${params.product}`}
                className={classNames('uppercase pl-0 md:pl-4 text-capMenu', {
                  'text-deemphasise dark:text-midGrey':
                    params.asset && params.asset !== 'all',
                  'active text-black dark:text-white':
                    !params.asset || params.asset === 'all',
                })}
                aria-label={t('All assets')}
              >
                {t('All')}
              </Link>
            </li>
            {assetsPerProduct[products[activeNumber - 1]]?.map((asset) => (
              <li key={asset}>
                <Link
                  to={`/markets/${params.state}/${params.product}/${asset}`}
                  className={classNames('uppercase text-capMenu', {
                    'text-deemphasise dark:text-midGrey':
                      params.asset !== asset,
                    'active text-black dark:text-white': params.asset === asset,
                  })}
                  aria-label={asset}
                >
                  {asset}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SimpleMarketToolbar;
