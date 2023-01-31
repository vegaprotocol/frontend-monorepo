import React from 'react';
import { Routes } from '../../../routes/route-names';
import { useExplorerNodeQuery } from './__generated__/Node';
import { Link } from 'react-router-dom';

import type { ComponentProps } from 'react';
import Hash from '../hash';

export type NodeLinkProps = Partial<ComponentProps<typeof Link>> & {
  id: string;
};

const NodeLink = ({ id, ...props }: NodeLinkProps) => {
  const { data } = useExplorerNodeQuery({
    variables: { id },
  });

  let label: string = id;

  if (data?.node?.name) {
    label = data.node.name;
  }

  return (
    <Link className="underline" {...props} to={`/${Routes.VALIDATORS}#${id}`}>
      <Hash text={label} />
    </Link>
  );
};

export default NodeLink;
