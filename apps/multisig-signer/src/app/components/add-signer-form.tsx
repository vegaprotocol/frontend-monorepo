import { useState } from 'react';
import { gql, useApolloClient } from '@apollo/client';
import { captureException } from '@sentry/react';
import { useEthereumTransaction } from '@vegaprotocol/web3';
import { FormGroup, Input, Button } from '@vegaprotocol/ui-toolkit';
import { useContracts } from '../config/contracts/contracts-context';
import type { FormEvent } from 'react';
import type {
  AddSignerBundle,
  AddSignerBundleVariables,
} from './__generated__/AddSignerBundle';

const ADD_SIGNER_QUERY = gql`
  query AddSignerBundle($nodeId: ID!) {
    erc20MultiSigSignerAddedBundles(nodeId: $nodeId) {
      edges {
        node {
          newSigner
          nonce
          signatures
        }
      }
    }
  }
`;

export const AddSignerForm = () => {
  const { query } = useApolloClient();
  const { multisig } = useContracts();
  const { perform, Dialog } = useEthereumTransaction(multisig, 'add_signer');
  const [address, setAddress] = useState('');
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (address === '') {
        return;
      }
      const res = await query<AddSignerBundle, AddSignerBundleVariables>({
        query: ADD_SIGNER_QUERY,
        variables: { nodeId: address },
      });

      const bundle =
        res.data?.erc20MultiSigSignerAddedBundles?.edges?.[0]?.node;

      if (!bundle) {
        throw new Error('Could not retrieve multisig signer bundle');
      }

      // @ts-ignore need to check this one
      await perform(bundle.newSigner, bundle.nonce, bundle.signatures);
    } catch (err) {
      captureException(err);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <FormGroup
        label="Add signer"
        labelFor="add-signer-input"
        labelDescription="Public key of the signer to add"
        className="max-w-xl"
      >
        <div className="grid grid-cols-[1fr,auto] gap-2">
          <Input
            id="add-signer-input"
            onChange={(e) => setAddress(e.target.value)}
            data-testid="add-signer-input-input"
          />
          <Button type="submit" data-testid="add-signer-submit">
            Add
          </Button>
        </div>
      </FormGroup>
      <Dialog />
    </form>
  );
};
