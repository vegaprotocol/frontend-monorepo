import { useState } from 'react';
import { gql, useApolloClient } from '@apollo/client';
import { captureException } from '@sentry/react';
import { useEthereumTransaction } from '@vegaprotocol/web3';
import { FormGroup, Input, Button } from '@vegaprotocol/ui-toolkit';
import { useContracts } from '../../config/contracts/contracts-context';
import type { FormEvent } from 'react';
import type {
  RemoveSignerBundle,
  RemoveSignerBundleVariables,
} from '../__generated__/RemoveSignerBundle';

const REMOVE_SIGNER_QUERY = gql`
  query RemoveSignerBundle($nodeId: ID!) {
    erc20MultiSigSignerRemovedBundles(nodeId: $nodeId) {
      edges {
        node {
          oldSigner
          nonce
          signatures
        }
      }
    }
  }
`;

export const RemoveSignerForm = () => {
  const { query } = useApolloClient();
  const { multisig } = useContracts();
  const { perform, Dialog } = useEthereumTransaction(multisig, 'remove_signer');
  const [address, setAddress] = useState('');
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (address === '') {
        return;
      }
      const res = await query<RemoveSignerBundle, RemoveSignerBundleVariables>({
        query: REMOVE_SIGNER_QUERY,
        variables: { nodeId: address },
      });

      const bundle =
        res.data?.erc20MultiSigSignerRemovedBundles?.edges?.[0]?.node;

      if (!bundle) {
        throw new Error('Could not retrieve multisig signer bundle');
      }

      // @ts-ignore need to check this one
      await perform(bundle.oldSigner, bundle.nonce, bundle.signatures);
    } catch (err) {
      captureException(err);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <FormGroup
        label="Remove signer"
        labelFor="remove-signer-input"
        labelDescription="Public key of the signer to remove"
        className="max-w-xl"
      >
        <div className="grid grid-cols-[1fr,auto] gap-2">
          <Input
            id="remove-signer-input"
            onChange={(e) => setAddress(e.target.value)}
            data-testid="remove-signer-input-input"
          />
          <Button type="submit" data-testid="remove-signer-submit">
            Remove
          </Button>
        </div>
      </FormGroup>
      <Dialog />
    </form>
  );
};
