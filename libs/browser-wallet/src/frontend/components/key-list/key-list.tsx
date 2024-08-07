import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

import type { Key } from '@/types/backend';

import { FULL_ROUTES } from '../../routes/route-names';
import { ChevronRight } from '../icons/chevron-right';
import { VegaKey } from '../keys/vega-key';
import { List } from '../list';
import { SubHeader } from '../sub-header';

export const locators = {
  walletsSignMessageButton: 'sign-message-button',
  viewDetails: (keyName: string) => `${keyName}-view-details`,
};

export interface KeyListProperties {
  keys: Key[];
  renderActions?: (key: Key) => ReactNode;
  onClick?: () => void;
}

export const KeyList = ({
  keys,
  renderActions,
  onClick,
}: KeyListProperties) => {
  return (
    <section className="text-base mt-6">
      <SubHeader content="Keys" />
      <List<Key>
        className="mt-2"
        idProp="publicKey"
        items={keys}
        renderItem={(k) => (
          <VegaKey
            publicKey={k.publicKey}
            name={k.name}
            actions={renderActions?.(k)}
          >
            <NavLink
              onClick={onClick}
              to={{ pathname: `${FULL_ROUTES.wallets}/${k.publicKey}` }}
              data-testid={locators.viewDetails(k.name)}
              className="hover:bg-vega-dark-200 w-12 h-full border-l border-1 border-vega-dark-150 flex items-center justify-center"
            >
              <ChevronRight />
            </NavLink>
          </VegaKey>
        )}
      />
    </section>
  );
};
