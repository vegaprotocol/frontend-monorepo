import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { IconNames } from '@blueprintjs/icons';
import { t } from '@vegaprotocol/react-helpers';
import { theme } from '@vegaprotocol/tailwindcss-config';
import {
  Button,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItemIndicator,
  Icon,
} from '@vegaprotocol/ui-toolkit';
import useMarketFiltersData from '../../hooks/use-markets-filter';
import { STATES_FILTER } from './constants';

const SimpleMarketToolbar = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { assets, products, assetsPerProduct } = useMarketFiltersData();
  const [isOpen, setOpen] = useState(false);
  const [activeNumber, setActiveNumber] = useState(
    products?.length ? products.indexOf(params.product || '') + 1 : -1
  );
  const [activeAsset, setActiveAsset] = useState(params.asset || 'all');
  const [activeState, setActiveState] = useState(params.state || 'Active');
  const [sliderStyles, setSliderStyles] = useState<Record<string, string>>({});
  const slideContRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    // handle corner case when there is product
    // param, but no products yet
    if (activeNumber < 0 && products?.length) {
      setActiveNumber(products.indexOf(params.product || '') + 1 || 0);
    }
  }, [activeNumber, setActiveNumber, products, params]);

  useEffect(() => {
    const contStyles = (
      slideContRef.current as HTMLUListElement
    ).getBoundingClientRect();
    const selectedStyles = (slideContRef.current as HTMLUListElement).children[
      activeNumber
    ]?.getBoundingClientRect();
    const styles: Record<string, string> = selectedStyles
      ? {
          backgroundColor: activeNumber ? '' : theme.colors.coral,
          width: `${selectedStyles.width}px`,
          left: `${selectedStyles.left - contStyles.left}px`,
        }
      : {};
    setSliderStyles(styles);
  }, [activeNumber, slideContRef]);

  useEffect(() => {
    if (activeNumber < 0) {
      return;
    }
    const product = activeNumber ? `/${products[activeNumber - 1]}` : '';
    const asset = activeAsset !== 'all' || product ? `/${activeAsset}` : '';
    const state = activeState !== 'Active' || asset ? `/${activeState}` : '';
    navigate(`/markets${state}${asset}${product}`);
  }, [activeNumber, activeAsset, activeState, products, navigate]);

  return (
    <div className="w-max mb-16">
      <ul
        ref={slideContRef}
        className="grid grid-flow-col auto-cols-min gap-8 relative pb-4 mb-16"
        data-testid="market-products-menu"
        aria-label={t('Product type')}
      >
        <li key="all" className="md:mr-16 whitespace-nowrap">
          <Button
            variant="inline"
            onClick={() => setActiveNumber(0)}
            style={{ color: theme.colors.coral }}
            className={classNames('text-h5 pl-0', { active: !activeNumber })}
            aria-label={t('All markets')}
          >
            {t('All Markets')}
          </Button>
        </li>
        {products.map((product, i) => (
          <li key={product} className="mx-16 whitespace-nowrap">
            <Button
              variant="inline"
              onClick={() => setActiveNumber(++i)}
              className={classNames('text-h5', {
                active: activeNumber - 1 === i,
              })}
              aria-label={product}
            >
              {product}
            </Button>
          </li>
        ))}
        <li
          className="absolute bottom-0 h-2 transition-left duration-300 dark:bg-white bg-black"
          key="slider"
          style={sliderStyles}
        />
      </ul>
      <div className="grid gap-8 pb-4 mt-8 md:grid-cols-[min-content,min-content,1fr]">
        <div className="">
          <DropdownMenu onOpenChange={(open) => setOpen(open)}>
            <DropdownMenuTrigger
              className="mr-16 w-auto text-ui"
              data-testid="state-trigger"
            >
              <div className="w-full justify-between uppercase inline-flex items-center justify-center box-border">
                {STATES_FILTER.find((state) => state.value === activeState)
                  ?.text || activeState}
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
                  className="uppercase text-ui"
                  key={value}
                  inset
                  checked={value === activeState}
                  onCheckedChange={() => setActiveState(value)}
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
        <div className="hidden md:block">|</div>
        <ul
          className="grid grid-flow-col auto-cols-min md:gap-16 sm:gap-12 pb-4 md:ml-16"
          data-testid="market-assets-menu"
          aria-label={t('Asset on the market')}
        >
          <li key="all">
            <Button
              variant="inline"
              onClick={() => setActiveAsset('all')}
              className={classNames('uppercase pl-0 md:pl-4', {
                'text-deemphasise': activeAsset !== 'all',
                active: activeAsset === 'all',
              })}
              aria-label={t('All assets')}
            >
              {t('All')}
            </Button>
          </li>
          {(activeNumber
            ? assetsPerProduct[products[activeNumber - 1]]
            : assets
          )?.map((asset) => (
            <li key={asset}>
              <Button
                variant="inline"
                onClick={() => setActiveAsset(asset)}
                className={classNames('uppercase', {
                  'text-deemphasise': activeAsset !== asset,
                  active: activeAsset === asset,
                })}
                aria-label={asset}
              >
                {asset}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SimpleMarketToolbar;
