import { cn } from '../../utils/cn';
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
    className={cn('stroke-[1px] transition-transform', className)}
    width="16"
    height="16"
    viewBox="0 0 16 16"
  >
    <line
      x1={0.5}
      x2={15.5}
      y1={3.5}
      y2={3.5}
      className={cn('transition-transform duration-75', {
        'origin-[8px_3.5px] translate-y-[4px] rotate-45': variant === 'close',
      })}
    />
    <line
      x1={0.5}
      x2={15.5}
      y1={11.5}
      y2={11.5}
      className={cn('transition-transform duration-75', {
        'origin-[8px_11.5px] translate-y-[-4px] rotate-[-45deg]':
          variant === 'close',
      })}
    />
  </svg>
);

export const NavigationDrawerTrigger = forwardRef<
  HTMLButtonElement,
  HTMLAttributes<HTMLButtonElement>
>((_, ref) => {
  const { drawerOpen, setDrawerOpen } = useNavigationDrawer((state) => ({
    drawerOpen: state.drawerOpen,
    setDrawerOpen: state.setDrawerOpen,
  }));

  return (
    <button
      data-testid="button-menu-drawer"
      ref={ref}
      className={cn(
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
        className="stroke-black dark:stroke-white"
        variant={drawerOpen ? 'close' : 'burger'}
      />
    </button>
  );
});

export const NavigationDrawerContent = ({
  children,
  style,
}: { style?: CSSProperties } & Pick<NavigationProps, 'children'>) => {
  return (
    <NavigationDrawerContext.Provider value={true}>
      <div
        className={cn(
          'drawer-content',
          'relative h-full overflow-auto border-l',
          'px-4 pb-8',
          // text
          'text-gs-300',
          // border
          'border-l-gs-200',
          // background
          'bg-gs-900'
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
