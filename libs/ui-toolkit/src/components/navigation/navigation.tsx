import classNames from 'classnames';
import type { ComponentProps, ReactNode } from 'react';
import { useLayoutEffect } from 'react';
import { createContext } from 'react';
import { useContext } from 'react';
import { useRef } from 'react';
import { VegaLogo } from '../vega-logo';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { Icon } from '../icon';
import { Drawer, DrawerContext, useDrawer } from '../drawer';
import type { Link } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

type NavigationProps = {
  /**
   * The display name of the dApp, e.g. "Console", "Explorer"
   */
  appName: string;
  /**
   * URL pointing to the home page.
   */
  homeLink?: string;
  /**
   * The theme of the navigation.
   * @default "system"
   */
  theme: 'system' | 'light' | 'dark' | 'yellow';
  /**
   * The navigation items (links, buttons, dropdowns, etc.)
   */
  children?: ReactNode;
  /**
   * The navigation actions (e.g. theme switcher, wallet connector)
   */
  actions?: ReactNode;
  /**
   * Size variants breakpoints
   */
  breakpoints?: [number, number];
  fullWidth?: boolean;
  onResize?: (width: number, navigationElement: HTMLElement) => void;
};

export enum NavigationBreakpoint {
  /**
   * Full width navigation
   * `width > breakpoints[1]`
   */
  Full = 'nav-size-full',
  /**
   * Narrow variant
   * `width > breakpoints[0] && width <= breakpoints[1]`
   */
  Narrow = 'nav-size-narrow',
  /**
   * Small variant
   * `width <= breakpoints[0]`
   */
  Small = 'nav-size-small',
}
type NavigationElementProps = {
  hide?: NavigationBreakpoint[];
  hideInDrawer?: boolean;
};

const determineIfHidden = ({ hide, hideInDrawer }: NavigationElementProps) => [
  {
    '[.nav-size-full_.navbar_&]:hidden': hide?.includes(
      NavigationBreakpoint.Full
    ),
    '[.nav-size-narrow_.navbar_&]:hidden': hide?.includes(
      NavigationBreakpoint.Narrow
    ),
    '[.nav-size-small_.navbar_&]:hidden': hide?.includes(
      NavigationBreakpoint.Small
    ),
    '[.drawer-content_&]:hidden': hideInDrawer,
  },
];

const Logo = ({
  appName,
  homeLink,
}: Pick<NavigationProps, 'theme' | 'appName' | 'homeLink'>) => {
  const { theme } = useContext(NavigationContext);
  return (
    <div className="flex h-full gap-4 items-center">
      {homeLink ? (
        <NavLink to={homeLink}>
          <VegaLogo className="h-4 group-[.nav-size-small]:h-3" />
        </NavLink>
      ) : (
        <VegaLogo className="h-4 group-[.nav-size-small]:h-3" />
      )}

      {appName && (
        <span
          data-testid="nav-app-name"
          className={classNames(
            'group-[.nav-size-small]:text-sm',
            'font-alpha calt lowercase text-xl tracking-[1px] whitespace-nowrap leading-1',
            'border-l pl-4',
            {
              'border-l-vega-light-200 dark:border-l-vega-dark-200':
                theme === 'system',
              'border-l-vega-light-200': theme === 'light',
              'border-l-vega-dark-200': theme === 'dark' || theme === 'yellow',
            }
          )}
        >
          {appName}
        </span>
      )}
    </div>
  );
};

const Spacer = () => <div className="w-full" aria-hidden="true"></div>;

export const NavigationItem = ({
  children,
  className,
  hide,
  hideInDrawer,
  ...props
}: ComponentProps<typeof NavigationMenu.Item> & NavigationElementProps) => {
  const insideDrawer = useContext(DrawerContext);
  return (
    <NavigationMenu.Item
      className={classNames(
        !insideDrawer && ['h-12 [.navigation-content_&]:h-8 flex items-center'],
        determineIfHidden({ hide, hideInDrawer }),
        className
      )}
      {...props}
    >
      {children}
    </NavigationMenu.Item>
  );
};
export const NavigationList = ({
  children,
  className,
  hide,
  hideInDrawer,
  ...props
}: ComponentProps<typeof NavigationMenu.List> & NavigationElementProps) => (
  <NavigationMenu.List
    className={classNames(
      'flex gap-4 items-center',
      '[.navigation-content_&]:flex-col [.navigation-content_&]:items-start [.navigation-content_&]:mt-6',
      '[.drawer-content_&]:flex-col [.drawer-content_&]:items-start [.drawer-content_&]:gap-6 [.drawer-content_&]:mt-2',
      determineIfHidden({ hide, hideInDrawer }),
      className
    )}
    {...props}
  >
    {children}
  </NavigationMenu.List>
);
export const NavigationTrigger = ({
  children,
  className,
  isActive = false,
  hide,
  hideInDrawer,
  ...props
}: ComponentProps<typeof NavigationMenu.Trigger> & {
  isActive?: boolean;
} & NavigationElementProps) => {
  const { theme } = useContext(NavigationContext);
  const insideDrawer = useContext(DrawerContext);
  return (
    <NavigationMenu.Trigger
      className={classNames(
        'h-12 [.drawer-content_&]:h-min flex items-center relative gap-2',
        {
          'text-black dark:text-white': isActive && theme === 'system',
          'text-black': isActive && theme === 'light',
          'text-white': isActive && theme === 'dark',
          'text-black dark:[.drawer-content_&]:text-white':
            isActive && theme === 'yellow',
        },
        determineIfHidden({ hide, hideInDrawer }),
        className
      )}
      onPointerMove={(e) => e.preventDefault()} // disables hover
      onPointerLeave={(e) => e.preventDefault()} // disables hover
      disabled={insideDrawer}
      {...props}
    >
      <span>{children}</span>
      <span className="rotate-90 group-data-open/drawer:hidden">
        <Icon name="arrow-right" size={3} />
      </span>
      <div
        aria-hidden="true"
        className={classNames(
          'absolute bottom-0 left-0 w-full h-[2px] [.navigation-content_&]:hidden [.drawer-content_&]:hidden',
          { hidden: !isActive },
          {
            'bg-vega-yellow-550 dark:bg-vega-yellow-500': theme === 'system',
            'bg-vega-yellow-550': theme === 'light',
            'bg-vega-yellow-500': theme === 'dark',
            'bg-black': theme === 'yellow',
          }
        )}
      ></div>
    </NavigationMenu.Trigger>
  );
};
export const NavigationContent = ({
  children,
  className,
  ...props
}: ComponentProps<typeof NavigationMenu.Content>) => {
  const { theme } = useContext(NavigationContext);
  const insideDrawer = useContext(DrawerContext);

  const content = (
    <NavigationMenu.Content
      onPointerLeave={(e) => e.preventDefault()} // disables hover
      asChild
      {...props}
    >
      <div
        className={classNames(
          'navigation-content',
          'absolute z-20 top-12 w-max',
          'p-2 mt-1',
          'text-vega-light-300 dark:text-vega-dark-300',

          'border rounded border-vega-light-200 dark:border-vega-dark-200',
          'shadow-[8px_8px_16px_0_rgba(0,0,0,0.4)]',
          {
            'bg-white dark:bg-black': theme === 'system' || theme === 'yellow',
            'bg-white': theme === 'light',
            'bg-black': theme === 'dark',
          }
        )}
      >
        {children}
      </div>
    </NavigationMenu.Content>
  );

  const list = (
    <div className={classNames('navigation-content', 'border-none pl-4')}>
      {children}
    </div>
  );

  return insideDrawer ? list : content;
};

export const NavigationLink = ({
  children,
  to,
  ...props
}: ComponentProps<typeof Link>) => {
  const { theme } = useContext(NavigationContext);
  const setDrawerOpen = useDrawer((state) => state.setDrawerOpen);
  return (
    <NavigationMenu.Link
      asChild
      onClick={() => {
        setDrawerOpen(false);
      }}
    >
      <NavLink
        to={to}
        className={classNames(
          'h-12 [.navigation-content_&]:h-min [.drawer-content_&]:h-min flex items-center relative'
        )}
        {...props}
      >
        {({ isActive }) => (
          <>
            <span
              className={classNames({
                'text-black dark:text-white': isActive && theme === 'system',
                'text-black': isActive && theme === 'light',
                'text-white': isActive && theme === 'dark',
                'text-black dark:[.navigation-content_&]:text-white dark:[.drawer-content_&]:text-white':
                  isActive && theme === 'yellow',
              })}
            >
              {children}
            </span>
            <div
              aria-hidden="true"
              className={classNames(
                'absolute bottom-0 left-0 w-full h-[2px] [.navigation-content_&]:hidden [.drawer-content_&]:hidden',
                { hidden: !isActive },
                {
                  'bg-vega-yellow-550 dark:bg-vega-yellow-500':
                    theme === 'system',
                  'bg-vega-yellow-550': theme === 'light',
                  'bg-vega-yellow-500': theme === 'dark',
                  'bg-black': theme === 'yellow',
                }
              )}
            ></div>
          </>
        )}
      </NavLink>
    </NavigationMenu.Link>
  );
};

export const NavigationContext = createContext<{
  theme: NavigationProps['theme'];
}>({ theme: 'system' });

const setSizeVariantClasses = (
  breakpoints: [number, number],
  currentWidth: number,
  target: HTMLElement
) => {
  if (
    currentWidth <= breakpoints[0] &&
    !target.classList.contains(NavigationBreakpoint.Small)
  ) {
    target.classList.remove(
      NavigationBreakpoint.Full,
      NavigationBreakpoint.Narrow
    );
    target.classList.add(NavigationBreakpoint.Small);
  }
  if (
    currentWidth > breakpoints[0] &&
    currentWidth <= breakpoints[1] &&
    !target.classList.contains(NavigationBreakpoint.Narrow)
  ) {
    target.classList.remove(
      NavigationBreakpoint.Full,
      NavigationBreakpoint.Small
    );
    target.classList.add(NavigationBreakpoint.Narrow);
  }
  if (
    currentWidth > breakpoints[1] &&
    !target.classList.contains(NavigationBreakpoint.Full)
  ) {
    target.classList.remove(
      NavigationBreakpoint.Narrow,
      NavigationBreakpoint.Small
    );
    target.classList.add(NavigationBreakpoint.Full);
  }
};

export const Navigation = ({
  appName,
  homeLink = '/',
  children,
  actions,
  theme = 'system',
  breakpoints = [478, 1000],
  onResize,
}: NavigationProps) => {
  const navigationRef = useRef<HTMLElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!navigationRef.current) return;
    const target = navigationRef.current;
    const currentWidth = Math.min(
      target.getBoundingClientRect().width,
      window.innerWidth
    );
    setSizeVariantClasses(breakpoints, currentWidth, target);

    const handler = () => {
      const currentWidth = Math.min(
        target.getBoundingClientRect().width,
        window.innerWidth
      );
      setSizeVariantClasses(breakpoints, currentWidth, target);
      onResize?.(currentWidth, target);
    };
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('resize', handler);
    };
  }, [breakpoints, onResize]);

  const [drawerOpen, setDrawerOpen] = useDrawer((state) => [
    state.drawerOpen,
    state.setDrawerOpen,
  ]);

  const drawerTrigger = (
    <button
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
      <svg
        className={classNames('stroke-[1px] transition-transform', {
          'stroke-black dark:stroke-white': theme === 'system',
          'stroke-black': theme === 'light' || theme === 'yellow',
          'stroke-white': theme === 'dark',
          'dark:stroke-white': drawerOpen && theme === 'yellow',
        })}
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
            'rotate-45 translate-y-[4px] origin-[8px_3.5px]': drawerOpen,
          })}
        />
        <line
          x1={0.5}
          x2={15.5}
          y1={11.5}
          y2={11.5}
          className={classNames('transition-transform duration-75', {
            'rotate-[-45deg] translate-y-[-4px] origin-[8px_11.5px]':
              drawerOpen,
          })}
        />
      </svg>
    </button>
  );

  const drawerContent = (
    <DrawerContext.Provider value={true}>
      <div
        className={classNames(
          'drawer-content',
          'border-l h-full relative overflow-auto',
          'px-4 pb-8 font-alpha',
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
        style={{
          paddingTop: `${
            navigationRef.current?.getBoundingClientRect().bottom
          }px`,
        }}
      >
        <div className="flex flex-col gap-2 pr-10 text-lg">{children}</div>
      </div>
    </DrawerContext.Provider>
  );

  return (
    <NavigationContext.Provider value={{ theme }}>
      <NavigationMenu.Root
        ref={navigationRef}
        id="navigation"
        className={classNames(
          'h-12',
          'group flex gap-4 items-center',
          'border-b px-3 relative',
          // text
          {
            'text-black dark:text-white': theme === 'system',
            'text-black': theme === 'light' || theme === 'yellow',
            'text-white': theme === 'dark',
          },
          // border
          {
            'border-b-vega-light-200 dark:border-b-vega-dark-200':
              theme === 'system',
            'border-b-vega-light-200': theme === 'light',
            'border-b-vega-dark-200': theme === 'dark',
            'border-b-black': theme === 'yellow',
          },
          // background
          {
            'bg-white dark:bg-black': theme === 'system',
            'bg-white': theme === 'light',
            'bg-black': theme === 'dark',
            'bg-vega-yellow-500': theme === 'yellow',
          }
        )}
        data-testid="navigation"
      >
        <Logo appName={appName} theme={theme} homeLink={homeLink} />
        <div
          className={classNames(
            'navbar',
            'flex gap-4 h-12 items-center font-alpha text-lg calt',
            {
              'text-vega-light-300 dark:text-vega-dark-300': theme === 'system',
              'text-vega-light-300': theme === 'light',
              'text-vega-dark-300': theme === 'dark',
              'text-vega-dark-200': theme === 'yellow',
            }
          )}
        >
          {children}
        </div>
        <Spacer />
        {(actions || children) && (
          <div ref={actionsRef} className="flex gap-2 items-center">
            {actions}
            <Drawer
              open={drawerOpen}
              onChange={setDrawerOpen}
              trigger={drawerTrigger}
              container={actionsRef.current}
            >
              {drawerContent}
            </Drawer>
          </div>
        )}
      </NavigationMenu.Root>
    </NavigationContext.Provider>
  );
};
