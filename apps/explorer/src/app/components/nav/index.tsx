import { NavLink } from 'react-router-dom';
import routerConfig from '../../routes/router-config';

export const Nav = () => {
  return (
    <nav>
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
          {r.name}
        </NavLink>
      ))}
    </nav>
  );
};
