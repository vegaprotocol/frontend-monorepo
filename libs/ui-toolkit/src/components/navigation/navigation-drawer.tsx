import classNames from 'classnames';
import { type CSSProperties, type HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { createContext } from 'react';
import { create } from 'zustand';
import { type NavigationProps } from './navigation-utils';

export const NavigationDrawerContext = createContext<true | undefined>(
  undefined
);

type NavigationDrawerStore = {
  drawerOpen: boolean;
  setDrawerOpen: (isOpen: boolean) => void;
};
export const useNavigationDrawer = create<NavigationDrawerStore>((set) => ({
  drawerOpen: false,
  setDrawerOpen: (isOpen) => {
    set({ drawerOpen: isOpen });
  },
}));

export const BurgerIcon = ({
  variant = 'burger',
  className,
}: { variant?: 'burger' | 'close' } & HTMLAttributes<SVGAElement>) => (
  <svg
    className={classNames('stroke-[1px] transition-transform', className)}
    width="16"
    height="16"
    viewBox="0 0 16 16"
  >
    <line
      x1={0.5}
      x2={15.5}
      y1={3.5}
      y2={3.5}
      className={classNames('transition-transform duration-75', {
        'origin-[8px_3.5px] translate-y-[4px] rotate-45': variant === 'close',
      })}
    />
    <line
      x1={0.5}
      x2={15.5}
      y1={11.5}
      y2={11.5}
      className={classNames('transition-transform duration-75', {
        'origin-[8px_11.5px] translate-y-[-4px] rotate-[-45deg]':
          variant === 'close',
      })}
    />
  </svg>
);

export const NavigationDrawerTrigger = forwardRef<
  HTMLButtonElement,
  Pick<NavigationProps, 'theme'>
>(({ theme }, ref) => {
  const { drawerOpen, setDrawerOpen } = useNavigationDrawer((state) => ({
    drawerOpen: state.drawerOpen,
    setDrawerOpen: state.setDrawerOpen,
  }));

  return (
    <button
      data-testid="button-menu-drawer"
      ref={ref}
      className={classNames(
        'px-2',
        `hidden group-[.nav-size-narrow]:block group-[.nav-size-small]:block`,
        {
          'z-[21]': drawerOpen,
        }
      )}
      onClick={() => {
        setDrawerOpen(!drawerOpen);
      }}
    >
      <BurgerIcon
        className={classNames({
          'stroke-black dark:stroke-white': theme === 'system',
          'stroke-black': theme === 'light' || theme === 'yellow',
          'stroke-white': theme === 'dark',
          'dark:stroke-white': drawerOpen && theme === 'yellow',
        })}
        variant={drawerOpen ? 'close' : 'burger'}
      />
    </button>
  );
});

export const NavigationDrawerContent = ({
  theme,
  children,
  style,
}: { style?: CSSProperties } & Pick<NavigationProps, 'theme' | 'children'>) => {
  return (
    <NavigationDrawerContext.Provider value={true}>
      <div
        className={classNames(
          'drawer-content',
          'relative h-full overflow-auto border-l',
          'font-alpha px-4 pb-8',
          // text
          {
            'text-vega-light-300 dark:text-vega-dark-300':
              theme === 'system' || theme === 'yellow',
            'text-vega-light-300': theme === 'light',
            'text-vega-dark-300': theme === 'dark',
          },
          // border
          {
            'border-l-vega-light-200 dark:border-l-vega-dark-200':
              theme === 'system' || theme === 'yellow',
            'border-l-vega-light-200': theme === 'light',
            'border-l-vega-dark-200': theme === 'dark',
          },
          // background
          {
            'bg-white dark:bg-black': theme === 'system' || theme === 'yellow',
            'bg-white': theme === 'light',
            'bg-black': theme === 'dark',
          }
        )}
        style={style}
      >
        <div
          data-testid="menu-drawer"
          className="flex flex-col gap-2 pr-10 text-lg"
        >
          {children}
        </div>
      </div>
    </NavigationDrawerContext.Provider>
  );
};
