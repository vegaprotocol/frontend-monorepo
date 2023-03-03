import { ProposalSignatureBundleNewAsset } from './signature-bundle-new';
import { ProposalSignatureBundleUpdateAsset } from './signature-bundle-update';
import type { Proposal, ProposalTerms } from '../tx-proposal';

interface ProposalSignatureBundleProps {
  id: string;
  type: 'NewAsset' | 'UpdateAsset';
  tx: ProposalTerms
}

/**
 * Some proposals, if enacted, generate a signature bundle.
 * The queries have to be split due to the way the API returns
 * errors, hence this slightly redundant feeling switcher.
 */
export const ProposalSignatureBundle = ({
  id,
  type,
  tx
}: ProposalSignatureBundleProps) => {
  return type === 'NewAsset' ? (
    <ProposalSignatureBundleNewAsset id={id} tx={tx} />
  ) : (
    <ProposalSignatureBundleUpdateAsset id={id} tx={tx} />
  );
};
