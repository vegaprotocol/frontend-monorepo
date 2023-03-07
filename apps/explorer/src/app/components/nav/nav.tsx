import { NavLink, useLocation } from 'react-router-dom';
import type { Navigable } from '../../routes/router-config';
import routerConfig from '../../routes/router-config';
import classnames from 'classnames';
import { create } from 'zustand';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { Icon } from '@vegaprotocol/ui-toolkit';
import first from 'lodash/first';
import last from 'lodash/last';
import { BREAKPOINT_MD } from '../../config/breakpoints';

type NavStore = {
  open: boolean;
  toggle: () => void;
  hide: () => void;
};

export const useNavStore = create<NavStore>()((set, get) => ({
  open: false,
  toggle: () => set({ open: !get().open }),
  hide: () => set({ open: false }),
}));

const NavLinks = ({ links }: { links: Navigable[] }) => {
  const navLinks = links.map((r) => (
    <li key={r.name}>
      <NavLink
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
    </li>
  ));

  return <ul className="pr-8 md:pr-0">{navLinks}</ul>;
};

export const Nav = () => {
  const [open, hide] = useNavStore((state) => [state.open, state.hide]);
  const location = useLocation();

  const navRef = useRef<HTMLElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const focusable = useMemo(
    () =>
      navRef.current
        ? [
            ...(navRef.current.querySelectorAll(
              'a, button'
            ) as NodeListOf<HTMLElement>),
          ]
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navRef.current] // do not remove `navRef.current` from deps
  );

  const closeNav = useCallback(() => {
    hide();
    console.log(focusable);
    focusable.forEach((fe) =>
      fe.setAttribute(
        'tabindex',
        window.innerWidth > BREAKPOINT_MD ? '0' : '-1'
      )
    );
  }, [focusable, hide]);

  // close navigation when location changes
  useEffect(() => {
    closeNav();
  }, [closeNav, location]);

  useLayoutEffect(() => {
    if (open) {
      focusable.forEach((fe) => fe.setAttribute('tabindex', '0'));
    }

    document.body.style.overflow = open ? 'hidden' : '';
    const offset =
      document.querySelector('header')?.getBoundingClientRect().top || 0;
    if (navRef.current) {
      navRef.current.style.height = `calc(100vh - ${offset}px)`;
    }

    // focus current by default
    if (navRef.current && open) {
      (navRef.current.querySelector('a[aria-current]') as HTMLElement)?.focus();
    }

    const closeOnEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeNav();
      }
    };

    // tabbing loop
    const focusLast = (e: FocusEvent) => {
      e.preventDefault();
      const isNavElement =
        e.relatedTarget && navRef.current?.contains(e.relatedTarget as Node);
      if (!isNavElement && open) {
        last(focusable)?.focus();
      }
    };
    const focusFirst = (e: FocusEvent) => {
      e.preventDefault();
      const isNavElement =
        e.relatedTarget && navRef.current?.contains(e.relatedTarget as Node);
      if (!isNavElement && open) {
        first(focusable)?.focus();
      }
    };

    const resetOnDesktop = () => {
      focusable.forEach((fe) =>
        fe.setAttribute(
          'tabindex',
          window.innerWidth > BREAKPOINT_MD ? '0' : '-1'
        )
      );
    };

    window.addEventListener('resize', resetOnDesktop);

    first(focusable)?.addEventListener('focusout', focusLast);
    last(focusable)?.addEventListener('focusout', focusFirst);

    document.addEventListener('keydown', closeOnEsc);
    return () => {
      window.removeEventListener('resize', resetOnDesktop);
      document.removeEventListener('keydown', closeOnEsc);
      first(focusable)?.removeEventListener('focusout', focusLast);
      last(focusable)?.removeEventListener('focusout', focusFirst);
    };
  }, [closeNav, focusable, open]);

  return (
    <nav
      ref={navRef}
      className={classnames(
        'absolute top-0 z-20 overflow-y-auto',
        'transition-[right]',
        {
          'right-[-200vw] h-full': !open,
          'right-0 h-[100vh]': open,
        },
        'w-full p-4  border-neutral-700 dark:border-neutral-300',
        'bg-white dark:bg-black',
        'md:static md:border-r'
      )}
    >
      <NavLinks links={routerConfig} />
      <button
        ref={btnRef}
        className="absolute top-0 right-0 p-4 md:hidden"
        onClick={() => {
          closeNav();
        }}
      >
        <Icon name="cross" />
      </button>
    </nav>
  );
};
