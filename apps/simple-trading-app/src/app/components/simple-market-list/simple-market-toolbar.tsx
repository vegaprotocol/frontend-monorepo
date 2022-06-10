import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { t } from '@vegaprotocol/react-helpers';
import { theme } from '@vegaprotocol/tailwindcss-config';
import { useNavigate, useParams } from 'react-router-dom';
import { Select } from '@vegaprotocol/ui-toolkit';
import useMarketFiltersData from '../../hooks/use-markets-filter';
import { STATES_FILTER } from './constants';

const SimpleMarketToolbar = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { assets, products, assetsPerProduct } = useMarketFiltersData();
  const [activeNumber, setActiveNumber] = useState(
    products.indexOf(params.product || '') + 1 || 0
  );
  const [activeAsset, setActiveAsset] = useState(params.asset || 'all');
  const [activeState, setActiveState] = useState(params.state || 'Active');
  const [sliderStyles, setSliderStyles] = useState<Record<string, string>>({});
  const slideContRef = useRef<HTMLDivElement | null>(null);
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
    const contStyles = (
      slideContRef.current as HTMLDivElement
    ).getBoundingClientRect();
    const selectedStyles = (slideContRef.current as HTMLDivElement).children[
      activeNumber
    ].getBoundingClientRect();

    const styles = {
      backgroundColor: activeNumber ? '' : theme.colors.coral,
      width: `${selectedStyles.width}px`,
      left: `${selectedStyles.left - contStyles.left}px`,
    };
    setSliderStyles(styles);
  }, [activeNumber, slideContRef]);

  useEffect(() => {
    const product = activeNumber ? `/${products[activeNumber - 1]}` : '';
    const asset = activeAsset !== 'all' || product ? `/${activeAsset}` : '';
    const state = activeState !== 'Active' || asset ? `/${activeState}` : '';
    navigate(`/markets${state}${asset}${product}`);
  }, [activeNumber, activeAsset, activeState, products, navigate]);

  return (
    <div className="max-w-max">
      <div
        ref={slideContRef}
        className="grid grid-flow-col auto-cols-min gap-8 relative pb-4"
      >
        <div
          className="md:mx-16 whitespace-nowrap cursor-pointer"
          onClick={() => onMenuClick(0)}
        >
          {t('All Markets')}
        </div>
        {products.map((product, i) => (
          <div
            key={product}
            className="mx-16 whitespace-nowrap cursor-pointer"
            onClick={() => onMenuClick(++i)}
          >
            {product}
          </div>
        ))}
        <div
          className="absolute bottom-0 h-2 transition-left duration-300 dark:bg-white bg-black"
          style={sliderStyles}
        />
      </div>
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
        <div className="grid grid-flow-col auto-cols-min md:gap-8 pb-4">
          <div
            className={classNames('mx-8 whitespace-nowrap cursor-pointer', {
              'font-bold': activeAsset === 'all',
            })}
            onClick={() => setActiveAsset('all')}
          >
            {t('All')}
          </div>
          {(activeNumber
            ? assetsPerProduct[products[activeNumber - 1]]
            : assets
          )?.map((asset) => (
            <div
              key={asset}
              className={classNames('mx-8 whitespace-nowrap cursor-pointer', {
                'font-bold': activeAsset === asset,
              })}
              onClick={() => setActiveAsset(asset)}
            >
              {asset}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimpleMarketToolbar;
