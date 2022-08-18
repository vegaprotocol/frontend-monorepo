import classNames from 'classnames';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { NetworkSwitcher } from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/react-helpers';
import { Vega } from '../icons/vega';
import { useGlobalStore } from '../../stores/global';

export const Navbar = () => {
  const { marketId } = useGlobalStore();
  const tradingPath = marketId ? `/markets/${marketId}` : '/';
  return (
    <nav className="flex items-center">
      <div className="flex items-center h-full">
        <Link href="/" passHref={true}>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a className="px-[26px]">
            <Vega className="fill-white" />
          </a>
        </Link>
        <NetworkSwitcher />
      </div>
      {[
        {
          name: t('Trading'),
          path: tradingPath,
          exact: false,
        },
        { name: t('Portfolio'), path: '/portfolio' },
      ].map((route) => (
        <NavLink key={route.path} {...route} />
      ))}
    </nav>
  );
};

interface NavLinkProps {
  name: string;
  path: string;
  exact?: boolean;
  testId?: string;
}

const NavLink = ({ name, path, exact, testId = name }: NavLinkProps) => {
  const router = useRouter();
  const isActive =
    router.asPath === path || (!exact && router.asPath.startsWith(path));
  const linkClasses = classNames(
    'px-16 py-6 border-0 self-end',
    'uppercase xs:text-ui sm:text-body-large md:text-h5 lg:text-h4',
    {
      'bg-vega-pink dark:bg-vega-yellow text-white dark:text-black': isActive,
      'text-white': !isActive,
    }
  );
  return (
    <Link data-testid={testId} href={path} passHref={true}>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a className={linkClasses}>{name}</a>
    </Link>
  );
};
