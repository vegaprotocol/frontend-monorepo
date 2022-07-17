import { NavLink } from 'react-router-dom';
import routerConfig from '../../routes/router-config';
import classnames from 'classnames';

interface NavProps {
  menuOpen: boolean;
}

export const Nav = ({ menuOpen }: NavProps) => {
  return (
    <nav className="relative">
      <div
        className={classnames(
          'absolute top-0 z-50 md:static',
          'w-full p-20 md:border-r-1',
          'bg-white dark:bg-black',
          'transition-[right]',
          {
            'right-0 h-[100vh]': menuOpen,
            'right-[200vw] h-full': !menuOpen,
          }
        )}
      >
        {routerConfig.map((r) => (
          <NavLink
            key={r.name}
            to={r.path}
            className={({ isActive }) =>
              classnames(
                'block mb-8 px-8',
                'text-h5 hover:bg-vega-pink dark:hover:bg-vega-yellow hover:text-white dark:hover:text-black',
                {
                  'bg-vega-pink text-white dark:bg-vega-yellow dark:text-black':
                    isActive,
                }
              )
            }
          >
            {r.text}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
