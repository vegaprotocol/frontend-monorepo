import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';
import * as Dialog from '@radix-ui/react-dialog';
import { EthWallet } from '../eth-wallet';
import { VegaWallet } from '../vega-wallet';
import { useTranslation } from 'react-i18next';

interface Route {
  name: string;
  path: string;
}

const DrawerSection = ({ children }: { children: React.ReactNode }) => (
  <div className="px-4 my-4">{children}</div>
);

const IconLine = ({ inverted }: { inverted: boolean }) => (
  <span className={`block w-6 h-[2px] ${inverted ? 'bg-black' : 'bg-white'}`} />
);

const DrawerNavLinks = ({
  isInverted,
  routes,
}: {
  isInverted?: boolean;
  routes: Route[];
}) => {
  const { appDispatch } = useAppState();
  const { t } = useTranslation();
  const linkProps = {
    end: true,
    onClick: () =>
      appDispatch({ type: AppStateActionType.SET_DRAWER, isOpen: false }),
  };
  const navClasses = classNames('flex flex-col');

  return (
    <nav className={navClasses}>
      {routes.map(({ name, path }) => {
        return (
          <NavLink
            {...linkProps}
            to={{ pathname: path }}
            className={({ isActive }) =>
              classNames({
                'bg-vega-yellow text-black': !isInverted && isActive,
                'bg-transparent text-white hover:text-vega-yellow':
                  !isInverted && !isActive,
                'bg-black text-white': isInverted && isActive,
                'bg-transparent text-black hover:text-white':
                  isInverted && !isActive,
                'border-t border-white p-4': true,
              })
            }
          >
            {t(name)}
          </NavLink>
        );
      })}
    </nav>
  );
};

export const NavDrawer = ({
  inverted,
  routes,
}: {
  inverted: boolean;
  routes: Route[];
}) => {
  const { appState, appDispatch } = useAppState();

  const drawerContentClasses = classNames(
    'drawer-content', // needed for css animation
    // Positions the modal in the center of screen
    'fixed w-[80vw] max-w-[420px] top-0 right-0',
    'flex flex-col flex-nowrap justify-between h-full bg-banner overflow-y-scroll border-l border-white',
    'bg-black text-neutral-200'
  );
  return (
    <>
      <button
        onClick={() =>
          appDispatch({
            type: AppStateActionType.SET_DRAWER,
            isOpen: true,
          })
        }
        className="flex flex-col flex-nowrap gap-1"
      >
        <IconLine inverted={inverted} />
        <IconLine inverted={inverted} />
        <IconLine inverted={inverted} />
      </button>

      <Dialog.Root
        open={appState.drawerOpen}
        onOpenChange={(isOpen) =>
          appDispatch({
            type: AppStateActionType.SET_DRAWER,
            isOpen,
          })
        }
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-white/15" />
          <Dialog.Content className={drawerContentClasses}>
            <div>
              <DrawerSection>
                <EthWallet />
              </DrawerSection>
              <DrawerSection>
                <VegaWallet />
              </DrawerSection>
            </div>
            <DrawerNavLinks routes={routes} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
