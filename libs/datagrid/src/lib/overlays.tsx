import { Button } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';

export const GridNowRowsOverlay = ({
  error,
  reload,
}: {
  error: Error | undefined;
  reload?: () => void;
}) => {
  console.log(error);
  if (!error) {
    return <p>{t('No data')}</p>;
  }

  return <GridErrorOverlay error={error} reload={reload} />;
};

export const GridErrorOverlay = ({
  error,
  reload,
}: {
  error: Error | undefined;
  reload?: () => void;
}) => {
  if (!error) {
    return <p>{t("Something wen't wrong")}</p>;
  }

  return (
    <div>
      <p>Error</p>
      {reload && error.message === 'Timeout exceeded' && (
        <Button
          size="sm"
          className="pointer-events-auto"
          type="button"
          onClick={reload}
        >
          {t('Try again')}
        </Button>
      )}
    </div>
  );
};
