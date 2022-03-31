import { NavLink } from 'react-router-dom';
import routerConfig from '../../routes/router-config';

export const Nav = () => {
  return (
    <nav className="border-r-1 p-20 col-start-1 col-end-1 row-start-2 row-end-3 overflow-hidden">
      {routerConfig.map((r) => (
        <NavLink
          key={r.name}
          to={r.path}
          className={({ isActive }) =>
            `text-h5 block mb-8 px-8 hover:bg-vega-pink dark:hover:bg-vega-yellow hover:text-white dark:hover:text-black ${
              isActive &&
              'bg-vega-pink dark:bg-vega-yellow text-white dark:text-black'
            }`
          }
        >
          {r.text}
        </NavLink>
      ))}
    </nav>
  );
};
