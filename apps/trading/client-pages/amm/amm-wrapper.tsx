import type { ReactNode } from 'react';
import { useSuspenseAssets, useSuspenseMarkets } from '@vegaprotocol/rest';
import { ErrorBoundary } from '../../components/error-boundary';

export const AmmWrapper = ({ children }: { children: ReactNode }) => {
  useSuspenseAssets();
  useSuspenseMarkets();

  return <ErrorBoundary feature="amm">{children}</ErrorBoundary>;
};
