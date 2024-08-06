import { t } from '@vegaprotocol/i18n';
import { ProposalLink } from '../../../../links/proposal-link/proposal-link';
import { IconForBundleStatus } from './bundle-icon';
import type { AssetStatus } from '@vegaprotocol/types';
import type { ProposalTerms } from '../../tx-proposal';
import { BundleSigners } from './bundle-signers';

export interface BundleExistsProps {
  signatures: string;
  nonce: string;
  status?: AssetStatus;
  assetAddress: string;
  proposalId: string;
  tx?: ProposalTerms['newAsset'] | ProposalTerms['updateAsset'];
}

/**
 * If a proposal needs a signature bundle, AND that signature bundle exists,
 * this component renders that signature bundle.
 *
 */
export const BundleExists = ({
  signatures,
  nonce,
  status,
  proposalId,
  assetAddress,
  tx,
}: BundleExistsProps) => {
  // Note if this is wrong, the wrong decoder will be used which will give incorrect data

  return (
    <div className="w-auto h-10 max-w-lg border-2 border-solid border-gs-100  p-5 mt-5">
      <IconForBundleStatus status={status} />
      <h1 className="text-xl pb-1">
        {status === 'STATUS_ENABLED'
          ? t('Asset added to bridge')
          : t('Signature bundle generated')}
      </h1>

      <details className="mt-5">
        <summary>{t('Signature bundle details')}</summary>

        <div className="ml-4">
          <h2 className="text-lg mt-2 mb-2">{t('Signatures')}</h2>
          <p>
            <textarea
              className="font-mono bg-gs-300 text-[11px] leading-3 text-gray-900 w-full p-2 max-w-[615px]"
              readOnly={true}
              rows={12}
              cols={120}
              value={signatures}
            />
          </p>

          <h2 className="text-lg mt-5 mb-2">{t('Nonce')}</h2>

          <p>
            <textarea
              className="font-mono bg-gs-300 text-[11px] leading-3 text-gray-900 w-full p-2 max-w-[615px]"
              readOnly={true}
              rows={2}
              cols={120}
              value={nonce}
            />
          </p>
        </div>
      </details>

      <BundleSigners
        signatures={signatures}
        nonce={nonce}
        tx={tx}
        id={proposalId}
        assetAddress={assetAddress}
      />

      {status !== 'STATUS_ENABLED' ? (
        <p className="mt-5">
          <ProposalLink
            id={proposalId}
            text={t('Visit our Governance site to submit this')}
          />
        </p>
      ) : null}
    </div>
  );
};
