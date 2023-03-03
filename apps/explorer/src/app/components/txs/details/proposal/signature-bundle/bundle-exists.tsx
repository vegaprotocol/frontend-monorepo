import { t } from '@vegaprotocol/i18n';
import ProposalLink from '../../../../links/proposal-link/proposal-link';
import { IconForBundleStatus } from './bundle-icon';
import { ProposalSignatureBundleDetails } from './details';
import type { AssetStatus } from '@vegaprotocol/types';
import type { ProposalTerms } from '../../tx-proposal';

export interface BundleExistsProps {
  signatures: string;
  nonce: string;
  status?: AssetStatus;
  proposalId: string;
  tx?: ProposalTerms
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
  tx
}: BundleExistsProps) => {
  return (
    <div className="w-auto max-w-lg border-2 border-solid border-vega-light-100 dark:border-vega-dark-200 p-5 mt-5">
      <IconForBundleStatus status={status} />
      <h1 className="text-xl pb-1">
        {status === 'STATUS_ENABLED'
          ? t('Asset added to bridge')
          : t('Signature bundle generated')}
      </h1>

      <ProposalSignatureBundleDetails signatures={signatures} nonce={nonce} tx={tx} />

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
