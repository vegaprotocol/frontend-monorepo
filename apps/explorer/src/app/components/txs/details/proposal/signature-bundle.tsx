import { t } from '@vegaprotocol/react-helpers';
import { Button, Icon } from '@vegaprotocol/ui-toolkit';
import ProposalLink from '../../../links/proposal-link/proposal-link';
import {
  useExplorerNewAssetSignatureBundleQuery,
  useExplorerUpdateAssetSignatureBundleQuery,
} from './__generated__/SignatureBundle';
import { JsonViewerDialog } from '../../../dialogs/json-viewer-dialog';
import { useState } from 'react';
import Hash from '../../../links/hash';

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
 * Some proposals, if enacted, generate a signature bundle
 */
export const ProposalSignatureBundle = ({
  id,
  type,
}: ProposalSignatureBundleProps) => {
  return type == 'NewAsset' ? (
    <ProposalSignatureBundleNewAsset id={id} />
  ) : (
    <ProposalSignatureBundleUpdateAsset id={id} />
  );
};

interface ProposalSignatureBundleByTypeProps {
  id: string;
}

type ProposalSignatureDialog = {
  open: boolean;
  title: string;
  content: unknown;
};
export const ProposalSignatureBundleNewAsset = ({
  id,
}: ProposalSignatureBundleByTypeProps) => {
  const { data, error, loading } = useExplorerNewAssetSignatureBundleQuery({
    variables: {
      id,
    },
  });

  if (data?.erc20ListAssetBundle?.signatures) {
    return (
      <div className="mt-5 w-auto max-w-lg border-2 border-solid border-vega-light-100 dark:border-vega-dark-200 p-5">
        <Icon className="float-left mr-3" name={'clean'} />
        <h1 className="text-xl">{t('Signature bundle generated')}</h1>
        {data.asset?.status}

        <details className="my-5">
          <summary>See details</summary>

          <div className="ml-4">
            <h2 className="text-lg mt-2 mb-2">{t('Signatures')}</h2>
            <p>
              <textarea
                className="font-mono bg-neutral-300 text-[11px] leading-3 text-gray-900 w-full p-2 max-w-[615px]"
                readOnly={true}
                rows={12}
                cols={120}
                value={data.erc20ListAssetBundle.signatures}
              />
            </p>

            <h2 className="text-lg mt-5 mb-2">{t('Nonce')}</h2>
            <p>
              <textarea
                className="font-mono bg-neutral-300 text-[11px] leading-3 text-gray-900 w-full p-2 max-w-[615px]"
                readOnly={true}
                rows={2}
                cols={120}
                value={data.erc20ListAssetBundle.nonce}
              />
            </p>
          </div>
        </details>

        <p>
          <ProposalLink
            id={id}
            text={t('Visit our Governance site to submit this')}
          />
        </p>
      </div>
    );
  } else {
    return null;
  }
};

export const ProposalSignatureBundleUpdateAsset = ({
  id,
}: ProposalSignatureBundleByTypeProps) => {
  const { data, error, loading } = useExplorerUpdateAssetSignatureBundleQuery({
    variables: {
      id,
    },
  });

  if (data?.erc20SetAssetLimitsBundle?.signatures) {
    return <p>{data.erc20SetAssetLimitsBundle.signatures}</p>;
  } else {
    return null;
  }
};
