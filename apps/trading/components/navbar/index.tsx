import { useRouter } from 'next/router';
import classNames from 'classnames';

export const Navbar = () => {
  const navClasses = classNames('border-black border-b');
  return (
    <nav className={navClasses}>
      {[
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
}

const NavLink = ({ name, path }: NavLinkProps) => {
  const router = useRouter();
  const className = classNames('inline-block', 'p-8', {
    'text-vega-pink': router.asPath === path,
  });

  return (
    <a
      className={className}
      href={path}
      onClick={(e) => {
        e.preventDefault();
        router.push(path);
      }}
    >
      {name}
    </a>
  );
};
