import { t } from '@vegaprotocol/react-helpers';

import { Dashboard } from '../components/dashboard';
import { Detail } from '../components/detail';

export const ROUTES = {
  MARKETS: 'markets',
};

export const routerConfig = [
  { path: '/', element: <Dashboard />, icon: '' },
  {
    path: ROUTES.MARKETS,
    name: 'Markets',
    text: t('Markets'),
    children: [
      {
        path: ':marketId',
        element: <Detail />,
      },
    ],
    icon: 'trade',
    isNavItem: true,
  },
];
