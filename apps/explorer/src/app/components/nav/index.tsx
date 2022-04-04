import { NavLink } from 'react-router-dom';
import routerConfig from '../../routes/router-config';

interface NavProps {
  menuOpen: boolean;
}

export const Nav = ({ menuOpen }: NavProps) => {
  return (
    <nav className="relative">
      <div
        className={`${
          menuOpen ? 'right-0 h-[100vh]' : 'right-[200vw] h-full'
        } transition-[right] absolute top-0 w-full md:static md:border-r-1 bg-white dark:bg-black p-20`}
      >
        {routerConfig.map((r) => (
          <NavLink
            key={r.name}
            to={r.path}
            className={({ isActive }) =>
              `text-h5 block mb-8 px-8 hover:bg-vega-yellow hover:text-black ${
                isActive && 'bg-vega-yellow text-black'
              }`
            }
          >
            {r.text}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
