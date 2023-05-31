import { Button } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';

type GridNoRowsOverlayProps = {
  message?: string;
  error: Error | undefined;
  reload?: () => void;
};

export const GridNowRowsOverlay = ({
  message,
  error,
  reload,
}: GridNoRowsOverlayProps) => {
  if (!error) {
    return <p>{message ? message : t('No data')}</p>;
  }

  return <GridErrorOverlay error={error} reload={reload} />;
};

export const GridErrorOverlay = ({ error, reload }: GridNoRowsOverlayProps) => {
  if (!error) {
    return <p>{t("Something wen't wrong")}</p>;
  }

  return (
    <div>
      <p>{error.message}</p>
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
