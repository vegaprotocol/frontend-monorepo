import { t } from '@vegaprotocol/i18n';
import { headerClasses, wrapperClasses } from '../transfer-details';
import { Icon, Loader } from '@vegaprotocol/ui-toolkit';
import type { ApolloError } from '@apollo/client';

interface TransferStatusProps {
  status: string;
  error: ApolloError | undefined;
  loading: boolean;
}

/**
 * Renderer for a transfer. These can vary quite
 * widely, essentially every field can be null.
 *
 * @param transfer A recurring transfer object
 */
export function TransferStatusView({ status, loading }: TransferStatusProps) {
  if (!status) {
    return null;
  }

  return (
    <div className={wrapperClasses}>
      <h2 className={headerClasses}>{t('Status')}</h2>
      <div className="relative block rounded-lg py-6 text-center p-6">
        {loading ? (
          <Loader />
        ) : (
          <>
            <p className="leading-10 my-2">
              <Icon name="tick" className="text-green-500" />
            </p>
            <p className="leading-10 my-2">{status}</p>
          </>
        )}
      </div>
    </div>
  );
}
