import { Button } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';

type DataGridNoRowsOverlayProps = {
  message?: string;
  error: Error | undefined;
  reload?: () => void;
};

export const DataGridNoRowsOverlay = ({
  message,
  error,
  reload,
}: DataGridNoRowsOverlayProps) => {
  if (!error) {
    return (
      <p data-testid="datagrid-overlay-no-data">
        {message ? message : t('No data')}
      </p>
    );
  }

  return <GridErrorOverlay error={error} reload={reload} />;
};

export const GridErrorOverlay = ({
  error,
  reload,
}: DataGridNoRowsOverlayProps) => {
  return (
    <div data-testid="datagrid-overlay-error">
      {error ? (
        <>
          <p>{error.message}</p>
          {reload && error.message === 'Timeout exceeded' && (
            <Button size="sm" type="button" onClick={reload}>
              {t('Try again')}
            </Button>
          )}
        </>
      ) : (
        <p>{t("Something wen't wrong")}</p>
      )}
    </div>
  );
};
