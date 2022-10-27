import classNames from 'classnames';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { NetworkSwitcher, useEnvironment } from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/react-helpers';
import { useGlobalStore } from '../../stores/global';
import { VegaWalletConnectButton } from '../vega-wallet-connect-button';
import { ThemeSwitcher } from '@vegaprotocol/ui-toolkit';
import { Vega } from '../icons/vega';
import type { HTMLAttributeAnchorTarget } from 'react';
import { useEffect, useState } from 'react';

interface NavbarProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Navbar = ({ theme, toggleTheme }: NavbarProps) => {
  const { VEGA_TOKEN_URL } = useEnvironment();
  const { marketId } = useGlobalStore((store) => ({
    marketId: store.marketId,
  }));
  const [tradingPath, setTradingPath] = useState('/markets');

  useEffect(() => {
    if (marketId) {
      setTradingPath(`/markets/${marketId}`);
    }
  }, [marketId]);

  return (
    <div className="dark px-4 flex items-stretch border-b border-default bg-black text-white">
      <div className="flex gap-4 items-center h-full">
        <Link href="/" passHref={true}>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a>
            <Vega className="w-13" />
          </a>
        </Link>
        <NetworkSwitcher />
      </div>
      <nav className="flex items-center flex-1 px-2">
        <NavLink name={t('Trading')} path={tradingPath} />
        <NavLink name={t('Portfolio')} path="/portfolio" />
        <NavLink
          name={t('Governance')}
          path={`${VEGA_TOKEN_URL}/governance`}
          alignRight={true}
          target="_blank"
        />
      </nav>
      <div className="flex items-center gap-2 ml-auto">
        <VegaWalletConnectButton />
        <ThemeSwitcher theme={theme} onToggle={toggleTheme} />
      </div>
    </div>
  );
};

interface NavLinkProps {
  name: string;
  path: string;
  testId?: string;
  alignRight?: boolean;
  target?: HTMLAttributeAnchorTarget;
}

const NavLink = ({
  name,
  path,
  alignRight,
  target,
  testId = name,
}: NavLinkProps) => {
  const router = useRouter();
  const isActive = router.asPath?.includes(path);
  const linkClasses = classNames('mx-2 py-3 self-end relative', {
    'text-white cursor-default': isActive,
    'text-neutral-400 hover:text-neutral-300': !isActive,
    'ml-auto': alignRight,
  });
  return (
    <Link data-testid={testId} href={path} passHref={true}>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a className={linkClasses} target={target}>
        {name}
        {isActive && (
          <span className="absolute h-1 w-full bg-vega-yellow bottom-0 left-0" />
        )}
      </a>
    </Link>
  );
};
