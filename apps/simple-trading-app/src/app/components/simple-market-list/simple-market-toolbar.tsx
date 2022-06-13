import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { t } from '@vegaprotocol/react-helpers';
import { theme } from '@vegaprotocol/tailwindcss-config';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Select } from '@vegaprotocol/ui-toolkit';
import useMarketFiltersData from '../../hooks/use-markets-filter';
import { STATES_FILTER } from './constants';

const SimpleMarketToolbar = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { assets, products, assetsPerProduct } = useMarketFiltersData();
  const [activeNumber, setActiveNumber] = useState(
    products?.length ? products.indexOf(params.product || '') + 1 : -1
  );
  const [activeAsset, setActiveAsset] = useState(params.asset || 'all');
  const [activeState, setActiveState] = useState(params.state || 'Active');
  const [sliderStyles, setSliderStyles] = useState<Record<string, string>>({});
  const slideContRef = useRef<HTMLUListElement | null>(null);
  const onMenuClick = useCallback(
    (i: number) => {
      setActiveNumber(i);
    },
    [setActiveNumber]
  );
  const onStateChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setActiveState(e.target.value);
    },
    [setActiveState]
  );

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
    <div className="w-max">
      <ul
        ref={slideContRef}
        className="grid grid-flow-col auto-cols-min gap-8 relative pb-4"
        data-testid="market-products-menu"
      >
        <li key="all" className="md:mx-16 whitespace-nowrap">
          <Button
            variant="inline"
            onClick={() => onMenuClick(0)}
            style={{ color: theme.colors.coral }}
            className={classNames({ active: !activeNumber })}
          >
            {t('All Markets')}
          </Button>
        </li>
        {products.map((product, i) => (
          <li key={product} className="mx-16 whitespace-nowrap">
            <Button
              variant="inline"
              onClick={() => onMenuClick(++i)}
              className={classNames({ active: activeNumber - 1 === i })}
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
        <div className="md:ml-16">
          <Select
            value={activeState}
            onChange={onStateChange}
            name="states"
            className="mr-16 w-auto"
          >
            {STATES_FILTER.map((state) => (
              <option key={state.value} value={state.value}>
                {state.text}
              </option>
            ))}
          </Select>
        </div>
        <div className="hidden md:block">|</div>
        <ul
          className="grid grid-flow-col auto-cols-min md:gap-8 pb-4"
          data-testid="market-assets-menu"
        >
          <li key="all" className="mx-8">
            <Button
              variant="inline"
              onClick={() => setActiveAsset('all')}
              className={classNames({
                'font-bold': activeAsset === 'all',
              })}
            >
              {t('All')}
            </Button>
          </li>
          {(activeNumber
            ? assetsPerProduct[products[activeNumber - 1]]
            : assets
          )?.map((asset) => (
            <li key={asset} className="mx-8Z">
              <Button
                variant="inline"
                onClick={() => setActiveAsset(asset)}
                className={classNames({
                  'font-bold': activeAsset === asset,
                })}
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
