import { useRouter } from 'next/router';
import { Vega } from '../icons/vega';
import Link from 'next/link';
import { AnchorButton } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import classNames from 'classnames';

export const Navbar = () => {
  return (
    <nav className="flex items-center">
      <Link href="/" passHref={true}>
        <a className="px-[26px]">
          <Vega className="fill-black dark:fill-white" />
        </a>
      </Link>
      {[
        { name: t('Trading'), path: '/markets' },
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
      'text-black dark:text-white': !isActive,
    }
  );
  return (
    <Link data-testid={testId} href={path} passHref={true}>
      <a className={linkClasses}>{name}</a>
    </Link>
  );
};
