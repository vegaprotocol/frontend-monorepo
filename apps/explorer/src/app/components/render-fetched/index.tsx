import { t } from '@vegaprotocol/i18n';
import { StatusMessage } from '../status-message';

interface RenderFetchedProps {
  children: React.ReactElement;
  error: Error | undefined;
  loading: boolean | undefined;
  className?: string;
  errorMessage?: string;
}

export const RenderFetched = ({
  error,
  loading,
  children,
  className,
  errorMessage = t('Error retrieving data'),
}: RenderFetchedProps) => {
  if (loading) {
    return (
      <StatusMessage className={className}>{t('Loading...')}</StatusMessage>
    );
  }

  if (error) {
    return <StatusMessage className={className}>{errorMessage}</StatusMessage>;
  }

  return children;
};
