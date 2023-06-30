import type { ReactNode } from 'react';
import { createContext } from 'react';

export type NavigationProps = {
  /**
   * The display name of the dApp, e.g. "Console", "Explorer"
   */
  appName?: string;
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

export type NavigationElementProps = {
  hide?: NavigationBreakpoint[] | true;
  hideInDrawer?: boolean;
};

export const NavigationContext = createContext<{
  theme: NavigationProps['theme'];
}>({ theme: 'system' });

export const setSizeVariantClasses = (
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
