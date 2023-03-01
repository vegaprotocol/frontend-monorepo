import classNames from 'classnames';
import { useVegaWallet } from '@vegaprotocol/wallet';
import type { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}
export const AppLayout = ({ children }: AppLayoutProps) => {
  const { isReadOnly } = useVegaWallet();
  const AppLayoutClasses = classNames(
    'app w-full max-w-[1500px] mx-auto grid min-h-full',
    'border-neutral-700 lg:border-l lg:border-r',
    'lg:text-body-large',
    {
      'grid-rows-[repeat(2,min-content)_1fr_min-content]': !isReadOnly,
      'grid-rows-[repeat(3,min-content)_1fr_min-content]': isReadOnly,
    }
  );

  return <div className={AppLayoutClasses}>{children}</div>;
};
