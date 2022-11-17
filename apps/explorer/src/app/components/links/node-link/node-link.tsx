import React from 'react';
import { Routes } from '../../../routes/route-names';
import { useExplorerNodeQuery } from './__generated__/Node';
import { Link } from 'react-router-dom';

export type NodeLinkProps = {
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
    <Link className="underline" to={`/${Routes.VALIDATORS}#${id}`} {...props}>
      {label}
    </Link>
  );
};

export default NodeLink;
