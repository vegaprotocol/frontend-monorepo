import { Outlet } from 'react-router-dom';

import { useWalletStore } from '@/stores/wallets';

export const WalletsRoot = () => {
  const { loading } = useWalletStore((store) => ({
    loading: store.loading,
  }));
  if (loading) return null;
  return <Outlet />;
};
