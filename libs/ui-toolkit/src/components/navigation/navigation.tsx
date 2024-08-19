import { cn } from '../../utils/cn';
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
import { NavigationBreakpoint } from './navigation-utils';
import {
  NavigationDrawerTrigger,
  NavigationDrawerContext,
  useNavigationDrawer,
  NavigationDrawerContent,
} from './navigation-drawer';

const Logo = ({
  appName,
  homeLink,
}: Pick<NavigationProps, 'appName' | 'homeLink'>) => {
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
          className={cn(
            'group-[.nav-size-small]:text-sm',
            'font-alt calt lowercase text-xl tracking-[1px] whitespace-nowrap leading-1',
            'border-l border-l-gs-200 pl-4'
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
      className={cn(
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
      className={cn(
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
  const insideDrawer = useContext(NavigationDrawerContext);
  return (
    <NavigationMenu.Trigger
      className={cn(
        'h-12 [.drawer-content_&]:h-min flex items-center relative gap-2',
        {
          'text-gs-50': isActive,
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
        className={cn(
          'absolute bottom-0 left-0 w-full h-[2px] [.navigation-content_&]:hidden [.drawer-content_&]:hidden',
          'bg-vega-yellow-550 dark:bg-vega-yellow-500',
          { hidden: !isActive }
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
  const insideDrawer = useContext(NavigationDrawerContext);

  const content = (
    <NavigationMenu.Content
      onPointerLeave={(e) => e.preventDefault()} // disables hover
      asChild
      {...props}
    >
      <div
        className={cn(
          'navigation-content',
          'absolute z-20 top-12 w-max',
          'p-6 mt-1 min-w-[290px]',
          'border rounded border-gs-300 dark:border-gs-700',
          'bg-surface-1'
        )}
      >
        {children}
      </div>
    </NavigationMenu.Content>
  );

  const list = (
    <div className={cn('navigation-content', 'border-none pl-4')}>
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
        className={cn(
          'h-12 [.navigation-content_&]:h-min [.drawer-content_&]:h-min flex items-center relative'
        )}
        {...props}
      >
        {({ isActive }) => (
          <>
            <span
              className={cn({
                'text-surface-0-fg': isActive,
              })}
            >
              {children as ReactNode}
            </span>
            <div
              aria-hidden="true"
              className={cn(
                'absolute bottom-0 left-0 w-full h-[2px] [.navigation-content_&]:hidden [.drawer-content_&]:hidden',
                'bg-vega-yellow-550 dark:bg-vega-yellow-500',
                { hidden: !isActive }
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
    <NavigationMenu.Root
      ref={navigationRef}
      id="navigation"
      className={cn(
        'h-12',
        'group flex gap-4 items-center',
        'border-b px-3 relative border-gs-300 dark:border-gs-700'
      )}
      data-testid="navigation"
    >
      <Logo appName={appName} homeLink={homeLink} />
      <div
        className={cn(
          'navbar',
          'flex gap-4 h-12 items-center text-lg text-surface-0-fg-muted'
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
            trigger={<NavigationDrawerTrigger />}
            container={actionsRef.current}
          >
            <NavigationDrawerContent
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
  );
};
