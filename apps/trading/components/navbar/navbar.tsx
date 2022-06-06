import { useRouter } from 'next/router';
import { Vega } from '../icons/vega';
import Link from 'next/link';
import { AnchorButton } from '@vegaprotocol/ui-toolkit';
import { LocalStorage, t } from '@vegaprotocol/react-helpers';
import { useEffect, useState } from 'react';

export const Navbar = () => {
  const initNavItemsState = [
    {
      name: t('Portfolio'),
      path: '/portfolio',
      testId: 'portfolio-link',
      slug: '',
    },
  ];
  const [navItems, setNavItems] = useState(initNavItemsState);
  const marketId = LocalStorage.getItem('marketId') ?? '';

  useEffect(() => {
    setNavItems([
      {
        name: t('Trading'),
        path: '/markets',
        testId: 'markets-link',
        slug: marketId,
      },
      {
        name: t('Portfolio'),
        path: '/portfolio',
        testId: 'portfolio-link',
        slug: '',
      },
    ]);
  }, [marketId]);

  return (
    <nav className="flex items-center">
      <Link href="/" passHref={true}>
        <a className="px-[26px]">
          <Vega className="fill-black dark:fill-white" />
        </a>
      </Link>
      {navItems.map((route) => (
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
  slug?: string;
}

const NavLink = ({
  name,
  path,
  exact,
  testId = name,
  slug = '',
}: NavLinkProps) => {
  const router = useRouter();
  const isActive =
    router.asPath === path || (!exact && router.asPath.startsWith(path));
  const href = slug !== '' ? `${path}/${slug}` : path;
  return (
    <AnchorButton
      variant={isActive ? 'accent' : 'inline'}
      className="px-16 py-6 h-[38px] uppercase border-0 self-end xs:text-ui sm:text-body-large md:text-h5 lg:text-h4"
      data-testid={testId}
      href={href}
      onClick={(e) => {
        e.preventDefault();
        router.push(href);
      }}
    >
      {name}
    </AnchorButton>
  );
};
