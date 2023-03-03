import { Loader } from '@vegaprotocol/ui-toolkit';
import type { ProposalSignatureBundleByTypeProps } from './signature-bundle-new';
import { BundleError } from './signature-bundle/bundle-error';
import { BundleExists } from './signature-bundle/bundle-exists';
import { useExplorerUpdateAssetSignatureBundleQuery } from './__generated__/SignatureBundle';

/**
 * If a proposal needs a signature bundle, AND that signature bundle exists
 * AND that proposal is a Asset Limits Proposal, render an overview of the
 * signature bundle. Or an error.
 *
 * There is an almost identical component, ProposalSignatureBundleNewAsset
 */
export const ProposalSignatureBundleUpdateAsset = ({
  id,
}: ProposalSignatureBundleByTypeProps) => {
  const { data, error, loading } = useExplorerUpdateAssetSignatureBundleQuery({
    variables: {
      id,
    },
  });

  if (loading) {
    return <Loader />;
  }

  if (data?.erc20SetAssetLimitsBundle?.signatures) {
    return (
      <BundleExists
        signatures={data.erc20SetAssetLimitsBundle.signatures}
        nonce={data.erc20SetAssetLimitsBundle.nonce}
        status={data.asset?.status}
        proposalId={id}
      />
    );
  } else {
    return <BundleError status={data?.asset?.status} error={error} />;
  }
};
