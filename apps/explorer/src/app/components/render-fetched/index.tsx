import { t } from '@vegaprotocol/i18n';
import { Button } from '@vegaprotocol/ui-toolkit';
import { StatusMessage } from '../status-message';

interface RenderFetchedProps {
  children: React.ReactElement;
  error: Error | undefined;
  loading: boolean | undefined;
  className?: string;
  errorMessage?: string;
  refetch?: () => void;
}

export const RenderFetched = ({
  error,
  loading,
  children,
  className,
  errorMessage = t('Error retrieving data'),
  refetch,
}: RenderFetchedProps) => {
  if (loading) {
    return (
      <StatusMessage className={className}>{t('Loading...')}</StatusMessage>
    );
  }

  if (error) {
    return (
      <>
        <StatusMessage className={className}>{errorMessage}</StatusMessage>
        {refetch && (
          <Button
            onClick={() => {
              refetch();
            }}
          >
            {t('Try again')}
          </Button>
        )}
      </>
    );
  }

  return children;
};
