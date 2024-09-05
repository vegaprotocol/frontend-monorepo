import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { usePersistLocation } from '@/hooks/persist-location';

import { Auth } from './auth';
import { Settings } from './auth/settings/home';
import { TransactionsIndex } from './auth/transactions';
import { TransactionDetails } from './auth/transactions/details';
import { Transactions } from './auth/transactions/home';
import { WalletsRoot } from './auth/wallets';
import { Wallets } from './auth/wallets/home';
import { KeyDetails } from './auth/wallets/key-details';
import { Home } from './home';
import { Login } from './login';
import { CreatePassword } from './onboarding/create-password';
import { CreateWallet } from './onboarding/create-wallet';
import { ImportWallet } from './onboarding/import-wallet';
import { SaveMnemonic } from './onboarding/save-mnemonic';
import { FULL_ROUTES, ROUTES } from './route-names';
import { CreateDerivedWallet } from './onboarding/create-derived-wallet';

export const Routing = () => {
  usePersistLocation();
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index path={ROUTES.home} element={<Home />} />
        <Route path={ROUTES.auth} element={<Auth />}>
          <Route path={ROUTES.wallets} element={<WalletsRoot />}>
            <Route index element={<Wallets />} />
            <Route path={':id'} element={<KeyDetails />} />
          </Route>
          <Route path={ROUTES.settings} element={<Outlet />}>
            <Route index element={<Settings />} />
          </Route>
          <Route path={ROUTES.transactions} element={<TransactionsIndex />}>
            <Route index element={<Transactions />} />
            <Route path={':id'} element={<TransactionDetails />} />
          </Route>
        </Route>
        <Route path={ROUTES.onboarding} element={<Outlet />}>
          <Route index element={<Navigate to={FULL_ROUTES.createPassword} />} />
          <Route path={ROUTES.createPassword} element={<CreatePassword />} />
          <Route path={ROUTES.createWallet} element={<CreateWallet />} />
          <Route path={ROUTES.saveMnemonic} element={<SaveMnemonic />} />
          <Route path={ROUTES.importWallet} element={<ImportWallet />} />
          <Route
            path={ROUTES.createDerivedWallet}
            element={<CreateDerivedWallet />}
          />
        </Route>
        <Route path={ROUTES.login} element={<Login />} />
      </Route>
    </Routes>
  );
};
