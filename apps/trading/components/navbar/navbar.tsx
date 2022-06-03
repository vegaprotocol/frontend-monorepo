import { useRouter } from 'next/router';
import { Vega } from '../icons/vega';
import Link from 'next/link';
import { AnchorButton } from '@vegaprotocol/ui-toolkit';
import { LocalStorage, t } from '@vegaprotocol/react-helpers';

export const Navbar = () => {
  const lastSelectedMarketId = LocalStorage.getItem('marketId');
  return (
    <nav className="flex items-center">
      <Link href="/" passHref={true}>
        <a className="px-[26px]">
          <Vega className="fill-black dark:fill-white" />
        </a>
      </Link>
      {[
        {
          name: t('Trading'),
          path: lastSelectedMarketId
            ? `/markets/${lastSelectedMarketId}`
            : '/markets',
          testId: 'markets-link',
        },
        { name: t('Portfolio'), path: '/portfolio', testId: 'portfolio-link' },
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
  return (
    <AnchorButton
      variant={isActive ? 'accent' : 'inline'}
      className="px-16 py-6 h-[38px] uppercase border-0 self-end xs:text-ui sm:text-body-large md:text-h5 lg:text-h4"
      data-testid={testId}
      href={path}
      onClick={(e) => {
        e.preventDefault();
        router.push(path);
      }}
    >
      {name}
    </AnchorButton>
  );
};
