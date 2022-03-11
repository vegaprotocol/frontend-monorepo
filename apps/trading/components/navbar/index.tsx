import { useRouter } from 'next/router';
import { Vega } from '../icons/vega';
import Link from 'next/link';
import { AnchorButton } from '@vegaprotocol/ui-toolkit';

export const Navbar = () => {
  return (
    <nav className="flex items-center">
      <Link href="/" passHref={true}>
        <a className="px-[26px]">
          <Vega className="fill-black dark:fill-white" />
        </a>
      </Link>
      {[
        { name: 'Trading', path: '/', exact: true },
        { name: 'Portfolio', path: '/portfolio' },
        { name: 'Markets', path: '/markets' },
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
      variant={isActive ? 'accent' : 'inline'}
      className="px-16 py-20 h-[38px] text-h4 uppercase border-0"
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
