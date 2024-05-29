import React from 'react';
import { Routes } from '../../../routes/route-names';
import { Link } from 'react-router-dom';

import type { ComponentProps } from 'react';
import Hash from '../hash';
import { useTendermintValidators } from '../../../hooks/use-tendermint-validators';
import { useExplorerNodesQuery } from '../../../routes/validators/__generated__/Nodes';

export type TendermintNodeLinkProps = Partial<ComponentProps<typeof Link>> & {
  id: string;
};

/**
 * Given a Tendermint address, renders the name of a validator (or the key if no name is available)
 * Both queries are required, as the Tendermint address is not stored in the Vega node data, so we
 * need to use the Tendermint address to find the Tendermint pubkey to correlate with the Vega node.
 *
 * Both queries have forced caching on, which was quicker than adding a context just for this data
 * and works fine.
 */
export const TendermintNodeLink = ({
  id,
  ...props
}: TendermintNodeLinkProps) => {
  const { data: tmData } = useTendermintValidators(0, { cache: 'force-cache' });
  const { data: vegaData } = useExplorerNodesQuery({
    fetchPolicy: 'cache-first',
  });

  let label: string = id;

  if (tmData?.result.validators && vegaData?.nodesConnection.edges?.length) {
    const tendermintValidatorDetails = tmData.result.validators.find(
      (v) => v.address === id
    );
    if (tendermintValidatorDetails) {
      const vegaNodeByTendermintPubkey = vegaData.nodesConnection.edges.find(
        (n) => n?.node?.tmPubkey === tendermintValidatorDetails.pub_key.value
      );
      if (vegaNodeByTendermintPubkey) {
        label =
          vegaNodeByTendermintPubkey.node?.name ||
          tendermintValidatorDetails.pub_key.value;
      }
    }
  }

  return (
    <Link className="underline" {...props} to={`/${Routes.VALIDATORS}#${id}`}>
      <Hash text={label} />
    </Link>
  );
};

export default TendermintNodeLink;
