import React from 'react';
import { Routes } from '../../../routes/route-names';
import { useExplorerAssetQuery } from './__generated__/Asset';
import { Link } from 'react-router-dom';

import type { ComponentProps } from 'react';
import Hash from '../hash';

export type AssetLinkProps = Partial<ComponentProps<typeof Link>> & {
  id: string;
};

/**
 * Given an asset ID, it will fetch the asset name and show that,
 * with a link to the assets list. If the name does not come back
 * it will use the ID instead.
 */
const AssetLink = ({ id, ...props }: AssetLinkProps) => {
  const { data } = useExplorerAssetQuery({
    variables: { id },
  });

  let label: string = id;

  if (data?.asset?.name) {
    label = data.asset.name;
  }

  return (
    <Link className="underline" {...props} to={`/${Routes.ASSETS}#${id}`}>
      <Hash text={label} />
    </Link>
  );
};

export default AssetLink;
