import { t } from '@vegaprotocol/react-helpers';

export const PORTFOLIO_ASSETS = 'assets';
export const PORTFOLIO_POSITIONS = 'positions';
export const PORTFOLIO_ORDERS = 'orders';
export const PORTFOLIO_FILLS = 'fills';
export const PORTFOLIO_DEPOSITS = 'deposits';

export const PORTFOLIO_ITEMS = [
  {
    name: t('Assets'),
    id: PORTFOLIO_ASSETS,
    url: `/portfolio/${PORTFOLIO_ASSETS}`,
  },
  {
    name: t('Positions'),
    id: PORTFOLIO_POSITIONS,
    url: `/portfolio/${PORTFOLIO_POSITIONS}`,
  },
  {
    name: t('Orders'),
    id: PORTFOLIO_ORDERS,
    url: `/portfolio/${PORTFOLIO_ORDERS}`,
  },
  {
    name: t('Fills'),
    id: PORTFOLIO_FILLS,
    url: `/portfolio/${PORTFOLIO_FILLS}`,
  },
  {
    name: t('Deposits'),
    id: PORTFOLIO_DEPOSITS,
    url: `/portfolio/${PORTFOLIO_DEPOSITS}`,
  },
];
