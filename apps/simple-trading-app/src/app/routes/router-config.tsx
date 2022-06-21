import type { ReactElement } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import { DealTicketContainer } from '../components/deal-ticket';
import { SimpleMarketList } from '../components/simple-market-list';
import { Portfolio } from '../components/portfolio';

export const ROUTES = {
  MARKETS: 'markets',
  TRADING: 'trading',
  LIQUIDITY: 'liquidity',
  PORTFOLIO: 'portfolio',
};

export const routerConfig = [
  {
    path: ROUTES.MARKETS,
    children: [
      {
        path: `:state`,
        element: <SimpleMarketList />,
        children: [
          {
            path: `:product`,
            element: <SimpleMarketList />,
            children: [{ path: `:asset`, element: <SimpleMarketList /> }],
          },
        ],
      },
    ],
    name: 'Markets',
    text: t('Markets'),
    element: <SimpleMarketList />,
    icon: 'market',
  },
  {
    path: ROUTES.TRADING,
    name: 'Trading',
    text: t('Trading'),
    element: <DealTicketContainer />,
    children: [
      {
        path: ':marketId',
        element: <DealTicketContainer />,
      },
    ],
    icon: 'trade',
  },
  {
    path: ROUTES.PORTFOLIO,
    name: 'Portfolio',
    text: t('Portfolio'),
    element: <Portfolio />,
    icon: 'portfolio',
  },
];
