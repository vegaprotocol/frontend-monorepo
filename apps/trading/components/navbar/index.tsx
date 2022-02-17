import styles from './navbar.module.scss';
import { useRouter } from 'next/router';

export const Navbar = () => {
  return (
    <nav className={styles.navbar}>
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
  const color = router.asPath === path ? 'blue' : 'inherit';

  return (
    <a
      href={path}
      onClick={(e) => {
        e.preventDefault();
        router.push(path);
      }}
      style={{ color }}
    >
      {name}
    </a>
  );
};
