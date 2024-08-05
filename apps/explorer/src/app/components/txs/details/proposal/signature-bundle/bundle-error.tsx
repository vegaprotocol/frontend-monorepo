import type { ApolloError } from '@apollo/client';
import type { AssetStatus } from '@vegaprotocol/types';

import { t } from '@vegaprotocol/i18n';
import { IconForBundleStatus } from './bundle-icon';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';

export interface BundleErrorProps {
  status?: AssetStatus;
  error?: ApolloError;
}

/**
 * Renders if a proposal signature bundle cannot be found.
 * It is also possible that a data node has dropped the bundle
 * from its retention so there is a backup case where we check
 * the status - if it's already enabled, pretend this isn't an error
 */
export const BundleError = ({ status, error }: BundleErrorProps) => {
  if (!status || status === 'STATUS_PROPOSED' || status === 'STATUS_REJECTED') {
    // If there is no status, there is no asset and no bundle - ProposalDetails will make it clear why.
    // If the asset exists but is just proposed, or rejected, there won't be a signature bundle yet
    return null;
  }
  return (
    <div className="w-auto max-w-lg border-2 border-solid border-gs-100  p-5 mt-5">
      <IconForBundleStatus status={status} />
      <h1 className="text-xl pb-1">{t('No signature bundle')}</h1>

      <p className="my-4">
        {t(
          'No signature bundle was generated as a result of this proposal, or the signature bundle could not be found.'
        )}
      </p>

      <div>
        {status === 'STATUS_ENABLED' ? (
          t('Asset already enabled')
        ) : (
          <details>
            <summary>{t('Show server error message')}</summary>

            <SyntaxHighlighter data={error} size="smaller" />
          </details>
        )}
      </div>
    </div>
  );
};
