import type { ApolloError } from '@apollo/client';
import type { AssetStatus } from '@vegaprotocol/types';

import { t } from '@vegaprotocol/i18n';
import Hash from '../../../../links/hash';
import { IconForBundleStatus } from './bundle-icon';

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
  return (
    <div className="w-auto max-w-lg border-2 border-solid border-vega-light-100 dark:border-vega-dark-200 p-5 mt-5">
      <IconForBundleStatus status={status} />
      <h1 className="text-xl pb-1">{t('No signature bundle found')}</h1>

      <p>
        {status === 'STATUS_ENABLED' ? (
          t('Asset already enabled')
        ) : (
          <Hash text={error ? error.message : t('No bundle for proposal ID')} />
        )}
      </p>
    </div>
  );
};
