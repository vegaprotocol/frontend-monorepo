import classNames from 'classnames';
import type { ComponentProps, ReactNode } from 'react';
import { useLayoutEffect } from 'react';
import { useContext } from 'react';
import { useRef } from 'react';
import { VegaLogo } from '../vega-logo';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { VegaIcon, VegaIconNames } from '../icon';
import { Drawer } from '../drawer';
import { NavLink } from 'react-router-dom';
import type {
  NavigationElementProps,
  NavigationProps,
} from './navigation-utils';
import { setSizeVariantClasses } from './navigation-utils';
import { NavigationBreakpoint, NavigationContext } from './navigation-utils';
import {
  NavigationDrawerTrigger,
  NavigationDrawerContext,
  useNavigationDrawer,
  NavigationDrawerContent,
} from './navigation-drawer';

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

const determineIfHidden = ({ hide, hideInDrawer }: NavigationElementProps) => [
  {
    '[.nav-size-full_.navbar_&]:hidden':
      Array.isArray(hide) && hide?.includes(NavigationBreakpoint.Full),
    '[.nav-size-narrow_.navbar_&]:hidden':
      Array.isArray(hide) && hide?.includes(NavigationBreakpoint.Narrow),
    '[.nav-size-small_.navbar_&]:hidden':
      Array.isArray(hide) && hide?.includes(NavigationBreakpoint.Small),
    '[.drawer-content_&]:hidden': hideInDrawer,
  },
];

const Spacer = () => <div className="w-full" aria-hidden="true"></div>;

export const NavigationItem = ({
  children,
  className,
  hide,
  hideInDrawer,
  ...props
}: ComponentProps<typeof NavigationMenu.Item> & NavigationElementProps) => {
  const insideDrawer = useContext(NavigationDrawerContext);
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
}: ComponentProps<typeof NavigationMenu.List> & NavigationElementProps) => {
  const insideDrawer = useContext(NavigationDrawerContext);
  if (!insideDrawer && hide === true) {
    return null;
  }
  return (
    <NavigationMenu.List
      className={classNames(
        'flex gap-4 items-center',
        '[.navigation-content_&]:flex-col [.navigation-content_&]:items-start',
        '[.drawer-content_&]:flex-col [.drawer-content_&]:items-start [.drawer-content_&]:gap-6 [.drawer-content_&]:mt-2',
        '[.drawer-content_.navigation-content_&]:mt-6',
        determineIfHidden({ hide, hideInDrawer }),
        className
      )}
      {...props}
    >
      {children}
    </NavigationMenu.List>
  );
};
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
  const insideDrawer = useContext(NavigationDrawerContext);
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
      <span className="flex items-center group-data-open/drawer:hidden">
        <VegaIcon name={VegaIconNames.ARROW_DOWN} />
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
  const insideDrawer = useContext(NavigationDrawerContext);

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
          'p-6 mt-1 min-w-[290px]',
          'text-vega-light-300 dark:text-vega-dark-300',
          'border rounded border-vega-light-200 dark:border-vega-dark-200',
          'text-vega-light-300 dark:text-vega-light-300',
          {
            'bg-vega-light-100 dark:bg-vega-dark-100':
              theme === 'system' || theme === 'yellow',
            'bg-vega-light-100': theme === 'light',
            'bg-vega-dark-100': theme === 'dark',
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
}: ComponentProps<typeof NavLink>) => {
  const { theme } = useContext(NavigationContext);
  const setDrawerOpen = useNavigationDrawer((state) => state.setDrawerOpen);
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
              {children as ReactNode}
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
    onResize?.(currentWidth, target);

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

  const { drawerOpen, setDrawerOpen } = useNavigationDrawer((state) => ({
    drawerOpen: state.drawerOpen,
    setDrawerOpen: state.setDrawerOpen,
  }));

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
            'flex gap-4 h-12 items-center font-alpha text-lg',
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
              onChange={(isOpen) => setDrawerOpen(isOpen)}
              trigger={<NavigationDrawerTrigger theme={theme} />}
              container={actionsRef.current}
            >
              <NavigationDrawerContent
                theme={theme}
                style={{
                  paddingTop: `${
                    navigationRef?.current?.getBoundingClientRect().bottom || 0
                  }px`,
                }}
              >
                {children}
              </NavigationDrawerContent>
            </Drawer>
          </div>
        )}
      </NavigationMenu.Root>
    </NavigationContext.Provider>
  );
};
