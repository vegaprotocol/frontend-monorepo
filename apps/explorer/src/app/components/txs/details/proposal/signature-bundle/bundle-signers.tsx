import { encodeListAssetBridgeTx } from '../../../../../lib/decoders/abis/list-asset';
import { recoverAddress } from 'ethers/lib/utils';
import { useExplorerBundleSignersQuery } from './__generated__/BundleSigners';
import type { ProposalTerms } from '../../tx-proposal';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';

function getSigners(
  unprefixedBundle: string,
  assetERC20: string,
  assetId: string,
  limit: string,
  threshold: string,
  nonce: string,
  func: string
) {
  const BRIDGE_ADDRESS = '0x7fe27d970bc8Afc3B11Cc8d9737bfB66B1efd799';

  const digest = encodeListAssetBridgeTx(
    {
      assetERC20,
      assetId,
      limit,
      threshold,
      nonce,
    },
    BRIDGE_ADDRESS
  );

  const sigs = unprefixedBundle.match(/.{1,130}/g);
  const hexSigs = sigs?.map((s) => `0x${s.toString()}`);

  if (!hexSigs) {
    return null;
  }

  return hexSigs.map((h) => recoverAddress(digest, h));
}

export interface BundleSignersProps {
  signatures: string;
  nonce: string;
  tx?: ProposalTerms
  id: string
}

export const BundleSigners = ({
  signatures,
  nonce,
  tx,
  id
}: BundleSignersProps) => {
  const { data, loading, error } = useExplorerBundleSignersQuery()

  if (!id || !tx) {
    return null
  }
  const sigBundle = signatures.substring(2);

  const signers = getSigners(
    sigBundle,
    tx.newAsset?.changes?.erc20?.contractAddress || '',
    id,
    tx.newAsset?.changes?.erc20?.lifetimeLimit || '',
    tx.newAsset?.changes?.erc20?.withdrawThreshold || '',
    nonce,
    'list_asset'
  )

  return (
    <SyntaxHighlighter data={signatures} />
  );
};
