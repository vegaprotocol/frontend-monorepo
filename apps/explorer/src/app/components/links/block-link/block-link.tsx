import React from 'react';
import { Routes } from '../../../routes/route-names';
import { Link } from 'react-router-dom';

import type { ComponentProps } from 'react';

export type BlockLinkProps = Partial<ComponentProps<typeof Link>> & {
  height: string;
};

const BlockLink = ({ height, ...props }: BlockLinkProps) => {
  return (
    <Link className="underline" {...props} to={`/${Routes.BLOCKS}/${height}`}>
      {height}
    </Link>
  );
};

export default BlockLink;
