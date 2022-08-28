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
          'w-full p-4 md:border-r border-black dark:border-white',
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
                'block mb-2 px-2',
                'text-lg hover:bg-vega-pink dark:hover:bg-vega-yellow hover:text-white dark:hover:text-black',
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
