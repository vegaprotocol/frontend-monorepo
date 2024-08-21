import { truncateMiddle } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';

import { useNetwork } from '@/contexts/network/network-context';

import { CopyWithCheckmark } from '../../copy-with-check';
import { ExternalLink } from '../../external-link';
import { KeyIcon } from '../vega-icon';

export const locators = {
  keyName: 'vega-key-name',
  explorerLink: 'vega-explorer-link',
};

export interface VegaKeyProperties {
  publicKey: string;
  name?: string;
  children?: ReactNode;
  actions?: ReactNode;
}

export const VegaKey = ({
  publicKey,
  name,
  children,
  actions,
}: VegaKeyProperties) => {
  const { network } = useNetwork();

  return (
    <div className="flex items-center justify-between h-12">
      <div className="flex items-center">
        <KeyIcon publicKey={publicKey} />
        <div className="ml-4">
          {name ? (
            <div
              data-testid={locators.keyName}
              className="text-left text-surface-0-fg"
              style={{ wordBreak: 'break-word' }}
            >
              {name}
            </div>
          ) : null}
          <div>
            <ExternalLink
              className="text-surface-0-fg-muted"
              data-testid={locators.explorerLink}
              href={`${network.explorer}/parties/${publicKey}`}
            >
              {truncateMiddle(publicKey)}
            </ExternalLink>
            <CopyWithCheckmark text={publicKey} />
            {actions}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};
