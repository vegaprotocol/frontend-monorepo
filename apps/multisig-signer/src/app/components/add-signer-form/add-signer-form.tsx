import { useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { captureException } from '@sentry/react';
import { t } from '@vegaprotocol/i18n';
import { useEthereumTransaction } from '@vegaprotocol/web3';
import {
  FormGroup,
  Input,
  Button,
  InputError,
  Loader,
} from '@vegaprotocol/ui-toolkit';
import { useContracts } from '../../config/contracts/contracts-context';
import { type FormEvent } from 'react';
import {
  type AddSignerBundle,
  type AddSignerBundleVariables,
} from '../__generated__/AddSignerBundle';
import { type MultisigControl } from '@vegaprotocol/smart-contracts';

export const ADD_SIGNER_QUERY = gql`
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
  const { multisig } = useContracts();
  const [address, setAddress] = useState('');
  const [bundleNotFound, setBundleNotFound] = useState(false);
  const [runQuery, { error, loading }] = useLazyQuery<
    AddSignerBundle,
    AddSignerBundleVariables
  >(ADD_SIGNER_QUERY);
  const { perform, Dialog } = useEthereumTransaction<
    MultisigControl,
    'add_signer'
  >(multisig, 'add_signer');
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBundleNotFound(false);
    try {
      if (address === '') {
        return;
      }
      const result = await runQuery({
        variables: { nodeId: address },
      });

      const bundle =
        result.data?.erc20MultiSigSignerAddedBundles?.edges?.[0]?.node;

      if (!bundle) {
        if (!error) {
          setBundleNotFound(true);
        }
        return;
      }

      await perform(bundle.newSigner, bundle.nonce, bundle.signatures);
    } catch (err: unknown) {
      captureException(err);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <FormGroup
        label={t('Add signer')}
        labelFor="add-signer-input"
        labelDescription={t(
          'Node ID of the signer to add to the multisig control'
        )}
        className="max-w-xl"
      >
        <div className="grid grid-cols-[1fr,auto] gap-2">
          <Input
            id="add-signer-input"
            onChange={(e) => setAddress(e.target.value)}
            data-testid="add-signer-input-input"
          />
          <Button
            type="submit"
            data-testid="add-signer-submit"
            disabled={loading}
          >
            {loading ? <Loader size="small" /> : t('Add')}
          </Button>
        </div>
        <div>
          {error && (
            <InputError intent="danger">
              {error?.message.includes('InvalidArgument')
                ? t('Invalid node ID')
                : error?.message}
            </InputError>
          )}
          {bundleNotFound && !error && (
            <InputError intent="danger">
              {t(
                'Bundle was not found, are you sure this validator needs to be added?'
              )}
            </InputError>
          )}
        </div>
      </FormGroup>
      <Dialog />
    </form>
  );
};
