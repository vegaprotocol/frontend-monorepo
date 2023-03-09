import { Loader } from '@vegaprotocol/ui-toolkit';
import { BundleError } from './signature-bundle/bundle-error';
import { BundleExists } from './signature-bundle/bundle-exists';
import { useExplorerNewAssetSignatureBundleQuery } from './__generated__/SignatureBundle';

export interface ProposalSignatureBundleByTypeProps {
  id: string;
}

/**
 * If a proposal needs a signature bundle, AND that signature bundle exists
 * AND that proposal is a New Asset Proposal, render an overview of the
 * signature bundle. Or an error.
 *
 * There is an almost identical component, ProposalSignatureBundleUpdateAsset
 */
export const ProposalSignatureBundleNewAsset = ({
  id,
}: ProposalSignatureBundleByTypeProps) => {
  const { data, error, loading } = useExplorerNewAssetSignatureBundleQuery({
    variables: {
      id,
    },
  });

  if (loading) {
    return <Loader />;
  }

  if (data?.erc20ListAssetBundle?.signatures) {
    return (
      <BundleExists
        signatures={data.erc20ListAssetBundle.signatures}
        nonce={data.erc20ListAssetBundle.nonce}
        status={data.asset?.status}
        proposalId={id}
      />
    );
  } else {
    return <BundleError status={data?.asset?.status} error={error} />;
  }
};
