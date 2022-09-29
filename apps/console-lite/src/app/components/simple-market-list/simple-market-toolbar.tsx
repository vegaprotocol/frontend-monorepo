import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { IconNames } from '@blueprintjs/icons';
import { t } from '@vegaprotocol/react-helpers';
import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItemIndicator,
  Icon,
} from '@vegaprotocol/ui-toolkit';
import { MarketState } from '@vegaprotocol/types';
import useMarketFiltersData from '../../hooks/use-markets-filter';
import type { Market } from '@vegaprotocol/market-list';
import { HorizontalMenu } from '../horizontal-menu';
import type { HorizontalMenuItem } from '../horizontal-menu';
import * as constants from './constants';

interface Props {
  data: Market[];
}

const SimpleMarketToolbar = ({ data }: Props) => {
  const navigate = useNavigate();
  const params = useParams();
  const { products, assetsPerProduct } = useMarketFiltersData(data);
  const [isOpen, setOpen] = useState(false);

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

  const productItems = useMemo(() => {
    const currentState = params.state || MarketState.STATE_ACTIVE;
    const noStateSkip = currentState !== MarketState.STATE_ACTIVE;
    const items: HorizontalMenuItem[] = [
      {
        ...constants.ALL_PRODUCTS_ITEM,
        url: `/markets${noStateSkip ? '/' + currentState : ''}`,
      },
    ];
    products.forEach((product) =>
      items.push({
        name: product,
        id: product,
        url: `/markets/${currentState}/${product}`,
      })
    );
    return items;
  }, [params, products]);

  return (
    <div className="w-full max-w-full mb-2 md:mb-8 font-alpha">
      <HorizontalMenu
        active={params.product || constants.ALL_PRODUCTS_ITEM.id}
        items={productItems}
        data-testid="market-products-menu"
        aria-label={t('Product type')}
      />
      <div className="grid gap-4 pb-2 mt-2 md:mt-6 md:grid-cols-[min-content,min-content,1fr]">
        <div className="pb-2">
          <DropdownMenu open={isOpen} onOpenChange={(open) => setOpen(open)}>
            <DropdownMenuTrigger
              className="mr-2 w-auto text-capMenu text-black dark:text-white"
              data-testid="state-trigger"
              onClick={() => setOpen(!isOpen)}
            >
              <div className="w-full justify-between uppercase inline-flex items-center justify-center box-border">
                {constants.STATES_FILTER.find(
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
              {constants.STATES_FILTER.map(({ value, text }) => (
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
        {params.product && (
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
            {assetsPerProduct[params?.product]?.map((asset) => (
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
