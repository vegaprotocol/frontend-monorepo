import { useRouter } from 'next/router';
import { Vega } from '../icons/vega';
import Link from 'next/link';
import { AnchorButton } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';

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
}

const NavLink = ({ name, path, exact }: NavLinkProps) => {
  const router = useRouter();
  const isActive =
    router.asPath === path || (!exact && router.asPath.startsWith(path));
  return (
    <AnchorButton
      variant={isActive ? 'accent' : 'inline-link'}
      className="px-16 py-6 h-[38px] uppercase border-0 self-end xs:text-ui sm:text-body-large md:text-h5 lg:text-h4"
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
