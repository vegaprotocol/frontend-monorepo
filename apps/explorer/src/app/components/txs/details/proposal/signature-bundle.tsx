import { ProposalSignatureBundleNewAsset } from './signature-bundle-new';
import { ProposalSignatureBundleUpdateAsset } from './signature-bundle-update';

export function format(date: string | undefined, def: string) {
  if (!date) {
    return def;
  }

  return new Date().toLocaleDateString() || def;
}

interface ProposalSignatureBundleProps {
  id: string;
  type: 'NewAsset' | 'UpdateAsset';
}

/**
 * Some proposals, if enacted, generate a signature bundle.
 * The queries have to be split due to the way the API returns
 * errors, hence this slightly redundant feeling switcher.
 */
export const ProposalSignatureBundle = ({
  id,
  type,
}: ProposalSignatureBundleProps) => {
  return type === 'NewAsset' ? (
    <ProposalSignatureBundleNewAsset id={id} />
  ) : (
    <ProposalSignatureBundleUpdateAsset id={id} />
  );
};
