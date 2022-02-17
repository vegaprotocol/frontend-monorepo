import styles from './navbar.module.scss';
import Link from 'next/link';

export const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      {[
        { name: 'Portfolio', path: '/portfolio' },
        { name: 'Markets', path: '/markets' },
      ].map((route) => (
        <Link href={route.path} key={route.path}>
          {route.name}
        </Link>
      ))}
    </nav>
  );
};
