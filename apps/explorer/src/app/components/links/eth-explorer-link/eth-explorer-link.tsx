import React from 'react';

import { DATA_SOURCES } from '../../../config';

export enum EthExplorerLinkTypes {
  block = 'block',
  address = 'address',
  tx = 'tx',
}

export type EthExplorerLinkProps = Partial<typeof HTMLAnchorElement> & {
  id: string;
  type: EthExplorerLinkTypes;
};

export const EthExplorerLink = ({
  id,
  type,
  ...props
}: EthExplorerLinkProps) => {
  const link = `${DATA_SOURCES.ethExplorerUrl}/${type}/${id}`;
  return (
    <a
      className="underline external"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
      href={link}
    >
      {id}
    </a>
  );
};
