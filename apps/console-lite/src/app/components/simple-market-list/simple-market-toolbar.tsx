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
import { MarketState } from '@vegaprotocol/types';
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
        activeState !== MarketState.STATE_ACTIVE || product
          ? `/${activeState}`
          : '';
      navigate(`/markets${state}${product}${asset}`);
    },
    [params, navigate]
  );

  return (
    <div className="w-full max-w-full mb-2 md:mb-8 font-alpha">
      <ul
        ref={slideContRef}
        className="grid grid-flow-col auto-cols-min gap-4 relative pb-2 mb-2"
        data-testid="market-products-menu"
        aria-label={t('Product type')}
      >
        <li key="all-markets" className="md:mr-2 whitespace-nowrap">
          <Link
            to={`/markets${
              params.state && params.state !== MarketState.STATE_ACTIVE
                ? '/' + params.state
                : ''
            }`}
            aria-label={t('All markets')}
            className={classNames('pl-0 text-pink hover:opacity-75', {
              active: !activeNumber,
            })}
          >
            {t('All Markets')}
          </Link>
        </li>
        {products.map((product, i) => (
          <li key={product} className="mx-2 whitespace-nowrap">
            <Link
              to={`/markets/${
                params.state || MarketState.STATE_ACTIVE
              }/${product}`}
              className={classNames(
                'hover:opacity-75 text-black dark:text-white',
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
          className="absolute bottom-0 h-[2px] transition-left duration-300 dark:bg-white bg-black"
          key="slider"
          style={sliderStyles}
        />
      </ul>
      <div className="grid gap-4 pb-2 mt-2 md:mt-6 md:grid-cols-[min-content,min-content,1fr]">
        <div className="pb-2">
          <DropdownMenu onOpenChange={(open) => setOpen(open)}>
            <DropdownMenuTrigger
              className="mr-2 w-auto text-capMenu text-black dark:text-white"
              data-testid="state-trigger"
            >
              <div className="w-full justify-between uppercase inline-flex items-center justify-center box-border">
                {STATES_FILTER.find(
                  (state) =>
                    state.value === params.state ||
                    (!params.state && state.value === MarketState.STATE_ACTIVE)
                )?.text || params.state}
                <Icon
                  name={IconNames.ARROW_DOWN}
                  className={classNames(
                    'fill-current ml-2 transition-transform',
                    {
                      'rotate-180': isOpen,
                    }
                  )}
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {STATES_FILTER.map(({ value, text }) => (
                <DropdownMenuCheckboxItem
                  className="uppercase text-ui"
                  key={value}
                  checked={
                    value === params.state ||
                    (!params.state && value === MarketState.STATE_ACTIVE)
                  }
                  onCheckedChange={() => onStateChange(value)}
                >
                  {text}
                  <DropdownMenuItemIndicator>
                    <Icon name="tick" />
                  </DropdownMenuItemIndicator>
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
            className="md:gap-x-6 gap-x-4 gap-y-1 pb-2 md:ml-2 flex flex-wrap"
            data-testid="market-assets-menu"
            aria-label={t('Asset on the market')}
          >
            <li key="all">
              <Link
                to={`/markets/${params.state}/${params.product}`}
                className={classNames('uppercase pl-0 md:pl-2 text-capMenu', {
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
