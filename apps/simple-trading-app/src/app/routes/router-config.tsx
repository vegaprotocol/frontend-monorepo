import { t } from '@vegaprotocol/react-helpers';
import { DealTicketContainer } from '../components/deal-ticket';
import { SimpleMarketList } from '../components/simple-market-list';
import { Portfolio } from '../components/portfolio';

export const ROUTES = {
  HOME: '/',
  MARKETS: 'markets',
  TRADING: 'trading/:marketId',
  LIQUIDITY: 'liquidity',
  PORTFOLIO: 'portfolio',
};

export const routerConfig = [
  {
    path: ROUTES.HOME,
    name: 'Home',
    text: t('Home'),
    element: <div>Home</div>,
  },
  {
    path: ROUTES.MARKETS,
    name: 'Markets',
    text: t('Markets'),
    element: <SimpleMarketList />,
  },
  {
    path: ROUTES.TRADING,
    name: 'Trading',
    text: t('Trading'),
    element: <DealTicketContainer />,
  },
  {
    path: ROUTES.LIQUIDITY,
    name: 'Liquidity',
    text: t('Liquidity'),
    element: <div>Liquidity</div>,
  },
  {
    path: ROUTES.PORTFOLIO,
    name: 'Portfolio',
    text: t('Portfolio'),
    element: <Portfolio />,
  },
];
